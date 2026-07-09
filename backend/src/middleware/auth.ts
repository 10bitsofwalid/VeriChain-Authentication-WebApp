import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'buyer' | 'seller' | 'factory' | 'moderator' | 'admin';
    verified: boolean;
  };
}

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET environment variable is missing.');
}
const JWT_SECRET = process.env.JWT_SECRET;

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = '';

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: 'buyer' | 'seller' | 'factory' | 'moderator' | 'admin';
      verified: boolean;
    };

    // Look up user from database to ensure they still exist and check fresh verification status
    const dbUser = await User.findById(decoded.id);
    if (!dbUser) {
      return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists' });
    }

    req.user = {
      id: dbUser._id.toString(),
      role: dbUser.role,
      verified: dbUser.verified,
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user?.role || 'unknown'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

export const ensureVerified = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.verified) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Your account is pending verification approval by an administrator.',
    });
  }
  next();
};
