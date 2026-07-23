import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import { persistState, retrieveState } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

// Types for cart items – assuming product has at least id, name, price, image
export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity?: number; // optional quantity for cart handling
  // Extend as needed
}

export interface ShoppingState {
  cart: Product[];
  wishlist: Product[];
  compare: Product[];
}

export type ShoppingAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string } // payload = product id
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_TO_WISHLIST'; payload: Product }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'ADD_TO_COMPARE'; payload: Product }
  | { type: 'REMOVE_FROM_COMPARE'; payload: string };

const safeRetrieveArray = (key: string): Product[] => {
  const data = retrieveState(key);
  return Array.isArray(data) ? data : [];
};

const initialState: ShoppingState = {
  cart: safeRetrieveArray(STORAGE_KEYS.CART),
  wishlist: safeRetrieveArray(STORAGE_KEYS.WISHLIST),
  compare: safeRetrieveArray(STORAGE_KEYS.COMPARE),
};

function shoppingReducer(state: ShoppingState, action: ShoppingAction): ShoppingState {
  const cart = Array.isArray(state.cart) ? state.cart : [];
  const wishlist = Array.isArray(state.wishlist) ? state.wishlist : [];
  const compare = Array.isArray(state.compare) ? state.compare : [];

  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = cart.find((p) => p.id === action.payload.id);
      let newCart;
      if (existing) {
        newCart = cart.map((p) =>
          p.id === action.payload.id ? { ...p, quantity: (p.quantity ?? 1) + 1 } : p,
        );
      } else {
        const itemWithQty = { ...action.payload, quantity: action.payload.quantity ?? 1 };
        newCart = [...cart, itemWithQty];
      }
      persistState(STORAGE_KEYS.CART, newCart);
      return { ...state, cart: newCart, wishlist, compare };
    }
    case 'REMOVE_FROM_CART': {
      const newCart = cart.filter((p) => p.id !== action.payload);
      persistState(STORAGE_KEYS.CART, newCart);
      return { ...state, cart: newCart, wishlist, compare };
    }
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        const newCart = cart.filter((p) => p.id !== id);
        persistState(STORAGE_KEYS.CART, newCart);
        return { ...state, cart: newCart, wishlist, compare };
      }
      const newCart = cart.map((p) =>
        p.id === id ? { ...p, quantity } : p,
      );
      persistState(STORAGE_KEYS.CART, newCart);
      return { ...state, cart: newCart, wishlist, compare };
    }
    case 'CLEAR_CART': {
      persistState(STORAGE_KEYS.CART, []);
      return { ...state, cart: [], wishlist, compare };
    }
    case 'ADD_TO_WISHLIST': {
      const exists = wishlist.some((p) => p.id === action.payload.id);
      if (exists) return { ...state, cart, wishlist, compare };
      const newWish = [...wishlist, action.payload];
      persistState(STORAGE_KEYS.WISHLIST, newWish);
      return { ...state, cart, wishlist: newWish, compare };
    }
    case 'REMOVE_FROM_WISHLIST': {
      const newWish = wishlist.filter((p) => p.id !== action.payload);
      persistState(STORAGE_KEYS.WISHLIST, newWish);
      return { ...state, cart, wishlist: newWish, compare };
    }
    case 'ADD_TO_COMPARE': {
      const exists = compare.some((p) => p.id === action.payload.id);
      if (exists) return { ...state, cart, wishlist, compare };
      const newComp = [...compare, action.payload];
      persistState(STORAGE_KEYS.COMPARE, newComp);
      return { ...state, cart, wishlist, compare: newComp };
    }
    case 'REMOVE_FROM_COMPARE': {
      const newComp = compare.filter((p) => p.id !== action.payload);
      persistState(STORAGE_KEYS.COMPARE, newComp);
      return { ...state, cart, wishlist, compare: newComp };
    }
    default:
      return { ...state, cart, wishlist, compare };
  }
}

interface ShoppingContextProps extends ShoppingState {
  dispatch: React.Dispatch<ShoppingAction>;
}

const ShoppingContext = createContext<ShoppingContextProps | undefined>(undefined);

export const ShoppingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(shoppingReducer, initialState);

  return (
    <ShoppingContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ShoppingContext.Provider>
  );
};

export const useShopping = (): ShoppingContextProps => {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error('useShopping must be used within a ShoppingProvider');
  }
  return context;
};
