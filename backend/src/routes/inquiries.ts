import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { Inquiry } from '../models/Inquiry';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { ItemInstance } from '../models/ItemInstance';
import { Notification } from '../models/Notification';
import { AuditLog } from '../models/AuditLog';
import { protect, AuthRequest } from '../middleware/auth';
import { sendError } from '../utils/errorResponse';
import { z } from 'zod';
import { validateRequest } from '../utils/validation';

const router = Router();

const createInquirySchema = z.object({
  body: z.object({
    sellerId: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid seller ID',
    }),
    productId: z.string().optional().refine((val) => !val || Types.ObjectId.isValid(val), {
      message: 'Invalid product ID',
    }),
    itemId: z.string().optional().refine((val) => !val || Types.ObjectId.isValid(val), {
      message: 'Invalid item ID',
    }),
    senderName: z.string().min(1, 'Name is required'),
    senderEmail: z.string().email('Valid email is required'),
    senderPhone: z.string().optional(),
    inquiryType: z.enum(['availability', 'price_offer', 'authenticity', 'shipping', 'bulk_order', 'general']).default('general'),
    message: z.string().min(1, 'Message is required'),
    proposedPrice: z.union([z.number(), z.string()]).transform((val) => Number(val)).optional(),
  }),
});

const replyInquirySchema = z.object({
  params: z.object({
    id: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid inquiry ID',
    }),
  }),
  body: z.object({
    reply: z.string().min(1, 'Reply message is required'),
  }),
});

// @route   POST /api/inquiries
// @desc    Submit a product / seller inquiry (Public or Authenticated)
router.post('/', validateRequest(createInquirySchema), async (req: Request, res: Response, next) => {
  try {
    const {
      sellerId,
      productId,
      itemId,
      senderName,
      senderEmail,
      senderPhone,
      inquiryType,
      message,
      proposedPrice,
    } = req.body;

    const seller = await User.findById(sellerId);
    if (!seller) {
      return sendError(res, 404, 'Seller not found');
    }

    let finalProductId = productId ? new Types.ObjectId(productId) : undefined;
    let finalItemId = itemId ? new Types.ObjectId(itemId) : undefined;
    let productName = 'Product';

    if (itemId) {
      const itemInstance = await ItemInstance.findById(itemId).populate('product', 'name');
      if (itemInstance) {
        finalItemId = itemInstance._id as Types.ObjectId;
        if (itemInstance.product && !finalProductId) {
          finalProductId = (itemInstance.product as any)._id;
        }
        if ((itemInstance.product as any)?.name) {
          productName = (itemInstance.product as any).name;
        }
      }
    }

    if (productId && !finalProductId) {
      const product = await Product.findById(productId);
      if (product) {
        finalProductId = product._id as Types.ObjectId;
        productName = product.name;
      }
    }

    // Check optional auth token from header
    let senderUserId: Types.ObjectId | undefined;
    if ((req as any).user?.id) {
      senderUserId = new Types.ObjectId((req as any).user.id);
    }

    const inquiry = await Inquiry.create({
      item: finalItemId,
      product: finalProductId,
      seller: new Types.ObjectId(sellerId),
      sender: senderUserId,
      senderName,
      senderEmail,
      senderPhone,
      inquiryType,
      message,
      proposedPrice: proposedPrice ? Number(proposedPrice) : undefined,
      status: 'pending',
    });

    // Notify seller
    try {
      await Notification.create({
        userId: sellerId,
        category: 'seller',
        type: 'buyer_inquiry',
        title: `New Inquiry on ${productName}`,
        description: `${senderName} asked about ${productName} (${inquiryType.replace('_', ' ')}): "${message.slice(0, 80)}${message.length > 80 ? '...' : ''}"`,
        link: `/dashboard/inventory?tab=inquiries`,
        read: false,
      });
    } catch {
      // Ignore notification failure
    }

    // Audit log
    await AuditLog.create({
      action: 'SELLER_INQUIRY_RECEIVED',
      actor: senderUserId || undefined,
      targetType: 'item',
      targetId: finalItemId ? finalItemId.toString() : finalProductId ? finalProductId.toString() : sellerId,
      details: `Inquiry from ${senderName} (${senderEmail}) to seller ${seller.name} for ${productName}`,
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been sent directly to the seller. They will respond shortly.',
      inquiry,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/inquiries/seller
// @desc    Get all inquiries received by the authenticated seller
router.get('/seller', protect, async (req: AuthRequest, res: Response, next) => {
  try {
    const inquiries = await Inquiry.find({ seller: req.user?.id })
      .populate('product', 'name sku imageUrl category price verifiedStatus')
      .populate('item', 'serialNumber status counterfeitRisk')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      inquiries,
      count: inquiries.length,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/inquiries/my
// @desc    Get all inquiries submitted by the logged-in buyer
router.get('/my', protect, async (req: AuthRequest, res: Response, next) => {
  try {
    const inquiries = await Inquiry.find({ sender: req.user?.id })
      .populate('product', 'name sku imageUrl category price')
      .populate('seller', 'name email trustScore logoUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      inquiries,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/inquiries/:id/reply
// @desc    Seller replies to an inquiry
router.patch('/:id/reply', protect, validateRequest(replyInquirySchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return sendError(res, 404, 'Inquiry not found');
    }

    if (inquiry.seller.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return sendError(res, 403, 'Unauthorized to reply to this inquiry');
    }

    const { reply } = req.body;

    inquiry.sellerReply = reply;
    inquiry.status = 'replied';
    inquiry.repliedAt = new Date();
    await inquiry.save();

    // If sender was logged in, notify sender
    if (inquiry.sender) {
      try {
        await Notification.create({
          userId: inquiry.sender.toString(),
          category: 'seller',
          type: 'inquiry_replied',
          title: `Seller Replied to your Inquiry`,
          description: `The seller responded: "${reply.slice(0, 100)}${reply.length > 100 ? '...' : ''}"`,
          link: `/dashboard/marketplace`,
          read: false,
        });
      } catch {
        // Continue
      }
    }

    res.json({
      success: true,
      message: 'Reply saved and sent to buyer.',
      inquiry,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
