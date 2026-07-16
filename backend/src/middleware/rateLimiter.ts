// src/middleware/rateLimiter.ts
// Instantiate rate limiter middlewares using express-rate-limit and configurations from utils/constants.

import rateLimit from 'express-rate-limit';
import { authLimiter as authConfig, lookupLimiter as lookupConfig, uploadLimiter as uploadConfig, batchLimiter as batchConfig } from '../utils/constants';

export const authLimiter = rateLimit(authConfig);
export const lookupLimiter = rateLimit(lookupConfig);
export const uploadLimiter = rateLimit(uploadConfig);
export const batchLimiter = rateLimit(batchConfig);
