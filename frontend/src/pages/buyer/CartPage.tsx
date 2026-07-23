import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ShieldCheck, AlertTriangle, ArrowRight, ShoppingBag, Plus, RefreshCw, Lock, RotateCcw } from 'lucide-react';
import './BuyerExperience.css';
import BuyerNav from './BuyerNav';
import { useShopping } from '../../context/ShoppingContext';
import { mockCartItems } from './mockData';

export default function CartPage() {
  const { cart, dispatch } = useShopping();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Fallback helper to format numbers safely
  const formatPrice = (val: any) => (Number(val) || 0).toFixed(2);

  // Use items from ShoppingContext, or if user wants to seed mock items
  const items = cart;

  const updateQty = (id: string, newQty: number) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id, quantity: Math.max(0, newQty) },
    });
  };

  const removeItem = (id: string) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: id,
    });
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

  const subtotal = items.reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity ?? 1), 0);
  const promoDiscount = promoApplied ? subtotal * 0.1 : 0;
  const shipping = subtotal > 200 || subtotal === 0 ? 0 : 14.99;
  const total = Math.max(0, subtotal - promoDiscount + shipping);

  const totalQty = items.reduce((s, i) => s + (i.quantity ?? 1), 0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'VERI10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid code. Try "VERI10" for 10% off.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="buyer-page">
        <BuyerNav cartCount={0} />
        <div className="bx-empty" style={{ marginTop: '30px' }}>
          <div className="bx-empty-icon">
            <ShoppingCart size={38} />
          </div>
          <h2>Your cart is currently empty</h2>
          <p>Add verified authentic products to your cart from our marketplace to proceed with your order.</p>
          
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'var(--space-md)' }}>
            <Link to="/dashboard/marketplace" className="bx-btn-primary">
              <ShoppingBag size={16} /> Browse Marketplace
            </Link>
            <button className="bx-btn-ghost" onClick={seedMockItems}>
              <Plus size={16} /> Load Demo Verified Items
            </button>
          </div>
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
            <span className="bx-count-badge">{totalQty}</span>
          </h1>
          <p>Review your verified items and proceed to secure checkout</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <button className="bx-btn-ghost" onClick={() => dispatch({ type: 'CLEAR_CART' })}>
            <Trash2 size={14} /> Clear Cart
          </button>
          <Link to="/buyer/checkout" className="bx-btn-primary">
            Proceed to Checkout <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <div className="bx-cart-grid">
        {/* Items list */}
        <div className="bx-card">
          <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Cart Items ({items.length} unique products)
            </span>
            <button className="bx-btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={seedMockItems}>
              <RefreshCw size={12} /> Reset Demo Data
            </button>
          </div>

          {items.map((item, idx) => {
            const itemQty = item.quantity ?? 1;
            const itemPrice = Number(item.price) || 0;
            const itemImg = item.imageUrl || (item as any).image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80';
            const isVerified = (item as any).verified !== false;
            const serialNum = (item as any).serialNumber || `VC-SN-${item.id.slice(-6).toUpperCase()}`;

            return (
              <div key={item.id || idx}>
                <div className="bx-product-row">
                  <img src={itemImg} alt={item.name} className="bx-product-img" />
                  
                  <div className="bx-product-info">
                    <div className="bx-product-name">{item.name || 'Verified Product'}</div>
                    <div className="bx-product-brand">{(item as any).brand || 'VeriChain Authenticated'}</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', margin: '4px 0 8px 0' }}>
                      {isVerified ? (
                        <span className="bx-verified">
                          <ShieldCheck size={11} /> Verified Authentic
                        </span>
                      ) : (
                        <span className="bx-unverified">
                          <AlertTriangle size={11} /> Unverified
                        </span>
                      )}
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        #{serialNum}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                      <div className="bx-qty-stepper">
                        <button className="bx-qty-btn" onClick={() => updateQty(item.id, itemQty - 1)}>−</button>
                        <span className="bx-qty-value">{itemQty}</span>
                        <button className="bx-qty-btn" onClick={() => updateQty(item.id, itemQty + 1)}>+</button>
                      </div>
                      <button className="bx-btn-danger" onClick={() => removeItem(item.id)}>
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      ${formatPrice(itemPrice * itemQty)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      ${formatPrice(itemPrice)} ea.
                    </div>
                  </div>
                </div>
                {idx < items.length - 1 && <div style={{ height: '1px', background: 'var(--border-subtle)' }} />}
              </div>
            );
          })}
        </div>

        {/* Order Summary & Checkout Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="bx-card" style={{ padding: 'var(--space-lg)' }}>
            <div className="bx-section-title">Order Summary</div>
            
            <div className="bx-summary-box">
              <div className="bx-summary-row">
                <span>Subtotal ({totalQty} items)</span>
                <span>${formatPrice(subtotal)}</span>
              </div>

              {promoApplied && (
                <div className="bx-summary-row" style={{ color: '#059669' }}>
                  <span>Promo Discount (10%)</span>
                  <span>−${formatPrice(promoDiscount)}</span>
                </div>
              )}

              <div className="bx-summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span style={{ color: '#059669', fontWeight: 600 }}>FREE</span> : `$${formatPrice(shipping)}`}</span>
              </div>

              <div className="bx-summary-row total">
                <span>Estimated Total</span>
                <span style={{ color: 'var(--accent-cyan)' }}>${formatPrice(total)}</span>
              </div>
            </div>

            {shipping > 0 && (
              <div style={{
                marginTop: 'var(--space-md)',
                padding: '10px 14px',
                background: 'rgba(0, 88, 188, 0.05)',
                border: '1px solid rgba(0, 88, 188, 0.15)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                🚚 Add ${(200 - subtotal).toFixed(2)} more for <strong>FREE shipping</strong>!
              </div>
            )}

            {/* Promo Code Box */}
            <form onSubmit={handleApplyPromo} style={{ marginTop: 'var(--space-md)' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                Promo / Coupon Code
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  placeholder="Enter VERI10"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="bx-form-input"
                  style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                />
                <button type="submit" className="bx-btn-ghost" style={{ padding: '8px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  Apply
                </button>
              </div>
              {promoError && <div style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: 4 }}>{promoError}</div>}
              {promoApplied && <div style={{ color: '#059669', fontSize: '0.75rem', marginTop: 4 }}>✓ 10% Discount code VERI10 applied!</div>}
            </form>

            <Link to="/buyer/checkout" className="bx-btn-primary" style={{ width: '100%', marginTop: 'var(--space-lg)', justifyContent: 'center', padding: '12px 20px', fontSize: '0.95rem' }}>
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
            
            <Link to="/dashboard/marketplace" className="bx-btn-ghost" style={{ width: '100%', marginTop: 'var(--space-sm)', justifyContent: 'center' }}>
              Continue Shopping
            </Link>
          </div>

          {/* Trust badges */}
          <div className="bx-card" style={{ padding: 'var(--space-md)' }}>
            {[
              [<Lock size={16} color="var(--accent-cyan)" />, 'SSL Encrypted Checkout', '256-bit bank grade encryption'],
              [<ShieldCheck size={16} color="#059669" />, 'Authenticity Guaranteed', 'Blockchain NFC & Serial verified'],
              [<RotateCcw size={16} color="#06b6d4" />, '30-Day Easy Returns', '100% money back guarantee'],
            ].map(([icon, title, sub], i) => (
              <div key={title} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {icon}
                </div>
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
