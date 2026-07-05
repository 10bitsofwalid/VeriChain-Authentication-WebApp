import { Router, Request, Response } from 'express';
import { protect, authorize, ensureVerified, AuthRequest } from '../middleware/auth';
import { Review } from '../models/Review';
import { ItemInstance } from '../models/ItemInstance';
import { Product } from '../models/Product';
import { User } from '../models/User';

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
router.post('/:productId/reviews', protect, ensureVerified, async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const { itemInstanceId, rating, title, text, images } = req.body;

  if (!itemInstanceId || !rating || !title || !text) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const canReview = await verifyPurchase(req.user!.id, itemInstanceId);
  if (!canReview) {
    return res.status(403).json({ success: false, message: 'You can only review verified purchases' });
  }

  // Prevent duplicate review for same itemInstance
  const existing = await Review.findOne({ itemInstance: itemInstanceId, user: req.user!.id });
  if (existing) {
    return res.status(400).json({ success: false, message: 'You have already reviewed this purchase' });
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
});

router.patch('/:productId/reviews/:reviewId', protect, async (req: AuthRequest, res: Response) => {
  const { productId, reviewId } = req.params;
  const { rating, title, text, images } = req.body;

  const review = await Review.findOne({ _id: reviewId, product: productId });
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  if (review.user.toString() !== req.user!.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to edit this review' });
  }

  if (rating) review.rating = rating;
  if (title) review.title = title;
  if (text) review.text = text;
  if (images) review.images = images;

  await review.save();
  res.json({ success: true, review });
});

router.delete('/:productId/reviews/:reviewId', protect, async (req: AuthRequest, res: Response) => {
  const { productId, reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId, product: productId });
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  if (review.user.toString() !== req.user!.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
  }
  await review.remove();
  res.json({ success: true, message: 'Review deleted' });
});

export default router;
