import { Router, Request, Response } from 'express';
import { ItemInstance } from '../models/ItemInstance';
import { Product } from '../models/Product';
import { AuditLog } from '../models/AuditLog';
import { protect, authorize, ensureVerified, AuthRequest } from '../middleware/auth';
import { Types } from 'mongoose';
import { lookupLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';
import { validateRequest } from '../utils/validation';
import { sendError } from '../utils/errorResponse';

const router = Router();

const transferItemSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid item ID',
    }),
  }),
  body: z.object({
    toUserId: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Please provide a valid recipient user ID',
    }),
    location: z.string().optional(),
  }),
});

const updateItemStatusSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid item ID',
    }),
  }),
  body: z.object({
    status: z.string().refine((val) => ['manufactured', 'in_transit', 'listed', 'sold', 'recalled'].includes(val), {
      message: "Status must be one of: manufactured, in_transit, listed, sold, recalled",
    }),
    location: z.string().optional(),
  }),
});

const buyItemSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid item ID',
    }),
  }),
});

// @route   GET /api/items/verify/:serialNumber
// @desc    Public endpoint — verify item authenticity by serial number
router.get('/verify/:serialNumber', lookupLimiter, async (req: Request, res: Response, next) => {
  try {
    const item = await ItemInstance.findOne({ serialNumber: req.params.serialNumber })
      .populate('product', 'name description category sku imageUrl certificateUrl verifiedStatus')
      .populate('currentOwner', 'name role')
      .populate('journey.actor', 'name role');

    if (!item) {
      return sendError(res, 404, 'No item found with this serial number. It may be counterfeit or unregistered.');
    }

    const product = item.product as any;

    res.json({
      success: true,
      verified: product?.verifiedStatus === 'verified',
      item: {
        serialNumber: item.serialNumber,
        status: item.status,
        counterfeitRisk: item.counterfeitRisk,
        manufacturedAt: item.createdAt,
        product: {
          name: product?.name,
          description: product?.description,
          category: product?.category,
          sku: product?.sku,
          imageUrl: product?.imageUrl,
          certificateUrl: product?.certificateUrl,
          verifiedStatus: product?.verifiedStatus,
        },
        currentOwner: item.currentOwner,
        journey: item.journey,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/items/my
// @desc    Get items owned by the logged-in user
router.get('/my', protect, async (req: AuthRequest, res: Response, next) => {
  try {
    const items = await ItemInstance.find({ currentOwner: req.user?.id })
      .populate('product', 'name sku imageUrl category verifiedStatus')
      .sort({ updatedAt: -1 });

    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/items/:id/transfer
// @desc    Transfer item ownership (e.g. factory → seller, seller → buyer)
router.post('/:id/transfer', protect, ensureVerified, validateRequest(transferItemSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { toUserId, location } = req.body;

    const item = await ItemInstance.findById(req.params.id);
    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    // Only current owner can transfer
    if (item.currentOwner.toString() !== req.user?.id) {
      return sendError(res, 403, 'Only the current owner can transfer this item');
    }

    if (item.status === 'recalled') {
      return sendError(res, 400, 'Cannot transfer a recalled item');
    }

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    item.currentOwner = new Types.ObjectId(toUserId);
    item.status = 'in_transit';
    item.journey.push({
      location: location || 'Transfer Point',
      action: 'transferred',
      actor: new Types.ObjectId(req.user!.id),
      timestamp: new Date(),
      txHash,
    });

    await item.save();

    await AuditLog.create({
      action: 'ITEM_TRANSFERRED',
      actor: new Types.ObjectId(req.user!.id),
      targetType: 'item',
      targetId: item._id.toString(),
      details: `Item ${item.serialNumber} transferred to user ${toUserId}`,
    });

    res.json({ success: true, message: 'Item transferred successfully', item });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/items/:id/status
// @desc    Update item status (factory/seller/admin)
router.patch('/:id/status', protect, authorize('factory', 'seller', 'admin'), ensureVerified, validateRequest(updateItemStatusSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { status, location } = req.body;

    const item = await ItemInstance.findById(req.params.id);
    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    const product = await Product.findById(item.product);
    const isOwner = item.currentOwner.toString() === req.user!.id;
    const isResponsibleFactory = product && product.factory.toString() === req.user!.id;

    if (!isOwner && !isResponsibleFactory) {
      return sendError(res, 403, 'Access denied. You are not the owner or the factory responsible for this item.');
    }

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    item.status = status;
    item.journey.push({
      location: location || 'Status Update',
      action: `status_changed_to_${status}`,
      actor: new Types.ObjectId(req.user!.id),
      timestamp: new Date(),
      txHash,
    });

    await item.save();

    await AuditLog.create({
      action: 'ITEM_STATUS_UPDATED',
      actor: new Types.ObjectId(req.user!.id),
      targetType: 'item',
      targetId: item._id.toString(),
      details: `Item ${item.serialNumber} status changed to ${status}`,
    });

    res.json({ success: true, message: `Item status updated to ${status}`, item });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/items/product/:productId
// @desc    Get all items for a specific product (factory owner)
router.get('/product/:productId', protect, authorize('factory', 'admin'), ensureVerified, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.productId)) {
      return sendError(res, 400, 'Invalid product ID');
    }
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    // If factory, verify ownership
    if (req.user?.role === 'factory' && product.factory.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized to view these items');
    }

    const items = await ItemInstance.find({ product: req.params.productId })
      .populate('currentOwner', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/items/marketplace
// @desc    Get all items listed on the marketplace
router.get('/marketplace', protect, async (req: AuthRequest, res: Response, next) => {
  try {
    const items = await ItemInstance.find({ status: 'listed' })
      .populate('product', 'name description category sku imageUrl certificateUrl verifiedStatus')
      .populate('currentOwner', 'name email role')
      .sort({ updatedAt: -1 });

    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/items/:id/buy
// @desc    Purchase a listed item from the marketplace (buyer only)
router.post('/:id/buy', protect, authorize('buyer'), ensureVerified, validateRequest(buyItemSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const item = await ItemInstance.findById(req.params.id);
    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    if (item.status !== 'listed') {
      return sendError(res, 400, 'This item is not listed for sale');
    }

    if (item.currentOwner.toString() === req.user?.id) {
      return sendError(res, 400, 'You already own this item');
    }

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const oldOwnerId = item.currentOwner;
    item.currentOwner = new Types.ObjectId(req.user!.id);
    item.status = 'sold';
    item.journey.push({
      location: 'VeriChain Marketplace',
      action: 'purchased',
      actor: new Types.ObjectId(req.user!.id),
      timestamp: new Date(),
      txHash,
    });

    await item.save();

    // Create Audit Log
    await AuditLog.create({
      action: 'ITEM_PURCHASED',
      actor: new Types.ObjectId(req.user!.id),
      targetType: 'item',
      targetId: item._id.toString(),
      details: `Item ${item.serialNumber} purchased by buyer ${req.user!.id} from seller ${oldOwnerId}`,
    });

    res.json({ success: true, message: 'Item purchased successfully', item });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/items/:id
// @desc    Get item details by Mongo ID (Public)
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, 'Invalid item ID');
    }
    const item = await ItemInstance.findById(req.params.id)
      .populate({
        path: 'product',
        populate: { path: 'factory', select: 'name email role trustScore factoryDetails logoUrl verified' }
      })
      .populate('currentOwner', 'name email role trustScore logoUrl verified');

    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    const productInfo = item.product as any;
    const factoryInfo = productInfo?.factory;
    const sellerInfo = item.currentOwner;

    res.json({
      _id: item._id,
      product: productInfo,
      item: {
        _id: item._id,
        serialNumber: item.serialNumber,
        qrCodeUrl: item.qrCodeUrl,
        status: item.status,
        counterfeitRisk: item.counterfeitRisk,
        journey: item.journey,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      },
      factory: factoryInfo,
      seller: sellerInfo
    });
  } catch (error) {
    next(error);
  }
});

export default router;
