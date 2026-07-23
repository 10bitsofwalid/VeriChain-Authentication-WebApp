import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ShieldCheck, AlertTriangle, ArrowRight, ShoppingBag } from 'lucide-react';
import './BuyerExperience.css';
import BuyerNav from './BuyerNav';
import { mockCartItems } from './mockData';
import type { CartItem } from './mockData';

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(mockCartItems);

  const updateQty = (id: string, delta: number) => {
    setItems(prev =>
      prev
        .map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
        .filter(i => i.quantity > 0)
    );
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = items.reduce((s, i) => s + ((i.originalPrice ?? i.price) - i.price) * i.quantity, 0);
  const shipping = subtotal > 200 ? 0 : 14.99;
  const total = subtotal + shipping;

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="buyer-page">
        <BuyerNav cartCount={0} />
        <div className="bx-empty" style={{ marginTop: '40px' }}>
          <div className="bx-empty-icon">
            <ShoppingCart size={36} />
          </div>
          <h2>Your cart is empty</h2>
          <p>Add verified authentic products to your cart and they'll appear here.</p>
          <Link to="/" className="bx-btn-primary">
            <ShoppingBag size={16} /> Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="buyer-page">
      <BuyerNav cartCount={totalQty} />
      <div className="bx-header">
        <div className="bx-header-left">
          <h1>
            Shopping Cart
            <span className="bx-count-badge">{items.reduce((s, i) => s + i.quantity, 0)}</span>
          </h1>
          <p>Review your items before checkout</p>
        </div>
        <Link to="/buyer/checkout" className="bx-btn-primary">
          Proceed to Checkout <ArrowRight size={15} />
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Items list */}
        <div className="bx-card">
          {items.map((item, idx) => (
            <div key={item.id}>
              <div className="bx-product-row">
                <img src={item.image} alt={item.name} className="bx-product-img" />
                <div className="bx-product-info">
                  <div className="bx-product-name">{item.name}</div>
                  <div className="bx-product-brand">{item.brand} · {item.category}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {item.verified
                      ? <span className="bx-verified"><ShieldCheck size={10} /> Verified Authentic</span>
                      : <span className="bx-unverified"><AlertTriangle size={10} /> Unverified</span>
                    }
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      #{item.serialNumber}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                    <div className="bx-qty-stepper">
                      <button className="bx-qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                      <span className="bx-qty-value">{item.quantity}</span>
                      <button className="bx-qty-btn" onClick={() => updateQty(item.id, +1)}>+</button>
                    </div>
                    <button className="bx-btn-danger" onClick={() => removeItem(item.id)}>
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  {item.originalPrice && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      ${(item.originalPrice * item.quantity).toFixed(2)}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    ${item.price.toFixed(2)} ea.
                  </div>
                </div>
              </div>
              {idx < items.length - 1 && <div style={{ height: '1px', background: 'var(--border-subtle)' }} />}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="bx-card" style={{ padding: 'var(--space-lg)' }}>
            <div className="bx-section-title">Order Summary</div>
            <div className="bx-summary-box">
              <div className="bx-summary-row">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="bx-summary-row" style={{ color: '#059669' }}>
                  <span>Savings</span>
                  <span>−${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="bx-summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span style={{ color: '#059669' }}>Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="bx-summary-row total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {shipping > 0 && (
              <div style={{
                marginTop: 'var(--space-sm)',
                padding: '10px 14px',
                background: 'rgba(0,88,188,0.05)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                🚚 Add ${(200 - subtotal).toFixed(2)} more for free shipping
              </div>
            )}

            <Link to="/buyer/checkout" className="bx-btn-primary" style={{ width: '100%', marginTop: 'var(--space-md)', justifyContent: 'center' }}>
              Checkout Securely <ArrowRight size={15} />
            </Link>
            <Link to="/" className="bx-btn-ghost" style={{ width: '100%', marginTop: 'var(--space-sm)', justifyContent: 'center' }}>
              Continue Shopping
            </Link>
          </div>

          {/* Trust badges */}
          <div className="bx-card" style={{ padding: 'var(--space-md)' }}>
            {[
              ['🔒', 'Secure Checkout', 'SSL-encrypted payment'],
              ['✅', 'Authenticity Guaranteed', 'VeriChain verified products'],
              ['🔄', '30-Day Returns', 'Hassle-free returns'],
            ].map(([icon, title, sub]) => (
              <div key={title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
