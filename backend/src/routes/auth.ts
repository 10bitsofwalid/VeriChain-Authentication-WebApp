import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Invitation } from '../models/Invitation';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'verichain-super-secret-key';

// Helper to sign JWT
const signToken = (id: string, role: string, verified: boolean) => {
  return jwt.sign({ id, role, verified }, JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/signup
// @desc    Register a new buyer, seller, or factory
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, role, factoryLocation, factoryCapacity, factoryCertificateNo, logoUrl, certificateUrl } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (['moderator', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Moderator and Admin accounts cannot self-register. They must be invited.',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
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
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
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
      return res.status(404).json({ success: false, message: 'User not found' });
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
      return res.status(403).json({ success: false, message: 'Only administrators can issue invites' });
    }

    const { email, name, role, password } = req.body;
    if (!email || !name || !role || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password and role' });
    }

    if (!['moderator', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Can only invite moderators or admins' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
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
router.post('/accept-invite', async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Please provide token and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const invitation = await Invitation.findOne({ token });
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invalid invitation token' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ success: false, message: `This invitation has already been ${invitation.status}` });
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({ success: false, message: 'This invitation has expired' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: invitation.email });
    if (userExists) {
      invitation.status = 'accepted';
      await invitation.save();
      return res.status(400).json({ success: false, message: 'User already exists' });
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
