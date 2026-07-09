import { Router, Request, Response } from 'express';
import { User } from '../models/User';

const router = Router();

// @route   GET /api/users
// @desc    Public list of users (filtered by role and verification status)
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const { role, verified } = req.query;
    const filter: any = {};

    if (role) {
      filter.role = role;
    }
    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }

    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    const formattedUsers = users.map((u: any) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      verified: u.verified,
      trustScore: u.trustScore ?? 0,
      logoUrl: u.logoUrl,
      certificateUrl: u.certificateUrl,
      verificationStatus: u.verified ? 'verified' : 'pending',
      country: u.factoryDetails?.location || 'Location not provided',
      factoryDetails: u.factoryDetails,
    }));

    // Return the array directly to satisfy TrustCenter.tsx
    res.json(formattedUsers);
  } catch (error) {
    next(error);
  }
});

export default router;
