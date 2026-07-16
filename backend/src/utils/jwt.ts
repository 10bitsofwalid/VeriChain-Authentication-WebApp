// src/utils/jwt.ts
// Shared JWT signing utility.

import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET environment variable is missing.');
}

const JWT_SECRET = process.env.JWT_SECRET;

export const signToken = (id: string, role: string, verified: boolean): string => {
  return jwt.sign({ id, role, verified }, JWT_SECRET, { expiresIn: '30d' });
};
