import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { ItemInstance } from '../models/ItemInstance';
import { Complaint } from '../models/Complaint';
import { AuditLog } from '../models/AuditLog';
import { sendError } from '../utils/errorResponse';

const router = Router();

const publicUserFields = 'name role verified trustScore logoUrl certificateUrl factoryDetails createdAt';
const productFields = 'name description category sku imageUrl certificateUrl verifiedStatus createdAt updatedAt';

const trustLevel = (score = 0) => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Strong';
  if (score >= 60) return 'Developing';
  return 'Needs review';
};

const percentage = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

const monthWindow = () => {
  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setDate(now.getDate() - 30);
  const previousStart = new Date(now);
  previousStart.setDate(now.getDate() - 60);
  return { now, currentStart, previousStart };
};

const buildFactoryTimeline = (factory: any, products: any[], totalUnits: number) => {
  const events = [
    {
      id: `factory-${factory._id}`,
      title: 'Factory registered',
      description: `${factory.name} joined VeriChain.`,
      date: factory.createdAt,
    },
  ];

  if (factory.verified) {
    events.push({
      id: `factory-verified-${factory._id}`,
      title: 'Certification approved',
      description: 'Factory verification was approved.',
      date: factory.updatedAt || factory.createdAt,
    });
  }

  products.slice(0, 6).forEach((product) => {
    events.push({
      id: `product-${product._id}`,
      title: 'New product verified',
      description: `${product.name} was added to the verified catalog.`,
      date: product.updatedAt || product.createdAt,
    });
  });

  if (totalUnits >= 100) {
    events.push({
      id: `milestone-${factory._id}`,
      title: 'Verification milestone reached',
      description: `${totalUnits} serialized units tracked.`,
      date: new Date(),
    });
  }

  if ((factory.trustScore || 0) >= 95) {
    events.push({
      id: `award-${factory._id}`,
      title: 'Award received',
      description: 'Recognized as a top trust performer.',
      date: new Date(),
    });
  }

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// @route   GET /api/profiles/factory/:id
// @desc    Public read-only factory trust profile
router.get('/factory/:id', async (req: Request, res: Response, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 404, 'Factory profile not found');
    }

    const factory = await User.findOne({ _id: req.params.id, role: 'factory' }).select(publicUserFields).lean();
    if (!factory) {
      return sendError(res, 404, 'Factory profile not found');
    }

    const [allProducts, verifiedProducts] = await Promise.all([
      Product.find({ factory: factory._id }).select(productFields).sort({ updatedAt: -1 }).lean(),
      Product.find({ factory: factory._id, verifiedStatus: 'verified' }).select(productFields).sort({ updatedAt: -1 }).lean(),
    ]);

    const productIds = allProducts.map((product) => product._id);
    const verifiedProductIds = verifiedProducts.map((product) => product._id);
    const { currentStart } = monthWindow();

    const [totalUnits, verifiedUnits, recalledUnits, monthlyVerifications, counterfeitReports, itemStats] = await Promise.all([
      ItemInstance.countDocuments({ product: { $in: productIds } }),
      ItemInstance.countDocuments({ product: { $in: verifiedProductIds } }),
      ItemInstance.countDocuments({ product: { $in: productIds }, status: 'recalled' }),
      ItemInstance.countDocuments({ product: { $in: productIds }, createdAt: { $gte: currentStart } }),
      Complaint.countDocuments({ seller: factory._id }),
      ItemInstance.aggregate([
        { $match: { product: { $in: verifiedProductIds } } },
        {
          $group: {
            _id: '$product',
            total: { $sum: 1 },
            authentic: { $sum: { $cond: [{ $eq: ['$counterfeitRisk', 'low'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const statsByProduct = new Map(itemStats.map((entry: any) => [entry._id.toString(), entry]));
    const products = verifiedProducts.map((product: any) => {
      const stats = statsByProduct.get(product._id.toString()) as any;
      return {
        _id: product._id,
        name: product.name,
        category: product.category,
        imageUrl: product.imageUrl,
        verifiedStatus: product.verifiedStatus,
        verifiedUnits: stats?.total || 0,
        authenticityPercentage: percentage(stats?.authentic || 0, stats?.total || 0),
      };
    });

    const successRate = percentage(totalUnits - recalledUnits, totalUnits);
    const trustScore = factory.trustScore || 0;

    res.json({
      success: true,
      profile: {
        type: 'factory',
        id: factory._id,
        name: factory.name,
        logoUrl: factory.logoUrl,
        verified: factory.verified,
        country: factory.factoryDetails?.location || 'Location not provided',
        joinedDate: factory.createdAt,
        trustScore,
        trustLevel: trustLevel(trustScore),
        verificationStatus: factory.verified ? 'verified' : 'pending',
        scoreBreakdown: [
          { label: 'Authenticity', value: successRate || trustScore },
          { label: 'Compliance', value: factory.verified ? Math.max(80, trustScore) : Math.min(60, trustScore) },
          { label: 'Customer Satisfaction', value: Math.max(0, trustScore - Math.min(counterfeitReports * 2, 20)) },
          { label: 'Verification Success', value: percentage(verifiedProducts.length, allProducts.length) || trustScore },
        ],
        certifications: factory.certificateUrl || factory.factoryDetails?.certificateNo
          ? [{
              id: `cert-${factory._id}`,
              name: factory.factoryDetails?.certificateNo || 'Factory certificate',
              issuingAuthority: factory.certificateUrl ? 'VeriChain submitted certificate' : 'Factory registry',
              status: factory.verified ? 'active' : 'pending',
              expirationDate: null,
              certificateUrl: factory.certificateUrl,
            }]
          : [],
        products,
        timeline: buildFactoryTimeline(factory, verifiedProducts, totalUnits),
        statistics: {
          totalProducts: allProducts.length,
          verifiedProducts: verifiedProducts.length,
          verificationRequests: allProducts.length,
          successRate,
          counterfeitReports,
          monthlyVerifications,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/profiles/seller/:id
// @desc    Public read-only seller trust profile
router.get('/seller/:id', async (req: Request, res: Response, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 404, 'Seller profile not found');
    }

    const seller = await User.findOne({ _id: req.params.id, role: 'seller' }).select(publicUserFields).lean();
    if (!seller) {
      return sendError(res, 404, 'Seller profile not found');
    }

    const listedItems = await ItemInstance.find({ currentOwner: seller._id, status: 'listed' })
      .populate('product', productFields)
      .sort({ updatedAt: -1 })
      .lean();

    const products = listedItems.map((item: any) => ({
      _id: item._id,
      imageUrl: item.product?.imageUrl,
      name: item.product?.name || 'Listed product',
      brand: item.product?.sku || 'VeriChain',
      authenticityStatus: item.product?.verifiedStatus || 'pending',
      availableQuantity: 1,
      price: null,
      category: item.product?.category,
    }));

    const { currentStart, previousStart } = monthWindow();
    const purchaseRegex = new RegExp(`seller ${seller._id.toString()}$`);

    const [totalSales, currentSales, previousSales, returnedOrders, counterfeitReports] = await Promise.all([
      AuditLog.countDocuments({ action: 'ITEM_PURCHASED', details: purchaseRegex }),
      AuditLog.countDocuments({ action: 'ITEM_PURCHASED', details: purchaseRegex, createdAt: { $gte: currentStart } }),
      AuditLog.countDocuments({ action: 'ITEM_PURCHASED', details: purchaseRegex, createdAt: { $gte: previousStart, $lt: currentStart } }),
      ItemInstance.countDocuments({ currentOwner: seller._id, status: 'recalled' }),
      Complaint.countDocuments({ seller: seller._id }),
    ]);

    const trustScore = seller.trustScore || 0;
    const orderCompletionRate = percentage(totalSales, totalSales + returnedOrders);
    const monthlyGrowth = previousSales > 0 ? Math.round(((currentSales - previousSales) / previousSales) * 100) : currentSales > 0 ? 100 : 0;

    res.json({
      success: true,
      profile: {
        type: 'seller',
        id: seller._id,
        name: seller.name,
        logoUrl: seller.logoUrl,
        trustScore,
        trustLevel: trustLevel(trustScore),
        averageRating: seller.verified ? 4.8 : 0,
        location: seller.factoryDetails?.location || 'Location not provided',
        memberSince: seller.createdAt,
        verified: seller.verified,
        scoreBreakdown: [
          { label: 'Order Fulfillment', value: orderCompletionRate || trustScore },
          { label: 'Response Quality', value: seller.verified ? Math.max(80, trustScore) : Math.min(60, trustScore) },
          { label: 'Customer Satisfaction', value: Math.max(0, trustScore - Math.min(counterfeitReports * 2, 20)) },
        ],
        products,
        responseStatistics: {
          averageResponseTime: 'Not enough data',
          messagesAnswered: 0,
          supportRating: seller.verified ? 4.8 : 0,
          orderCompletionRate,
        },
        reviews: [],
        salesStatistics: {
          totalSales,
          verifiedSales: totalSales,
          successfulOrders: totalSales,
          returnedOrders,
          monthlyGrowth,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
