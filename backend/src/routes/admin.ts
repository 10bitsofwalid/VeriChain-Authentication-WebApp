import { Router, Response } from 'express';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { ItemInstance } from '../models/ItemInstance';
import { AuditLog } from '../models/AuditLog';
import { Complaint } from '../models/Complaint';
import { protect, authorize, AuthRequest } from '../middleware/auth';
import { Types } from 'mongoose';

const router = Router();

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

// @route   GET /api/admin/users
// @desc    List all users (paginated)
router.get('/users', async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const roleFilter = req.query.role ? { role: req.query.role } : {};
    const verifiedFilter = req.query.verified !== undefined
      ? { verified: req.query.verified === 'true' }
      : {};

    const filter = { ...roleFilter, ...verifiedFilter };

    const [users, total] = await Promise.all([
      User.find(filter).select('-passwordHash').skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/admin/users/:id/verify
// @desc    Verify or reject a seller/factory account
router.patch('/users/:id/verify', async (req: AuthRequest, res: Response, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    const { verified } = req.body;
    if (typeof verified !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Please provide a boolean `verified` field' });
    }

    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.verified = verified;
    await user.save();

    await AuditLog.create({
      action: verified ? 'USER_VERIFIED' : 'USER_REJECTED',
      actor: new Types.ObjectId(req.user!.id),
      targetType: 'user',
      targetId: user._id.toString(),
      details: `${user.role} account "${user.name}" ${verified ? 'verified' : 'rejected'} by admin`,
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/audit-logs
// @desc    View audit trail
router.get('/audit-logs', async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate('actor', 'name email role')
        .skip(skip).limit(limit)
        .sort({ timestamp: -1 }),
      AuditLog.countDocuments(),
    ]);

    res.json({
      success: true,
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/products
// @desc    List all products (with optional verifiedStatus filter)
router.get('/products', async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.verifiedStatus) {
      filter.verifiedStatus = req.query.verifiedStatus;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('factory', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Product.countDocuments(filter),
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

// @route   PATCH /api/admin/products/:id/verify
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
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.verifiedStatus = verifiedStatus;
    await product.save();

    await AuditLog.create({
      action: `PRODUCT_${verifiedStatus.toUpperCase()}`,
      actor: new Types.ObjectId(req.user!.id),
      targetType: 'product',
      targetId: product._id.toString(),
      details: `Product "${product.name}" (SKU: ${product.sku}) ${verifiedStatus} by admin`,
    });

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/dashboard
// @desc    System-wide analytics
router.get('/dashboard', async (_req: AuthRequest, res: Response, next) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalItems,
      pendingVerifications,
      openComplaints,
      roleBreakdown,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      ItemInstance.countDocuments(),
      User.countDocuments({ verified: false }),
      Complaint.countDocuments({ status: { $in: ['pending', 'under_review'] } }),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    ]);

    const itemStatusBreakdown = await ItemInstance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const recentAuditLogs = await AuditLog.find()
      .populate('actor', 'name role')
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      success: true,
      dashboard: {
        totalUsers,
        totalProducts,
        totalItems,
        pendingVerifications,
        openComplaints,
        roleBreakdown: Object.fromEntries(roleBreakdown.map((r: any) => [r._id, r.count])),
        itemStatusBreakdown: Object.fromEntries(itemStatusBreakdown.map((s: any) => [s._id, s.count])),
        recentActivity: recentAuditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
