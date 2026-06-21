import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { persistState, retrieveState } from '../utils/storage';

// Types for cart items – assuming product has at least id, name, price, image
export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
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
  | { type: 'ADD_TO_WISHLIST'; payload: Product }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'ADD_TO_COMPARE'; payload: Product }
  | { type: 'REMOVE_FROM_COMPARE'; payload: string };

const initialState: ShoppingState = {
  cart: retrieveState('shopping_cart') || [],
  wishlist: retrieveState('shopping_wishlist') || [],
  compare: retrieveState('shopping_compare') || [],
};

function shoppingReducer(state: ShoppingState, action: ShoppingAction): ShoppingState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      // Avoid duplicates
      const exists = state.cart.some((p) => p.id === action.payload.id);
      if (exists) return state;
      const newCart = [...state.cart, action.payload];
      persistState('shopping_cart', newCart);
      return { ...state, cart: newCart };
    }
    case 'REMOVE_FROM_CART': {
      const newCart = state.cart.filter((p) => p.id !== action.payload);
      persistState('shopping_cart', newCart);
      return { ...state, cart: newCart };
    }
    case 'ADD_TO_WISHLIST': {
      const exists = state.wishlist.some((p) => p.id === action.payload.id);
      if (exists) return state;
      const newWish = [...state.wishlist, action.payload];
      persistState('shopping_wishlist', newWish);
      return { ...state, wishlist: newWish };
    }
    case 'REMOVE_FROM_WISHLIST': {
      const newWish = state.wishlist.filter((p) => p.id !== action.payload);
      persistState('shopping_wishlist', newWish);
      return { ...state, wishlist: newWish };
    }
    case 'ADD_TO_COMPARE': {
      const exists = state.compare.some((p) => p.id === action.payload.id);
      if (exists) return state;
      const newComp = [...state.compare, action.payload];
      persistState('shopping_compare', newComp);
      return { ...state, compare: newComp };
    }
    case 'REMOVE_FROM_COMPARE': {
      const newComp = state.compare.filter((p) => p.id !== action.payload);
      persistState('shopping_compare', newComp);
      return { ...state, compare: newComp };
    }
    default:
      return state;
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
