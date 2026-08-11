import { Router, Response } from 'express';
import { Order } from '../models/Order';
import { ItemInstance } from '../models/ItemInstance';
import { Product } from '../models/Product';
import { AuditLog } from '../models/AuditLog';
import { protect, authorize, ensureVerified, AuthRequest } from '../middleware/auth';
import { Types } from 'mongoose';
import { z } from 'zod';
import { validateRequest } from '../utils/validation';
import { sendError } from '../utils/errorResponse';

const router = Router();

const createOrderItemSchema = z.object({
  productId: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: 'Invalid productId',
  }),
  itemInstanceId: z.string().optional(),
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().optional(),
  serialNumber: z.string().optional(),
  quantity: z.number().min(1).default(1),
  price: z.number().min(0),
  image: z.string().optional(),
});

const shippingAddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
});

const createOrderSchema = z.object({
  body: z.object({
    items: z.array(createOrderItemSchema).min(1, 'Order must contain at least one item'),
    shippingAddress: shippingAddressSchema,
    payment: z
      .object({
        method: z.string().optional(),
        cardLast4: z.string().optional(),
        status: z.enum(['pending', 'paid', 'settled', 'refunded']).optional(),
      })
      .optional(),
    subtotal: z.number().optional(),
    shipping: z.number().optional(),
    total: z.number().optional(),
  }),
});

const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Order ID is required'),
  }),
  body: z.object({
    status: z.enum(['processing', 'shipped', 'delivered', 'cancelled', 'returned']).optional(),
    trackingNumber: z.string().optional(),
    carrier: z.string().optional(),
    estimatedDelivery: z.string().optional(),
    details: z.string().optional(),
  }),
});

// @route   POST /api/orders
// @desc    Create and record a new purchase order on the ledger (Buyer only)
router.post(
  '/',
  protect,
  authorize('buyer'),
  ensureVerified,
  validateRequest(createOrderSchema),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { items, shippingAddress, payment, subtotal, shipping, total } = req.body;
      const buyerId = req.user!.id;

      const orderNumber = `VC-ORD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 900 + 100)}`;
      const orderTxHash =
        '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      const processedItems: any[] = [];
      let calculatedSubtotal = 0;

      for (const item of items) {
        let sellerId: Types.ObjectId | undefined;
        let factoryId: Types.ObjectId | undefined;
        let itemInstanceDoc: any = null;

        // Fetch product to resolve factory and specs
        const product = await Product.findById(item.productId);
        if (product) {
          factoryId = product.factory;
        }

        // If an itemInstanceId is provided or item is serialized
        if (item.itemInstanceId && Types.ObjectId.isValid(item.itemInstanceId)) {
          // Atomically acquire item instance
          itemInstanceDoc = await ItemInstance.findOneAndUpdate(
            {
              _id: item.itemInstanceId,
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
                  location: `${shippingAddress.city}, ${shippingAddress.country}`,
                  action: 'purchased',
                  actor: new Types.ObjectId(buyerId),
                  timestamp: new Date(),
                  txHash: orderTxHash,
                  details: `Purchased under Order #${orderNumber}`,
                },
              },
            },
            { new: true }
          );

          if (itemInstanceDoc) {
            // Find seller from journey or prior ownership
            if (itemInstanceDoc.journey && itemInstanceDoc.journey.length > 1) {
              const previousStep = itemInstanceDoc.journey[itemInstanceDoc.journey.length - 2];
              sellerId = previousStep?.actor;
            }
          }
        }

        const itemPrice = Number(item.price) || (product?.price ? Number(product.price) : 0);
        const itemQty = Number(item.quantity) || 1;
        calculatedSubtotal += itemPrice * itemQty;

        processedItems.push({
          product: new Types.ObjectId(item.productId),
          itemInstance: itemInstanceDoc ? itemInstanceDoc._id : undefined,
          name: item.name || product?.name || 'Verified Product',
          sku: item.sku || product?.sku || 'VC-SKU',
          serialNumber: item.serialNumber || (itemInstanceDoc ? itemInstanceDoc.serialNumber : undefined),
          quantity: itemQty,
          price: itemPrice,
          image: item.image || product?.imageUrl || '',
          seller: sellerId || factoryId,
          factory: factoryId,
        });
      }

      const orderSubtotal = subtotal ?? calculatedSubtotal;
      const orderShipping = shipping ?? (orderSubtotal > 200 || orderSubtotal === 0 ? 0 : 14.99);
      const orderTotal = total ?? (orderSubtotal + orderShipping);

      const order = await Order.create({
        orderNumber,
        buyer: new Types.ObjectId(buyerId),
        items: processedItems,
        shippingAddress,
        payment: {
          method: payment?.method || 'Credit Card (Stripe Escrow)',
          cardLast4: payment?.cardLast4 || '4242',
          status: payment?.status || 'paid',
          transactionHash: orderTxHash,
        },
        subtotal: orderSubtotal,
        shipping: orderShipping,
        total: orderTotal,
        status: 'processing',
        trackingNumber: `TRK-${orderNumber.replace('VC-ORD-', '')}`,
        carrier: 'VeriExpress Logistics',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        timeline: [
          {
            action: 'Order Placed & Escrow Secured',
            actor: new Types.ObjectId(buyerId),
            actorName: 'Buyer',
            timestamp: new Date(),
            details: `Order #${orderNumber} created with ${processedItems.length} authenticated item(s).`,
            txHash: orderTxHash,
          },
        ],
      });

      // Create Audit Log
      await AuditLog.create({
        action: 'ORDER_CREATED',
        actor: new Types.ObjectId(buyerId),
        targetType: 'order',
        targetId: order._id.toString(),
        details: `Order ${orderNumber} placed for $${orderTotal.toFixed(2)} by buyer ${buyerId}`,
      });

      res.status(201).json({ success: true, order });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/orders/my
// @desc    Get all orders for currently authenticated user (buyer, seller, or factory)
router.get('/my', protect, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let filter: any = {};
    if (role === 'buyer') {
      filter = { buyer: userId };
    } else if (role === 'seller') {
      filter = { $or: [{ 'items.seller': userId }, { buyer: userId }] };
    } else if (role === 'factory') {
      filter = { 'items.factory': userId };
    }
    // moderators and admins see all

    const orders = await Order.find(filter)
      .populate('buyer', 'name email location')
      .populate('items.product', 'name sku category price imageUrl certificateUrl verifiedStatus')
      .populate('items.seller', 'name email role')
      .populate('items.factory', 'name email role location')
      .populate('items.itemInstance', 'serialNumber status location journey')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders, total: orders.length });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders
// @desc    Get all orders across platform (Admin and Moderator)
router.get('/', protect, authorize('admin', 'moderator'), async (_req: AuthRequest, res: Response, next) => {
  try {
    const orders = await Order.find()
      .populate('buyer', 'name email')
      .populate('items.product', 'name sku price')
      .populate('items.seller', 'name email')
      .populate('items.factory', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders, total: orders.length });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details by MongoDB ID or orderNumber
router.get('/:id', protect, async (req: AuthRequest, res: Response, next) => {
  try {
    const query = Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { orderNumber: req.params.id };

    const order = await Order.findOne(query)
      .populate('buyer', 'name email location')
      .populate('items.product', 'name sku category price imageUrl certificateUrl verifiedStatus specs')
      .populate('items.seller', 'name email role')
      .populate('items.factory', 'name email role location')
      .populate('items.itemInstance', 'serialNumber status location journey');

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    // Role-based authorization check
    const userId = req.user!.id;
    const role = req.user!.role;
    const isBuyer = order.buyer?._id?.toString() === userId;
    const isParty =
      isBuyer ||
      order.items.some(
        (it: any) =>
          it.seller?._id?.toString() === userId || it.factory?._id?.toString() === userId
      );

    if (!isParty && role !== 'admin' && role !== 'moderator') {
      return sendError(res, 403, 'Not authorized to view this order');
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status, shipping info, or timeline (seller, factory, admin, moderator)
router.patch(
  '/:id/status',
  protect,
  authorize('seller', 'factory', 'admin', 'moderator'),
  ensureVerified,
  validateRequest(updateOrderStatusSchema),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { status, trackingNumber, carrier, estimatedDelivery, details } = req.body;
      const query = Types.ObjectId.isValid(req.params.id)
        ? { _id: req.params.id }
        : { orderNumber: req.params.id };

      const order = await Order.findOne(query);
      if (!order) {
        return sendError(res, 404, 'Order not found');
      }

      if (status) order.status = status;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (carrier) order.carrier = carrier;
      if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);

      const statusTxHash =
        '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      order.timeline.push({
        action: `Status Updated to ${status?.toUpperCase() || order.status.toUpperCase()}`,
        actor: new Types.ObjectId(req.user!.id),
        actorName: req.user!.role,
        timestamp: new Date(),
        details: details || `Order status transitioned to ${status || order.status}.`,
        txHash: statusTxHash,
      });

      await order.save();

      // Audit Log
      await AuditLog.create({
        action: 'ORDER_UPDATED',
        actor: new Types.ObjectId(req.user!.id),
        targetType: 'order',
        targetId: order._id.toString(),
        details: `Order ${order.orderNumber} status changed to ${status || order.status}`,
      });

      res.json({ success: true, order });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
