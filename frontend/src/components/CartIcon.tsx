import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import CartModal from './CartModal';
import { useShopping } from '../context/ShoppingContext';
import './CartIcon.css';

export default function CartIcon() {
  const { cart } = useShopping();
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen(!open);

  return (
    <>
      <button className="cart-icon-button" onClick={toggle} aria-label="Open cart">
        <ShoppingBag size={24} />
        {cart.length > 0 && (
          <span className="cart-badge" aria-label={`${cart.length} items in cart`}>{cart.length}</span>
        )}
      </button>
      {open && <CartModal onClose={toggle} />}
    </>
  );
}
