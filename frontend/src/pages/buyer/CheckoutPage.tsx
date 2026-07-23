import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, CreditCard, MapPin, ShieldCheck, ChevronRight } from 'lucide-react';
import './BuyerExperience.css';
import BuyerNav from './BuyerNav';
import { mockCartItems, mockProfile } from './mockData';
import { useShopping } from '../../context/ShoppingContext';

type Step = 'shipping' | 'payment' | 'review' | 'confirmed';

const STEPS: { id: Step; label: string }[] = [
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
  { id: 'confirmed', label: 'Confirmed' },
];

export default function CheckoutPage() {
  const { cart } = useShopping();
  const [step, setStep] = useState<Step>('shipping');
  const [selectedAddr, setSelectedAddr] = useState(mockProfile.addresses[0].id);
  const [selectedPM, setSelectedPM] = useState(mockProfile.paymentMethods[0].id);

  const cartItemsFormatted = cart.map(i => ({
    id: i.id,
    name: i.name,
    brand: (i as any).brand || 'VeriChain',
    price: Number(i.price) || 0,
    quantity: i.quantity ?? 1,
    image: i.imageUrl || (i as any).image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    verified: (i as any).verified !== false,
  }));

  const items = cartItemsFormatted.length > 0 ? cartItemsFormatted : mockCartItems;
  const subtotal = items.reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity ?? 1), 0);
  const shipping = subtotal > 200 || subtotal === 0 ? 0 : 14.99;
  const total = subtotal + shipping;

  const stepIndex = (s: Step) => STEPS.findIndex(x => x.id === s);
  const current = stepIndex(step);

  const next = () => {
    const steps: Step[] = ['shipping', 'payment', 'review', 'confirmed'];
    const i = steps.indexOf(step);
    if (i < steps.length - 1) setStep(steps[i + 1]);
  };

  if (step === 'confirmed') {
    return (
      <div className="buyer-page">
        <BuyerNav />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 'var(--radius-full)',
              background: 'rgba(0,88,188,0.1)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto var(--space-lg)',
              animation: 'bx-fade-in 0.4s ease',
            }}>
              <Check size={36} color="var(--accent-cyan)" strokeWidth={2.5} />
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 10 }}>Order Confirmed!</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
              Your order has been placed successfully. You'll receive a confirmation email shortly.
            </p>
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md)', marginBottom: 'var(--space-lg)',
              fontFamily: 'var(--font-mono)', fontSize: '0.9rem',
            }}>
              Order #VC-2024-00999
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/buyer/orders" className="bx-btn-primary">View Orders</Link>
              <Link to="/" className="bx-btn-ghost">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="buyer-page">
      <BuyerNav />
      <div className="bx-header">
        <div className="bx-header-left">
          <h1>Checkout</h1>
          <p>Complete your purchase securely</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bx-stepper">
        {STEPS.filter(s => s.id !== 'confirmed').map((s, i, arr) => (
          <div className="bx-step" key={s.id}>
            <div className={`bx-step-circle ${i < current ? 'done' : i === current ? 'active' : ''}`}>
              {i < current ? <Check size={14} strokeWidth={3} /> : i + 1}
            </div>
            <span className={`bx-step-label ${i === current ? 'active' : ''}`}>{s.label}</span>
            {i < arr.length - 1 && <div className={`bx-step-connector ${i < current ? 'done' : ''}`} />}
          </div>
        ))}
      </div>

      <div className="bx-checkout-grid">
        {/* Main panel */}
        <div className="bx-card" style={{ padding: 'var(--space-xl)' }}>
          {step === 'shipping' && (
            <div>
              <div className="bx-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-lg)' }}>
                <MapPin size={18} color="var(--accent-cyan)" /> Shipping Address
              </div>
              <div className="bx-selector-grid" style={{ marginBottom: 'var(--space-xl)' }}>
                {mockProfile.addresses.map(addr => (
                  <div
                    key={addr.id}
                    className={`bx-selector-card ${selectedAddr === addr.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAddr(addr.id)}
                  >
                    <div className="bx-selector-check">
                      {selectedAddr === addr.id && <Check size={11} strokeWidth={3} />}
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      {addr.label}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{addr.name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 4 }}>
                      {addr.line1}<br />{addr.line2 && <>{addr.line2}<br /></>}
                      {addr.city}, {addr.country} {addr.zip}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bx-section-title" style={{ marginBottom: 'var(--space-md)' }}>Or enter a new address</div>
              <div className="bx-form-row">
                <div className="bx-form-group">
                  <label className="bx-form-label">First Name</label>
                  <input className="bx-form-input" placeholder="Walid" />
                </div>
                <div className="bx-form-group">
                  <label className="bx-form-label">Last Name</label>
                  <input className="bx-form-input" placeholder="Al-Rasheed" />
                </div>
              </div>
              <div className="bx-form-group">
                <label className="bx-form-label">Street Address</label>
                <input className="bx-form-input" placeholder="123 King Fahd Road" />
              </div>
              <div className="bx-form-row">
                <div className="bx-form-group">
                  <label className="bx-form-label">City</label>
                  <input className="bx-form-input" placeholder="Riyadh" />
                </div>
                <div className="bx-form-group">
                  <label className="bx-form-label">Postal Code</label>
                  <input className="bx-form-input" placeholder="12211" />
                </div>
              </div>
              <div className="bx-form-group">
                <label className="bx-form-label">Country</label>
                <input className="bx-form-input" placeholder="Saudi Arabia" />
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div>
              <div className="bx-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-lg)' }}>
                <CreditCard size={18} color="var(--accent-cyan)" /> Payment Method
              </div>
              <div className="bx-selector-grid" style={{ marginBottom: 'var(--space-xl)' }}>
                {mockProfile.paymentMethods.map(pm => (
                  <div
                    key={pm.id}
                    className={`bx-selector-card ${selectedPM === pm.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPM(pm.id)}
                  >
                    <div className="bx-selector-check">
                      {selectedPM === pm.id && <Check size={11} strokeWidth={3} />}
                    </div>
                    <span className="bx-card-brand" style={{ marginBottom: 10, display: 'inline-flex' }}>
                      {pm.type === 'visa' ? '💳 VISA' : '💳 MC'}
                    </span>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: 8, letterSpacing: '0.1em' }}>
                      •••• •••• •••• {pm.last4}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Expires {pm.expiry}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bx-section-title" style={{ marginBottom: 'var(--space-md)' }}>Or add a new card</div>
              <div className="bx-form-group">
                <label className="bx-form-label">Card Number</label>
                <input className="bx-form-input" placeholder="1234 5678 9012 3456" />
              </div>
              <div className="bx-form-row">
                <div className="bx-form-group">
                  <label className="bx-form-label">Expiry Date</label>
                  <input className="bx-form-input" placeholder="MM / YY" />
                </div>
                <div className="bx-form-group">
                  <label className="bx-form-label">CVV</label>
                  <input className="bx-form-input" placeholder="•••" />
                </div>
              </div>
              <div className="bx-form-group">
                <label className="bx-form-label">Name on Card</label>
                <input className="bx-form-input" placeholder="Walid Al-Rasheed" />
              </div>
            </div>
          )}

          {step === 'review' && (
            <div>
              <div className="bx-section-title" style={{ marginBottom: 'var(--space-md)' }}>Review Your Order</div>
              {items.map(item => (
                <div key={item.id} className="bx-product-row">
                  <img src={item.image} alt={item.name} className="bx-product-img" />
                  <div className="bx-product-info">
                    <div className="bx-product-name">{item.name}</div>
                    <div className="bx-product-brand">{item.brand} · Qty: {item.quantity}</div>
                    {item.verified
                      ? <span className="bx-verified"><ShieldCheck size={10} /> Verified</span>
                      : <span className="bx-unverified">Unverified</span>
                    }
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="bx-divider" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Shipping To</div>
                  {(() => { const a = mockProfile.addresses.find(x => x.id === selectedAddr)!; return (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {a.name}<br />{a.line1}<br />{a.city}, {a.country}
                    </div>
                  ); })()}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Payment</div>
                  {(() => { const pm = mockProfile.paymentMethods.find(x => x.id === selectedPM)!; return (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {pm.type.toUpperCase()} •••• {pm.last4}
                    </div>
                  ); })()}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-xl)' }}>
            {current > 0 && (
              <button className="bx-btn-ghost" onClick={() => {
                const steps: Step[] = ['shipping', 'payment', 'review', 'confirmed'];
                setStep(steps[steps.indexOf(step) - 1]);
              }}>Back</button>
            )}
            <button className="bx-btn-primary" onClick={next}>
              {step === 'review' ? 'Place Order' : 'Continue'} <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="bx-card" style={{ padding: 'var(--space-lg)' }}>
          <div className="bx-section-title">Order Summary</div>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <img src={item.image} alt={item.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', flexShrink: 0 }}>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="bx-divider" />
          <div className="bx-summary-box">
            <div className="bx-summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="bx-summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
            <div className="bx-summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'var(--space-md)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={13} color="var(--accent-cyan)" /> All transactions are secured & encrypted
          </div>
        </div>
      </div>
    </div>
  );
}
