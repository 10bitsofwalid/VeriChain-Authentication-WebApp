import { Router, Response } from 'express';
import { Complaint } from '../models/Complaint';
import { AuditLog } from '../models/AuditLog';
import { protect, authorize, ensureVerified, AuthRequest } from '../middleware/auth';
import { Types } from 'mongoose';

const router = Router();

// @route   POST /api/complaints
// @desc    File a complaint (buyer only)
router.post('/', protect, authorize('buyer'), ensureVerified, async (req: AuthRequest, res: Response, next) => {
  try {
    const { productInstanceId, sellerId, reason, description, evidenceUrl } = req.body;

    if (!productInstanceId || !Types.ObjectId.isValid(productInstanceId)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid productInstanceId' });
    }

    if (!sellerId || !Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid sellerId' });
    }

    if (!productInstanceId || !sellerId || !reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide productInstanceId, sellerId, reason, and description',
      });
    }

    const complaint = await Complaint.create({
      buyer: new Types.ObjectId(req.user!.id),
      productInstance: new Types.ObjectId(productInstanceId),
      seller: new Types.ObjectId(sellerId),
      reason,
      description,
      evidenceUrl: evidenceUrl || undefined,
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

// @route   GET /api/complaints
// @desc    List complaints — buyers see own, moderators/admins see all
router.get('/', protect, async (req: AuthRequest, res: Response, next) => {
  try {
    let filter: any = {};

    if (req.user?.role === 'buyer') {
      filter.buyer = req.user.id;
    } else if (req.user?.role === 'seller') {
      filter.seller = req.user.id;
    } else if (!['moderator', 'admin'].includes(req.user?.role || '')) {
      return res.status(403).json({ success: false, message: 'Not authorized to view complaints' });
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
router.patch('/:id', protect, authorize('moderator', 'admin'), ensureVerified, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID' });
    }
    const { status, moderatorNotes } = req.body;
    const validStatuses = ['pending', 'under_review', 'resolved', 'dismissed'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
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
