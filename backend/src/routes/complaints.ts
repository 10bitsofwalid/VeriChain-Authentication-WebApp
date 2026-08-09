import { Router, Request, Response, NextFunction } from 'express';
import { Complaint } from '../models/Complaint';
import { AuditLog } from '../models/AuditLog';
import { ItemInstance } from '../models/ItemInstance';
import { Product } from '../models/Product';
import { protect, authorize, ensureVerified, AuthRequest } from '../middleware/auth';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { validateRequest } from '../utils/validation';
import { sendError } from '../utils/errorResponse';

const router = Router();

const createComplaintSchema = z.object({
  body: z.object({
    productInstanceId: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Please provide a valid productInstanceId',
    }),
    reason: z.string().min(1, 'Reason is required'),
    description: z.string().min(1, 'Description is required'),
    evidenceUrl: z.string().optional(),
  }),
});

const updateComplaintSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid complaint ID',
    }),
  }),
  body: z.object({
    status: z.enum(['pending', 'under_review', 'resolved', 'dismissed']).optional(),
    moderatorNotes: z.string().optional(),
  }),
});

// @route   POST /api/complaints
// @desc    File a complaint (buyer only)
router.post('/', protect, authorize('buyer'), ensureVerified, validateRequest(createComplaintSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { productInstanceId, reason, description, evidenceUrl } = req.body;

    const item = await ItemInstance.findById(productInstanceId);
    if (!item) {
      return sendError(res, 404, 'Product item instance not found.');
    }

    // Verify ownership
    if (item.currentOwner.toString() !== req.user!.id) {
      return sendError(res, 403, 'You can only file complaints for items you currently own.');
    }

    // Search journey in reverse chronological order to find the purchase or transfer step
    let sellerId: Types.ObjectId | null = null;
    let transactionHash = '';

    const buyerIdStr = req.user!.id;

    for (let i = item.journey.length - 1; i >= 0; i--) {
      const step = item.journey[i];
      if (step.action === 'purchased' && step.actor.toString() === buyerIdStr) {
        transactionHash = step.txHash;
        // Search preceding steps for the owner/seller
        for (let j = i - 1; j >= 0; j--) {
          if (item.journey[j].actor.toString() !== buyerIdStr) {
            sellerId = item.journey[j].actor;
            break;
          }
        }
        break;
      } else if (step.action === 'transferred') {
        // In a transfer, the actor who triggered the transfer is the sender (seller/previous owner)
        sellerId = step.actor;
        transactionHash = step.txHash;
        break;
      }
    }

    // Fallbacks if not resolved in journey
    if (!sellerId) {
      const product = await Product.findById(item.product);
      sellerId = product?.factory || item.journey[0].actor;
    }

    if (!transactionHash && item.journey.length > 0) {
      transactionHash = item.journey[item.journey.length - 1].txHash;
    }

    const complaint = await Complaint.create({
      buyer: new Types.ObjectId(req.user!.id),
      productInstance: new Types.ObjectId(productInstanceId),
      seller: sellerId,
      reason,
      description,
      evidenceUrl: evidenceUrl || undefined,
      transactionHash,
      status: 'pending',
    });

    await AuditLog.create({
      action: 'COMPLAINT_FILED',
      actor: new Types.ObjectId(req.user!.id),
      targetType: 'complaint',
      targetId: complaint._id.toString(),
      details: `Complaint filed against seller ${sellerId} for item ${productInstanceId}. Reason: ${reason}`,
    });

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
});

// Helper to optionally extract user token for complaints route
const getComplaintsUser = async (req: Request) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
      return decoded;
    }
  } catch {
    // Guest
  }
  return null;
};

// @route   GET /api/complaints
// @desc    List complaints — role-scoped when authenticated, public disputes when requested by community
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const user = await getComplaintsUser(req);
    let filter: any = {};

    if (user) {
      if (user.role === 'buyer') {
        filter.buyer = user.id;
      } else if (user.role === 'seller') {
        filter.seller = user.id;
      } else if (user.role === 'factory') {
        // Factory sees complaints for items of their products
        const products = await Product.find({ factory: user.id }).select('_id');
        const items = await ItemInstance.find({ product: { $in: products.map(p => p._id) } }).select('_id');
        filter.productInstance = { $in: items.map(it => it._id) };
      }
      // moderator and admin see all
    }

    const complaints = await Complaint.find(filter)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('productInstance', 'serialNumber status')
      .sort({ createdAt: -1 });

    res.json({ success: true, complaints });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/complaints/:id
// @desc    Update complaint status and moderator notes (moderator/admin)
router.patch('/:id', protect, authorize('moderator', 'admin'), ensureVerified, validateRequest(updateComplaintSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { status, moderatorNotes } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found');
    }

    if (status) complaint.status = status;
    if (moderatorNotes) complaint.moderatorNotes = moderatorNotes;

    await complaint.save();

    await AuditLog.create({
      action: 'COMPLAINT_UPDATED',
      actor: new Types.ObjectId(req.user!.id),
      targetType: 'complaint',
      targetId: complaint._id.toString(),
      details: `Complaint status updated to ${status || complaint.status}`,
    });

    res.json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
});

export default router;
