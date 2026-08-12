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

const listProductSchema = z.object({
  body: z.object({
    productId: z.string().optional().refine((val) => !val || Types.ObjectId.isValid(val), {
      message: 'Invalid product ID',
    }),
    name: z.string().optional(),
    sku: z.string().optional(),
    category: z.string().optional(),
    price: z.union([z.number(), z.string()]).transform((val) => Number(val)).optional(),
    stock: z.union([z.number(), z.string()]).transform((val) => Math.max(1, Math.min(100, Number(val)))).default(1),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    condition: z.string().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
    specs: z.record(z.string(), z.string()).optional(),
  }),
});

const updateListingSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid item ID',
    }),
  }),
  body: z.object({
    price: z.union([z.number(), z.string()]).transform((val) => Number(val)).optional(),
    status: z.enum(['listed', 'manufactured', 'in_transit']).optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
  }),
});

// @route   GET /api/items/recently-verified
// @desc    Get recently verified and updated items across the network
router.get('/recently-verified', async (_req: Request, res: Response, next) => {
  try {
    const items = await ItemInstance.find()
      .populate('product', 'name sku category verifiedStatus imageUrl')
      .populate('currentOwner', 'name role')
      .sort({ updatedAt: -1 })
      .limit(12);

    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/items/recalls
// @desc    Get all recalled items across the network
router.get('/recalls', async (_req: Request, res: Response, next) => {
  try {
    const items = await ItemInstance.find({ status: 'recalled' })
      .populate('product', 'name sku category verifiedStatus imageUrl')
      .populate('currentOwner', 'name email role')
      .sort({ updatedAt: -1 });

    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
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

    // Log live verification query
    AuditLog.create({
      action: 'ITEM_VERIFIED',
      actor: item.currentOwner ? new Types.ObjectId((item.currentOwner as any)._id || item.currentOwner) : undefined,
      targetType: 'item',
      targetId: item._id.toString(),
      details: `Serial verification lookup for ${item.serialNumber} (Status: ${item.status}, Risk: ${item.counterfeitRisk})`,
    }).catch(() => {});

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
// @desc    Get all items listed on the marketplace (Public / Accessible to all roles)
router.get('/marketplace', async (req: Request, res: Response, next) => {
  try {
    const { category, search, sellerId, minPrice, maxPrice, risk, sort } = req.query;

    const query: any = { status: 'listed' };
    if (risk) {
      query.counterfeitRisk = risk;
    }
    if (sellerId && Types.ObjectId.isValid(sellerId as string)) {
      query.currentOwner = new Types.ObjectId(sellerId as string);
    }

    let items = await ItemInstance.find(query)
      .populate('product', 'name description category sku price imageUrl certificateUrl verifiedStatus specs')
      .populate('currentOwner', 'name email role trustScore logoUrl verified')
      .sort({ updatedAt: -1 });

    // Filter by product category if provided
    if (category && category !== 'All') {
      items = items.filter((item: any) => item.product?.category === category);
    }

    if (search) {
      const term = (search as string).toLowerCase();
      items = items.filter((item: any) =>
        item.product?.name?.toLowerCase().includes(term) ||
        item.product?.sku?.toLowerCase().includes(term) ||
        item.product?.description?.toLowerCase().includes(term) ||
        item.serialNumber?.toLowerCase().includes(term) ||
        item.currentOwner?.name?.toLowerCase().includes(term)
      );
    }

    if (minPrice) {
      const min = Number(minPrice);
      items = items.filter((item: any) => Number(item.product?.price || 0) >= min);
    }

    if (maxPrice) {
      const max = Number(maxPrice);
      items = items.filter((item: any) => Number(item.product?.price || 0) <= max);
    }

    if (sort === 'price_asc') {
      items.sort((a: any, b: any) => (Number(a.product?.price) || 0) - (Number(b.product?.price) || 0));
    } else if (sort === 'price_desc') {
      items.sort((a: any, b: any) => (Number(b.product?.price) || 0) - (Number(a.product?.price) || 0));
    } else if (sort === 'trust') {
      items.sort((a: any, b: any) => (b.currentOwner?.trustScore || 0) - (a.currentOwner?.trustScore || 0));
    }

    res.json({ success: true, items, total: items.length });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/items/seller/listings
// @desc    Get all active marketplace listings owned by the logged-in seller
router.get('/seller/listings', protect, authorize('seller', 'factory', 'admin'), async (req: AuthRequest, res: Response, next) => {
  try {
    const listings = await ItemInstance.find({
      currentOwner: req.user?.id,
      status: 'listed',
    })
      .populate('product', 'name description category sku price imageUrl certificateUrl verifiedStatus specs')
      .sort({ updatedAt: -1 });

    const totalValue = listings.reduce((sum, item: any) => sum + (Number(item.product?.price) || 0), 0);

    res.json({
      success: true,
      listings,
      stats: {
        totalListings: listings.length,
        totalValue,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/items/list-product
// @desc    List a product directly on the marketplace (Seller / Factory / Admin)
router.post('/list-product', protect, authorize('seller', 'factory', 'admin'), ensureVerified, validateRequest(listProductSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const {
      productId,
      name,
      sku,
      category,
      price,
      stock = 1,
      description,
      imageUrl,
      condition,
      location,
      notes,
      specs,
    } = req.body;

    let targetProduct: any = null;

    if (productId) {
      targetProduct = await Product.findById(productId);
      if (!targetProduct) {
        return sendError(res, 404, 'Selected product catalog entry not found');
      }
      if (price !== undefined && price > 0) {
        targetProduct.price = Number(price);
        await targetProduct.save();
      }
    } else {
      if (!name || !sku) {
        return sendError(res, 400, 'Product name and SKU are required to create a new product listing');
      }

      // Check if SKU exists
      targetProduct = await Product.findOne({ sku });
      if (!targetProduct) {
        targetProduct = await Product.create({
          name,
          sku,
          category: category || 'Luxury Goods',
          price: Number(price) || 100,
          description: description || `Authentic ${name} listed by verified merchant.`,
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
          factory: new Types.ObjectId(req.user?.id),
          specs: specs || {},
          certificateUrl: `https://ipfs.io/ipfs/QmListingCertificate_${sku}_${Date.now()}`,
          verifiedStatus: 'verified',
        });
      } else if (price !== undefined && price > 0) {
        targetProduct.price = Number(price);
        await targetProduct.save();
      }
    }

    const count = Math.max(1, Math.min(50, Number(stock) || 1));
    const createdItems = [];
    const timestamp = Date.now();
    const sellerLocation = location || 'Verified Seller Warehouse';

    for (let i = 0; i < count; i++) {
      const serialNumber = `VC-${targetProduct.sku}-${timestamp.toString().slice(-6)}-${(i + 1).toString().padStart(3, '0')}`;
      const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      const item = await ItemInstance.create({
        product: targetProduct._id,
        serialNumber,
        qrCodeUrl: `https://verichain.io/verify?id=${serialNumber}`,
        currentOwner: new Types.ObjectId(req.user?.id),
        status: 'listed',
        counterfeitRisk: 'low',
        journey: [
          {
            location: sellerLocation,
            action: 'listed_on_marketplace',
            actor: new Types.ObjectId(req.user?.id),
            timestamp: new Date(),
            txHash,
          },
        ],
      });

      createdItems.push(item);
    }

    // Write audit log
    await AuditLog.create({
      action: 'PRODUCT_LISTED_ON_MARKETPLACE',
      actor: new Types.ObjectId(req.user?.id),
      targetType: 'product',
      targetId: targetProduct._id.toString(),
      details: `Seller listed ${count} unit(s) of "${targetProduct.name}" (SKU: ${targetProduct.sku}) at $${targetProduct.price} on the marketplace. Condition: ${condition || 'Brand New'}`,
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: `Successfully listed ${count} unit(s) of "${targetProduct.name}" on the marketplace.`,
      product: targetProduct,
      items: createdItems,
      itemsCount: createdItems.length,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/items/:id/listing
// @desc    Update listing details (Price, Status, Location) for an owned item
router.patch('/:id/listing', protect, authorize('seller', 'factory', 'admin'), ensureVerified, validateRequest(updateListingSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const item = await ItemInstance.findById(req.params.id);
    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    if (item.currentOwner.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return sendError(res, 403, 'Access denied. You do not own this listed item.');
    }

    const { price, status, location } = req.body;

    if (price !== undefined && price > 0) {
      await Product.findByIdAndUpdate(item.product, { price: Number(price) });
    }

    if (status) {
      item.status = status;
    }

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    item.journey.push({
      location: location || 'Seller Listing Management',
      action: status ? `listing_${status}` : 'listing_details_updated',
      actor: new Types.ObjectId(req.user!.id),
      timestamp: new Date(),
      txHash,
    });

    await item.save();

    res.json({
      success: true,
      message: 'Listing updated successfully',
      item,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/items/:id/delist
// @desc    Delist an item from the marketplace (reverts status to manufactured)
router.post('/:id/delist', protect, authorize('seller', 'factory', 'admin'), ensureVerified, async (req: AuthRequest, res: Response, next) => {
  try {
    const item = await ItemInstance.findById(req.params.id);
    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    if (item.currentOwner.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return sendError(res, 403, 'Access denied. You do not own this item.');
    }

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    item.status = 'manufactured';
    item.journey.push({
      location: 'Seller Inventory',
      action: 'delisted_from_marketplace',
      actor: new Types.ObjectId(req.user!.id),
      timestamp: new Date(),
      txHash,
    });

    await item.save();

    res.json({
      success: true,
      message: `Item ${item.serialNumber} delisted from the marketplace.`,
      item,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/items/:id/buy
// @desc    Purchase a listed item from the marketplace (buyer only)
router.post('/:id/buy', protect, authorize('buyer'), ensureVerified, validateRequest(buyItemSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const buyerId = req.user!.id;
    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const item = await ItemInstance.findOneAndUpdate(
      {
        _id: req.params.id,
        status: 'listed',
        currentOwner: { $ne: new Types.ObjectId(buyerId) },
      },
      {
        $set: {
          currentOwner: new Types.ObjectId(buyerId),
          status: 'sold',
        },
        $push: {
          journey: {
            location: 'VeriChain Marketplace',
            action: 'purchased',
            actor: new Types.ObjectId(buyerId),
            timestamp: new Date(),
            txHash,
          },
        },
      },
      { new: true }
    );

    if (!item) {
      const existing = await ItemInstance.findById(req.params.id);
      if (!existing) {
        return sendError(res, 404, 'Item not found');
      }
      if (existing.currentOwner.toString() === buyerId) {
        return sendError(res, 400, 'You already own this item');
      }
      return sendError(res, 400, 'This item is no longer available for purchase');
    }

    // Create Audit Log
    await AuditLog.create({
      action: 'ITEM_PURCHASED',
      actor: new Types.ObjectId(buyerId),
      targetType: 'item',
      targetId: item._id.toString(),
      details: `Item ${item.serialNumber} purchased by buyer ${buyerId}`,
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
