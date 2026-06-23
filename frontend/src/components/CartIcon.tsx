import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import CartModal from './CartModal';
import { useShopping } from '../context/ShoppingContext';
import './CartIcon.css';

export default function CartIcon() {
  const { cart } = useShopping();
  const [open, setOpen] = useState(false);

  // Calculate total quantity of items in cart
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity ?? 1), 0);

  const toggle = () => setOpen(!open);

  return (
    <>
      <button className="cart-icon-button" onClick={toggle} aria-label="Open cart">
        <ShoppingBag size={24} />
        {totalItems > 0 && (
          <span className="cart-badge" aria-label={`${totalItems} items in cart`}>{totalItems}</span>
        )}
      </button>
      {open && <CartModal onClose={toggle} />}
    </>
  );
}
