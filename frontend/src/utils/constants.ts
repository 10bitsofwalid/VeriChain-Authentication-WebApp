// src/utils/constants.ts
// Centralised localStorage key constants.
// All code that reads/writes localStorage MUST use these keys
// to avoid silent mismatches between writers and readers.

export const STORAGE_KEYS = {
  // Auth session
  TOKEN: 'verichain_token',
  USER: 'verichain_user',

  // Shopping state (ShoppingContext)
  CART: 'shopping_cart',
  WISHLIST: 'shopping_wishlist',
  COMPARE: 'shopping_compare',

  // Seller Sourcing page state
  SAVED_FACTORIES: 'verichain_saved_factories',
  RESERVED_BATCHES: 'verichain_reserved_batches',
  ALLOCATION_REQUESTS: 'verichain_allocation_requests',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
