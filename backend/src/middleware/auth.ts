import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'buyer' | 'seller' | 'factory' | 'moderator' | 'admin';
    verified: boolean;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'verichain-super-secret-key';

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
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
    req.user = decoded;
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
