import { Router, Request, Response, NextFunction } from 'express';
import { protect, ensureVerified, AuthRequest } from '../middleware/auth';
import { Review } from '../models/Review';
import { ItemInstance } from '../models/ItemInstance';
import { Types } from 'mongoose';
import { z } from 'zod';
import { validateRequest } from '../utils/validation';
import { sendError } from '../utils/errorResponse';

const createReviewSchema = z.object({
  params: z.object({
    productId: z.string().refine((val) => Types.ObjectId.isValid(val), { message: 'Invalid product ID' }),
  }),
  body: z.object({
    itemInstanceId: z.string().refine((val) => Types.ObjectId.isValid(val), { message: 'Invalid item instance ID' }),
    rating: z.number({ error: 'Rating must be a number' }).int().min(1).max(5),
    title: z.string().min(1, 'Title is required').max(200),
    text: z.string().min(1, 'Review text is required').max(5000),
    images: z.array(z.string().url()).optional(),
  }),
});

const updateReviewSchema = z.object({
  params: z.object({
    productId: z.string().refine((val) => Types.ObjectId.isValid(val), { message: 'Invalid product ID' }),
    reviewId: z.string().refine((val) => Types.ObjectId.isValid(val), { message: 'Invalid review ID' }),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().min(1).max(200).optional(),
    text: z.string().min(1).max(5000).optional(),
    images: z.array(z.string().url()).optional(),
  }),
});

const router = Router();

// Helper to verify that the user purchased the item and the purchase is completed (status 'sold')
const verifyPurchase = async (userId: string, itemInstanceId: string) => {
  const item = await ItemInstance.findById(itemInstanceId);
  if (!item) return false;
  // Owner must be the user and the item must be sold (i.e., purchase completed)
  return item.currentOwner?.toString() === userId && item.status === 'sold';
};

// GET reviews for a product (supports pagination & sorting)
router.get('/:productId/reviews', async (req: Request, res: Response) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sort = (req.query.sort as string) || 'recent'; // recent | helpful | rating_high | rating_low

  const sortMap: any = {
    recent: { createdAt: -1 },
    helpful: { helpfulCount: -1 },
    rating_high: { rating: -1 },
    rating_low: { rating: 1 },
  };

  const reviews = await Review.find({ product: productId })
    .sort(sortMap[sort] || sortMap.recent)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name avatar');

  const total = await Review.countDocuments({ product: productId });
  res.json({ success: true, data: { reviews, total, page, limit } });
});

// POST a new review (verified buyer only)
router.post('/:productId/reviews', protect, ensureVerified, validateRequest(createReviewSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const { itemInstanceId, rating, title, text, images } = req.body;

    const canReview = await verifyPurchase(req.user!.id, itemInstanceId);
    if (!canReview) {
      return sendError(res, 403, 'You can only review verified purchases');
    }

    // Prevent duplicate review for same itemInstance
    const existing = await Review.findOne({ itemInstance: itemInstanceId, user: req.user!.id });
    if (existing) {
      return sendError(res, 400, 'You have already reviewed this purchase');
    }

    const review = await Review.create({
      product: productId,
      user: req.user!.id,
      itemInstance: itemInstanceId,
      rating,
      title,
      text,
      images: images || [],
      verified: true,
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
});

router.patch('/:productId/reviews/:reviewId', protect, validateRequest(updateReviewSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, reviewId } = req.params;
    const { rating, title, text, images } = req.body;

    const review = await Review.findOne({ _id: reviewId, product: productId });
    if (!review) return sendError(res, 404, 'Review not found');
    if (review.user.toString() !== req.user!.id) {
      return sendError(res, 403, 'Not authorized to edit this review');
    }

    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (text) review.text = text;
    if (images) review.images = images;

    await review.save();
    res.json({ success: true, review });
  } catch (error) {
    next(error);
  }
});

router.delete('/:productId/reviews/:reviewId', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, reviewId } = req.params;

    if (!Types.ObjectId.isValid(productId) || !Types.ObjectId.isValid(reviewId)) {
      return sendError(res, 400, 'Invalid parameters');
    }

    const review = await Review.findOne({ _id: reviewId, product: productId });
    if (!review) return sendError(res, 404, 'Review not found');
    if (review.user.toString() !== req.user!.id) {
      return sendError(res, 403, 'Not authorized to delete this review');
    }
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
