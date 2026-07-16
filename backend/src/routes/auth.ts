import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Invitation } from '../models/Invitation';
import { protect, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { validateRequest } from '../utils/validation';
import { authLimiter } from '../middleware/rateLimiter';
import { signToken } from '../utils/jwt';
import { sendError } from '../utils/errorResponse';

const router = Router();
router.use(authLimiter);

const signupSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.string().refine((val) => ['buyer', 'seller', 'factory'].includes(val), {
      message: "Role must be 'buyer', 'seller', or 'factory'",
    }),
    factoryLocation: z.string().optional(),
    factoryCapacity: z.string().optional(),
    factoryCertificateNo: z.string().optional(),
    logoUrl: z.string().optional(),
    certificateUrl: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const acceptInviteSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

// @route   POST /api/auth/signup
// @desc    Register a new buyer, seller, or factory
router.post('/signup', validateRequest(signupSchema), async (req, res, next) => {
  try {
    const { name, email, password, role, factoryLocation, factoryCapacity, factoryCertificateNo, logoUrl, certificateUrl } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 400, 'User already exists with this email');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const factoryDetails = role === 'factory' ? {
      location: factoryLocation || '',
      capacity: factoryCapacity || '',
      certificateNo: factoryCertificateNo || '',
    } : undefined;

    const user = await User.create({
      name,
      email,
      role,
      passwordHash,
      verified: role === 'buyer', // Buyers are verified by default; Sellers and Factories need Admin verification
      factoryDetails,
      logoUrl,
      certificateUrl,
    });

    const token = signToken(user._id.toString(), user.role, user.verified);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        trustScore: user.trustScore,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
router.post('/login', validateRequest(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const token = signToken(user._id.toString(), user.role, user.verified);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        trustScore: user.trustScore,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user details
router.get('/me', protect, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/invite
// @desc    Invite moderator or admin (admin-only)
router.post('/invite', protect, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return sendError(res, 403, 'Only administrators can issue invites');
    }

    const { email, name, role, password } = req.body;
    if (!email || !name || !role || !password) {
      return sendError(res, 400, 'Please provide name, email, password and role');
    }

    if (!['moderator', 'admin'].includes(role)) {
      return sendError(res, 400, 'Can only invite moderators or admins');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 400, 'User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      role,
      passwordHash,
      verified: true, // Invited accounts are auto-verified
    });

    res.status(201).json({
      success: true,
      message: `${role} account created successfully.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/accept-invite
// @desc    Accept invitation and activate account
router.post('/accept-invite', validateRequest(acceptInviteSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const invitation = await Invitation.findOne({ token });
    if (!invitation) {
      return sendError(res, 404, 'Invalid invitation token');
    }

    if (invitation.status !== 'pending') {
      return sendError(res, 400, `This invitation has already been ${invitation.status}`);
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      return sendError(res, 400, 'This invitation has expired');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: invitation.email });
    if (userExists) {
      invitation.status = 'accepted';
      await invitation.save();
      return sendError(res, 400, 'User already exists');
    }

    // Create user account
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: invitation.name,
      email: invitation.email,
      role: invitation.role,
      passwordHash,
      verified: true, // Invited accounts are auto-verified
    });

    invitation.status = 'accepted';
    await invitation.save();

    const jwtToken = signToken(user._id.toString(), user.role, user.verified);

    res.status(200).json({
      success: true,
      message: 'Account activated successfully',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
