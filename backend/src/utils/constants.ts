// src/utils/constants.ts
// Centralized configuration constants and exports for rate limiting and other shared settings.

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const authLimiter = {
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: 20,
  message: {
    success: false,
    message: 'Too many login or signup attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
};

export const lookupLimiter = {
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: 100,
  message: {
    success: false,
    message: 'Too many verification lookup requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
};

export const uploadLimiter = {
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: 30,
  message: {
    success: false,
    message: 'Too many upload attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
};

export const batchLimiter = {
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: 10,
  message: {
    success: false,
    message: 'Too many batch generation requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
};

// Export for convenience
export default {
  authLimiter,
  lookupLimiter,
  uploadLimiter,
  batchLimiter,
  RATE_LIMIT_WINDOW_MS,
};
