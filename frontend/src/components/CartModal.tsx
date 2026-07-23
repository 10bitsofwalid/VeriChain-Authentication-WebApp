import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useShopping } from '../context/ShoppingContext';
import { mockCartItems } from '../pages/buyer/mockData';
import './CartModal.css';
import { X, Trash2, ShoppingBag, ArrowRight, Plus } from 'lucide-react';
import LazyImage from './LazyImage';

interface CartModalProps {
  onClose: () => void;
}

export default function CartModal({ onClose }: CartModalProps) {
  const { cart, dispatch } = useShopping();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const cartItems = Array.isArray(cart) ? cart : [];
  const totalQty = cartItems.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity ?? 1), 0);

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;

    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [onClose]);

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  const handleUpdateQty = (id: string, newQty: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQty } });
  };

  const seedMockItems = () => {
    dispatch({ type: 'CLEAR_CART' });
    mockCartItems.forEach(item => {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          id: item.id,
          name: item.name,
          price: item.price,
          imageUrl: item.image,
          quantity: item.quantity,
        },
      });
    });
  };

  const modalContent = (
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
          <div className="cart-modal-title-group">
            <ShoppingBag size={20} color="var(--accent-cyan, #00d2ff)" />
            <h2 id="cart-title">Shopping Cart</h2>
            {totalQty > 0 && <span className="cart-modal-count-badge">{totalQty} items</span>}
          </div>
          <button className="cart-modal-close-btn" onClick={onClose} aria-label="Close cart">
            <X size={18} />
          </button>
        </div>

        <div className="cart-modal-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart-container">
              <div className="empty-cart-icon">
                <ShoppingBag size={32} />
              </div>
              <h3 className="empty-cart-title">Your cart is empty</h3>
              <p className="empty-cart-sub">
                Explore verified authentic items in our marketplace and add them to your cart.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/dashboard/marketplace" onClick={onClose} className="bx-btn-primary" style={{ padding: '9px 18px', fontSize: '0.85rem' }}>
                  Browse Marketplace
                </Link>
                <button onClick={seedMockItems} className="bx-btn-ghost" style={{ padding: '9px 16px', fontSize: '0.82rem' }}>
                  <Plus size={14} /> Add Demo Items
                </button>
              </div>
            </div>
          ) : (
            <ul className="cart-items-list">
              {cartItems.map(item => {
                const priceVal = Number(item.price) || 0;
                const qtyVal = item.quantity ?? 1;
                const imgUrl = item.imageUrl || (item as any).image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80';

                return (
                  <li key={item.id} className="cart-item">
                    <LazyImage src={imgUrl} alt={item.name} className="cart-item-image" />
                    <div className="cart-item-details">
                      <span className="cart-item-name">{item.name || 'Authentic Product'}</span>
                      <span className="cart-item-price">${(priceVal * qtyVal).toFixed(2)}</span>
                    </div>

                    <div className="cart-item-qty-stepper">
                      <button 
                        className="cart-item-qty-btn" 
                        onClick={() => handleUpdateQty(item.id, qtyVal - 1)} 
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="cart-item-qty-val">{qtyVal}</span>
                      <button 
                        className="cart-item-qty-btn" 
                        onClick={() => handleUpdateQty(item.id, qtyVal + 1)} 
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button className="cart-item-remove-btn" onClick={() => handleRemove(item.id)} title="Remove item">
                      <Trash2 size={15} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-modal-footer">
            <div className="cart-modal-subtotal-row">
              <span className="cart-modal-subtotal-label">Subtotal</span>
              <span className="cart-modal-subtotal-value">${subtotal.toFixed(2)}</span>
            </div>

            <div className="cart-modal-actions-row">
              <Link 
                to="/buyer/cart" 
                onClick={onClose} 
                className="bx-btn-ghost" 
                style={{ flex: 1, justifyContent: 'center', padding: '10px 14px', fontSize: '0.85rem' }}
              >
                View Full Cart
              </Link>
              <Link 
                to="/buyer/checkout" 
                onClick={onClose} 
                className="bx-btn-primary" 
                style={{ flex: 1, justifyContent: 'center', padding: '10px 14px', fontSize: '0.85rem' }}
              >
                Checkout Now <ArrowRight size={14} />
              </Link>
            </div>
            
            <button 
              onClick={() => dispatch({ type: 'CLEAR_CART' })} 
              className="bx-btn-danger"
              style={{ padding: '4px 8px', fontSize: '0.75rem', alignSelf: 'center', marginTop: 2 }}
            >
              Clear All Items
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
