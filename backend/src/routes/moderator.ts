import { Router, Response } from 'express';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { ItemInstance } from '../models/ItemInstance';
import { Complaint } from '../models/Complaint';
import { AuditLog } from '../models/AuditLog';
import { protect, authorize, AuthRequest } from '../middleware/auth';
import { Types } from 'mongoose';

const router = Router();

// All moderator routes require authentication and moderator or admin role
router.use(protect, authorize('moderator', 'admin'));

// @route   GET /api/moderator/dashboard
// @desc    Moderator analytics
router.get('/dashboard', async (_req: AuthRequest, res: Response, next) => {
  try {
    const [
      pendingVerifications,
      openComplaints,
      flaggedListings,
    ] = await Promise.all([
      Product.countDocuments({ verifiedStatus: 'pending' }),
      Complaint.countDocuments({ status: { $in: ['pending', 'under_review'] } }),
      ItemInstance.countDocuments({ counterfeitRisk: { $in: ['medium', 'high'] } }),
    ]);

    res.json({
      success: true,
      analytics: {
        pendingVerifications,
        openComplaints,
        flaggedListings,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/moderator/products
// @desc    List product templates pending verification
router.get('/products', async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ verifiedStatus: 'pending' })
        .populate('factory', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Product.countDocuments({ verifiedStatus: 'pending' }),
    ]);

    res.json({
      success: true,
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/moderator/products/:id/verify
// @desc    Verify or reject a product template
router.patch('/products/:id/verify', async (req: AuthRequest, res: Response, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }
    const { verifiedStatus } = req.body;

    if (!verifiedStatus || !['verified', 'rejected'].includes(verifiedStatus)) {
      return res.status(400).json({
        success: false,
        message: 'verifiedStatus must be "verified" or "rejected"',
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product template not found' });
    }

    product.verifiedStatus = verifiedStatus;
    await product.save();

    await AuditLog.create({
      action: `PRODUCT_${verifiedStatus.toUpperCase()}`,
      actor: new Types.ObjectId(req.user!.id),
      targetType: 'product',
      targetId: product._id.toString(),
      details: `Product template "${product.name}" (SKU: ${product.sku}) verified status set to "${verifiedStatus}" by moderator`,
    });

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/moderator/fake-listings
// @desc    List flagged item instances with medium or high counterfeit risk
router.get('/fake-listings', async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ItemInstance.find({ counterfeitRisk: { $in: ['medium', 'high'] } })
        .populate('product', 'name sku category verifiedStatus')
        .populate('currentOwner', 'name email role')
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 }),
      ItemInstance.countDocuments({ counterfeitRisk: { $in: ['medium', 'high'] } }),
    ]);

    res.json({
      success: true,
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/moderator/items/:id/risk
// @desc    Modify counterfeit risk or status of an item
router.patch('/items/:id/risk', async (req: AuthRequest, res: Response, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid item ID' });
    }
    const { counterfeitRisk, status } = req.body;

    const item = await ItemInstance.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Product item instance not found' });
    }

    if (counterfeitRisk) {
      if (!['low', 'medium', 'high'].includes(counterfeitRisk)) {
        return res.status(400).json({ success: false, message: 'Invalid counterfeitRisk value' });
      }
      item.counterfeitRisk = counterfeitRisk;
    }

    if (status) {
      if (!['manufactured', 'in_transit', 'listed', 'sold', 'recalled'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid item status value' });
      }
      item.status = status;
    }

    await item.save();

    await AuditLog.create({
      action: 'ITEM_MODERATED',
      actor: new Types.ObjectId(req.user!.id),
      targetType: 'item',
      targetId: item._id.toString(),
      details: `Item "${item.serialNumber}" updated by moderator (risk: ${item.counterfeitRisk}, status: ${item.status})`,
    });

    res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
});

export default router;
