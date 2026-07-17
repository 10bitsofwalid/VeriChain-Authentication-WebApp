// src/validation/authSchemas.ts
import { z } from 'zod';

export const signupSchema = z.object({
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

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const acceptInviteSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});
