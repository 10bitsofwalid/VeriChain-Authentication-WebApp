import { useShopping } from '../context/ShoppingContext';
import './CartModal.css';
import { X } from 'lucide-react';

interface CartModalProps {
  onClose: () => void;
}

export default function CartModal({ onClose }: CartModalProps) {
  const { cart, dispatch } = useShopping();

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={e => e.stopPropagation()}>
        <div className="cart-modal-header">
          <h2>Your Cart</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>
        {cart.length === 0 ? (
          <p className="empty-cart">Your cart is empty.</p>
        ) : (
          <ul className="cart-items-list">
            {cart.map(item => (
              <li key={item.id} className="cart-item">
                {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="cart-item-image" />}
                <div className="cart-item-details">
                  <span className="cart-item-name">{item.name}</span>
                  <span className="cart-item-price">${item.price.toFixed(2)}</span>
                </div>
                <div className="quantity-controls">
                  <button className="decrease-btn" onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: (item.quantity ?? 1) - 1 } })} aria-label="Decrease quantity">−</button>
                  <span className="item-quantity">{item.quantity ?? 1}</span>
                  <button className="increase-btn" onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: (item.quantity ?? 1) + 1 } })} aria-label="Increase quantity">+</button>
                </div>
                <button className="remove-btn" onClick={() => handleRemove(item.id)} aria-label="Remove item">×</button>
              </li>
            ))}
          </ul>
        )}
        <div className="cart-actions">
          <button className="clear-cart-btn" onClick={() => dispatch({ type: 'CLEAR_CART' })}>Clear Cart</button>
          {/* Placeholder for checkout button; will navigate to /cart or checkout page */}
        </div>
        {/* Future: Add checkout button */}
      </div>
    </div>
  );
}
