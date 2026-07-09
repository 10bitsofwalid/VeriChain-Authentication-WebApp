import { Router, Response } from 'express';
import { Product } from '../models/Product';
import { ItemInstance } from '../models/ItemInstance';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { protect, authorize, ensureVerified, AuthRequest } from '../middleware/auth';
import { Types } from 'mongoose';
import { batchLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';

const router = Router();

const registerProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    category: z.string().min(1, 'Category is required'),
    sku: z.string().min(1, 'SKU is required'),
    imageUrl: z.string().min(1, 'Image URL is required'),
    certificateUrl: z.string().optional(),
    specs: z.record(z.string(), z.string()).optional(),
  }),
});

const batchSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid product template ID',
    }),
  }),
  body: z.object({
    count: z.union([z.number(), z.string()]).transform((val) => Number(val)).optional(),
    prefix: z.string().optional(),
    startingSerial: z.union([z.number(), z.string()]).transform((val) => Number(val)).optional(),
  }),
});

const recallSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid product ID',
    }),
  }),
  body: z.object({
    reason: z.string().min(1, 'Please provide a reason for the recall'),
  }),
});

// @route   POST /api/products/register
// @desc    Register a new product template (Factory only)
router.post('/register', protect, authorize('factory'), ensureVerified, validateRequest(registerProductSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, description, category, sku, imageUrl, certificateUrl, specs } = req.body;

    if (!name || !description || !category || !sku || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const skuExists = await Product.findOne({ sku });
    if (skuExists) {
      return res.status(400).json({ success: false, message: 'SKU must be unique' });
    }

    const product = await Product.create({
      name,
      description,
      category,
      sku,
      factory: new Types.ObjectId(req.user?.id),
      imageUrl,
      certificateUrl: certificateUrl || `https://ipfs.io/ipfs/QmSignatureCertificateHashStub_${sku}`,
      specs: specs || {},
      verifiedStatus: 'pending', // Awaits Moderator/Admin verification approval
    });

    // Write audit log
    await AuditLog.create({
      action: 'PRODUCT_REGISTERED',
      actor: new Types.ObjectId(req.user?.id),
      targetType: 'product',
      targetId: product._id.toString(),
      details: `Product template registered: ${product.name} (SKU: ${product.sku})`,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/products/factory
// @desc    Get all registered products for current factory
router.get('/factory', protect, authorize('factory'), ensureVerified, async (req: AuthRequest, res: Response, next) => {
  try {
    const products = await Product.find({ factory: req.user?.id });
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/products/:id/batch
// @desc    Generate a serialized batch of items (Factory only)
router.post('/:id/batch', protect, authorize('factory'), ensureVerified, batchLimiter, validateRequest(batchSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product template ID' });
    }
    const { count, prefix, startingSerial } = req.body;
    const countNum = parseInt(count) || 10;
    const startSerialNum = parseInt(startingSerial) || 100001;
    const productPrefix = prefix || 'VC';

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product template not found' });
    }

    // Pre-insert duplicate serial check
    const serialNumbers: string[] = [];
    for (let i = 0; i < countNum; i++) {
      serialNumbers.push(`${productPrefix}-${product.sku}-${startSerialNum + i}`);
    }

    const duplicates = await ItemInstance.find({ serialNumber: { $in: serialNumbers } });
    if (duplicates.length > 0) {
      const duplicateSerials = duplicates.map(item => item.serialNumber);
      return res.status(400).json({
        success: false,
        message: `Duplicate serial number(s) detected. Generation aborted. Duplicates: ${duplicateSerials.join(', ')}`,
      });
    }

    const createdItems = [];
    const factory = await User.findById(req.user?.id);
    const location = factory?.factoryDetails?.location || 'Unknown Manufacturing Facility';

    for (const serialNumber of serialNumbers) {
      const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      const item = await ItemInstance.create({
        product: product._id,
        serialNumber,
        qrCodeUrl: `https://verichain.io/verify?id=${serialNumber}`,
        currentOwner: new Types.ObjectId(req.user?.id),
        status: 'manufactured',
        counterfeitRisk: 'low',
        journey: [{
          location,
          action: 'manufactured',
          actor: new Types.ObjectId(req.user?.id),
          timestamp: new Date(),
          txHash,
        }],
      });

      createdItems.push(item);
    }

    // Write audit log
    await AuditLog.create({
      action: 'BATCH_GENERATED',
      actor: new Types.ObjectId(req.user?.id),
      targetType: 'product',
      targetId: product._id.toString(),
      details: `Generated batch of ${countNum} items for SKU: ${product.sku}`,
    });

    res.status(201).json({
      success: true,
      message: `Batch generated successfully. Created ${countNum} serial items.`,
      itemsCount: createdItems.length,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/products/:id/recall
// @desc    Recall all items of a product catalog (Factory or Admin)
router.post('/:id/recall', protect, authorize('factory', 'admin'), ensureVerified, validateRequest(recallSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // If factory, verify ownership
    if (req.user?.role === 'factory' && product.factory.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Product belongs to another manufacturer' });
    }

    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Please provide a reason for the recall' });
    }

    // Update all items of this product
    const items = await ItemInstance.find({ product: product._id });
    for (const item of items) {
      item.status = 'recalled';
      item.journey.push({
        location: 'Recall Center - Safety Quarantine',
        action: 'recalled',
        actor: new Types.ObjectId(req.user!.id),
        timestamp: new Date(),
        txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      });
      await item.save();
    }

    await AuditLog.create({
      action: 'PRODUCT_RECALL_TRIGGERED',
      actor: new Types.ObjectId(req.user?.id),
      targetType: 'product',
      targetId: product._id.toString(),
      details: `Product recall triggered for ${product.name} (SKU: ${product.sku}). Reason: ${reason}`,
    });

    res.json({
      success: true,
      message: `Successfully recalled all active items (${items.length} units). Status updated to Recalled.`,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/products/analytics
// @desc    Get manufacturing analytics (Factory only)
router.get('/analytics', protect, authorize('factory'), ensureVerified, async (req: AuthRequest, res: Response, next) => {
  try {
    const productsCount = await Product.countDocuments({ factory: req.user?.id });
    const userProducts = await Product.find({ factory: req.user?.id });
    const productIds = userProducts.map(p => p._id);

    const totalManufactured = await ItemInstance.countDocuments({ product: { $in: productIds } });
    const activeRecalls = await ItemInstance.countDocuments({ product: { $in: productIds }, status: 'recalled' });
    const transitCount = await ItemInstance.countDocuments({ product: { $in: productIds }, status: 'in_transit' });
    const soldCount = await ItemInstance.countDocuments({ product: { $in: productIds }, status: 'sold' });

    res.json({
      success: true,
      analytics: {
        totalTemplates: productsCount,
        totalManufactured,
        activeRecalls,
        inTransit: transitCount,
        sold: soldCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
