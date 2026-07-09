import { Router, Response } from 'express';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { ItemInstance } from '../models/ItemInstance';
import { AuditLog } from '../models/AuditLog';
import { Complaint } from '../models/Complaint';
import { protect, authorize, AuthRequest } from '../middleware/auth';
import { Types } from 'mongoose';
import crypto from 'crypto';
import { Invitation } from '../models/Invitation';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';

const verifyUserSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => Types.ObjectId.isValid(val), { message: 'Invalid user ID' }),
  }),
  body: z.object({
    verified: z.boolean({ error: 'Please provide a boolean `verified` field' }),
  }),
});

const verifyProductSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => Types.ObjectId.isValid(val), { message: 'Invalid product ID' }),
  }),
  body: z.object({
    verifiedStatus: z.string().refine((val) => ['verified', 'rejected'].includes(val), {
      message: 'verifiedStatus must be "verified" or "rejected"',
    }),
  }),
});

const createInvitationSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
    name: z.string().min(1, 'Name is required'),
    role: z.string().refine((val) => ['moderator', 'admin'].includes(val), {
      message: 'Role must be admin or moderator',
    }),
  }),
});

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
router.patch('/users/:id/verify', validateRequest(verifyUserSchema), async (req: AuthRequest, res: Response, next) => {
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
router.patch('/products/:id/verify', validateRequest(verifyProductSchema), async (req: AuthRequest, res: Response, next) => {
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

// @route   POST /api/admin/invitations
// @desc    Create and send an invitation
router.post('/invitations', validateRequest(createInvitationSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { email, name, role } = req.body;

    if (!email || !name || !role) {
      return res.status(400).json({ success: false, message: 'Please provide email, name, and role' });
    }

    if (!['moderator', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be admin or moderator' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Check if invitation already exists
    const existingInvite = await Invitation.findOne({ email });
    if (existingInvite && existingInvite.status === 'pending' && existingInvite.expiresAt > new Date()) {
      return res.status(400).json({ success: false, message: 'A pending invitation already exists for this email' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours expiry

    // Save invitation
    const invitation = await Invitation.create({
      email,
      name,
      role,
      token,
      invitedBy: new Types.ObjectId(req.user!.id),
      expiresAt,
    });

    await AuditLog.create({
      action: 'INVITATION_SENT',
      actor: new Types.ObjectId(req.user!.id),
      targetType: 'user',
      targetId: invitation._id.toString(),
      details: `Admin invited ${name} (${email}) as ${role}`,
    });

    res.status(201).json({
      success: true,
      message: 'Invitation generated successfully',
      invitation,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/invitations
// @desc    List all invitations
router.get('/invitations', async (req: AuthRequest, res: Response, next) => {
  try {
    const invitations = await Invitation.find()
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, invitations });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/admin/invitations/:id
// @desc    Revoke/delete a pending invitation
router.delete('/invitations/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid invitation ID' });
    }

    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only revoke pending invitations' });
    }

    invitation.status = 'expired'; // Revoke it
    await invitation.save();

    await AuditLog.create({
      action: 'INVITATION_REVOKED',
      actor: new Types.ObjectId(req.user!.id),
      targetType: 'user',
      targetId: invitation._id.toString(),
      details: `Admin revoked invitation for ${invitation.name} (${invitation.email})`,
    });

    res.json({ success: true, message: 'Invitation revoked successfully', invitation });
  } catch (error) {
    next(error);
  }
});

export default router;
