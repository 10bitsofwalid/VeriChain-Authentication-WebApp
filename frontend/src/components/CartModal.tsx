import { useEffect, useRef } from 'react';
import { useShopping } from '../context/ShoppingContext';
import './CartModal.css';
import { X } from 'lucide-react';
import LazyImage from './LazyImage';

interface CartModalProps {
  onClose: () => void;
}

export default function CartModal({ onClose }: CartModalProps) {
  const { cart, dispatch } = useShopping();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Save focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus close button initially
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([-1])'
    );
    if (focusable && focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([-1])'
        );
        if (focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [onClose]);

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div 
        ref={modalRef}
        className="cart-modal" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className="cart-modal-header">
          <h2 id="cart-title">Your Cart</h2>
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
                {item.imageUrl && <LazyImage src={item.imageUrl} alt={item.name} className="cart-item-image" />}
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
        </div>
      </div>
    </div>
  );
}

