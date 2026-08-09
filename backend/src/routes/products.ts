import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';
import { ItemInstance } from '../models/ItemInstance';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { Complaint } from '../models/Complaint';
import { protect, authorize, ensureVerified, AuthRequest } from '../middleware/auth';
import { Types } from 'mongoose';
import { batchLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';
import { validateRequest } from '../utils/validation';
import { sendError } from '../utils/errorResponse';

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

// @route   GET /api/products/stats
// @desc    Get live platform-wide summary metrics
router.get('/stats', async (_req: Request, res: Response, next) => {
  try {
    const [
      totalProducts,
      verifiedProducts,
      totalItems,
      activeRecalls,
      verifiedFactories,
      verifiedSellers,
      totalComplaints,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ verifiedStatus: 'verified' }),
      ItemInstance.countDocuments(),
      ItemInstance.countDocuments({ status: 'recalled' }),
      User.countDocuments({ role: 'factory', verified: true }),
      User.countDocuments({ role: 'seller', verified: true }),
      Complaint.countDocuments(),
    ]);

    res.json({
      success: true,
      stats: {
        totalProducts,
        verifiedProducts,
        totalItems,
        activeRecalls,
        verifiedPartners: verifiedFactories + verifiedSellers,
        totalFactories: verifiedFactories,
        totalSellers: verifiedSellers,
        totalComplaints,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/products
// @desc    Get all public product templates (supports filters & search)
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const { category, search, verifiedStatus, factoryId } = req.query;
    const filter: any = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (verifiedStatus) {
      filter.verifiedStatus = verifiedStatus;
    }

    if (factoryId && Types.ObjectId.isValid(factoryId as string)) {
      filter.factory = new Types.ObjectId(factoryId as string);
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    const products = await Product.find(filter)
      .populate('factory', 'name email role trustScore factoryDetails logoUrl verified')
      .sort({ createdAt: -1 });

    // Format products with compatibility fields
    const formatted = products.map((p: any) => ({
      _id: p._id,
      id: p._id.toString(),
      name: p.name,
      description: p.description,
      category: p.category,
      sku: p.sku,
      imageUrl: p.imageUrl,
      certificateUrl: p.certificateUrl,
      specs: p.specs || {},
      verifiedStatus: p.verifiedStatus,
      verified: p.verifiedStatus === 'verified',
      factory: p.factory,
      batchId: p.sku,
      availableQty: 50,
      wholesalePrice: 150.0,
      authenticityStatus: p.verifiedStatus === 'verified' ? 'Verified Authentic' : 'Pending Verification',
      manufacturingDate: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    // If query string asks for standard array (e.g. TrustCenter or Sourcing), support returning formatted directly as well
    if (req.headers['accept']?.includes('application/json')) {
      // res.json returns formatted object containing array
      const responseData: any = formatted;
      responseData.products = formatted;
      responseData.success = true;
      responseData.total = formatted.length;
      return res.json(responseData);
    }

    res.json({ success: true, products: formatted, total: formatted.length });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/products/register
// @desc    Register a new product template (Factory only)
router.post('/register', protect, authorize('factory'), ensureVerified, validateRequest(registerProductSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, description, category, sku, imageUrl, certificateUrl, specs } = req.body;

    const skuExists = await Product.findOne({ sku });
    if (skuExists) {
      return sendError(res, 400, 'SKU must be unique');
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
// @desc    Get all registered products for a factory
router.get('/factory', protect, authorize('factory', 'seller', 'admin'), ensureVerified, async (req: AuthRequest, res: Response, next) => {
  try {
    const targetFactoryId = (req.query.factoryId as string) || req.user?.id;
    const filter = targetFactoryId ? { factory: targetFactoryId } : {};
    const products = await Product.find(filter)
      .populate('factory', 'name email role trustScore factoryDetails logoUrl verified')
      .sort({ createdAt: -1 });

    const formatted = products.map((p: any) => ({
      _id: p._id,
      id: p._id.toString(),
      name: p.name,
      description: p.description,
      category: p.category,
      sku: p.sku,
      imageUrl: p.imageUrl,
      certificateUrl: p.certificateUrl,
      specs: p.specs || {},
      verifiedStatus: p.verifiedStatus,
      verified: p.verifiedStatus === 'verified',
      factory: p.factory,
      batchId: p.sku,
      availableQty: 50,
      wholesalePrice: 150.0,
      stock: 50,
      location: p.factory?.factoryDetails?.location || 'Factory Main Warehouse',
      authenticityStatus: p.verifiedStatus === 'verified' ? 'Verified Authentic' : 'Pending Verification',
      manufacturingDate: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    res.json({ success: true, products: formatted });
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

// @route   GET /api/products/:id
// @desc    Get single product details by Mongo ID or SKU (Public)
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    let product = null;

    if (Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).populate('factory', 'name email role trustScore factoryDetails logoUrl verified');
    }

    if (!product) {
      product = await Product.findOne({ sku: id }).populate('factory', 'name email role trustScore factoryDetails logoUrl verified');
    }

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/products/:id/batch
// @desc    Generate a serialized batch of items (Factory only)
router.post('/:id/batch', protect, authorize('factory'), ensureVerified, batchLimiter, validateRequest(batchSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { count, prefix, startingSerial } = req.body;
    const countNum = parseInt(count) || 10;
    const startSerialNum = parseInt(startingSerial) || 100001;
    const productPrefix = prefix || 'VC';

    const product = await Product.findById(req.params.id);
    if (!product) {
      return sendError(res, 404, 'Product template not found');
    }

    // Pre-insert duplicate serial check
    const serialNumbers: string[] = [];
    for (let i = 0; i < countNum; i++) {
      serialNumbers.push(`${productPrefix}-${product.sku}-${startSerialNum + i}`);
    }

    const duplicates = await ItemInstance.find({ serialNumber: { $in: serialNumbers } });
    if (duplicates.length > 0) {
      const duplicateSerials = duplicates.map(item => item.serialNumber);
      return sendError(
        res,
        400,
        `Duplicate serial number(s) detected. Generation aborted. Duplicates: ${duplicateSerials.join(', ')}`
      );
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
    const product = await Product.findById(req.params.id);
    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    // If factory, verify ownership
    if (req.user?.role === 'factory' && product.factory.toString() !== req.user.id) {
      return sendError(res, 403, 'Unauthorized: Product belongs to another manufacturer');
    }

    const { reason } = req.body;

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

export default router;
