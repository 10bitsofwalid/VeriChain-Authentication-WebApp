import { useState } from 'react';
import { User, ShieldCheck, MapPin, CreditCard, Lock, Check, Edit2, Plus, Key } from 'lucide-react';
import './BuyerExperience.css';
import BuyerNav from './BuyerNav';
import { mockProfile } from './mockData';

export default function ProfilePage() {
  const [profile, setProfile] = useState(mockProfile);
  const [editing, setEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({ ...prev, ...form }));
    setEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="buyer-page">
      <BuyerNav />

      <div className="bx-header">
        <div className="bx-header-left">
          <h1>Buyer Profile</h1>
          <p>Manage your account credentials, shipping addresses, and security settings</p>
        </div>
        <button
          className={editing ? 'bx-btn-ghost' : 'bx-btn-primary'}
          onClick={() => setEditing(!editing)}
        >
          <Edit2 size={15} /> {editing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      {savedSuccess && (
        <div style={{
          marginBottom: 'var(--space-md)',
          padding: '12px 16px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: '#059669',
          fontWeight: 600,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <Check size={16} /> Profile information updated successfully!
        </div>
      )}

      <div className="bx-profile-grid">
        {/* Left Sidebar: Profile Summary Card & Trust Score */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="bx-card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
            <div style={{ margin: '0 auto var(--space-md)', display: 'flex', justifyContent: 'center' }}>
              <div className="bx-avatar-ring">
                <img src={profile.avatar} alt={profile.name} className="bx-avatar" />
              </div>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
              {profile.name}
            </h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 'var(--space-md)' }}>
              {profile.username}
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md)',
              marginBottom: 'var(--space-md)'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Platform Trust Score
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                {profile.trustScore}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4 }}>
                <ShieldCheck size={12} /> Verified Authentic Buyer
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Member since {profile.joinDate}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bx-card" style={{ padding: 'var(--space-lg)' }}>
            <div className="bx-section-title">Account Activity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Purchases</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{profile.totalPurchases} orders</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Spend</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${profile.totalSpent.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Verified Serial Items</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{profile.verifiedItems} items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {/* General Information */}
          <div className="bx-card" style={{ padding: 'var(--space-xl)' }}>
            <div className="bx-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-lg)' }}>
              <User size={18} color="var(--accent-cyan)" /> General Information
            </div>

            {editing ? (
              <form onSubmit={handleSave}>
                <div className="bx-form-row">
                  <div className="bx-form-group">
                    <label className="bx-form-label">Full Name</label>
                    <input
                      className="bx-form-input"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="bx-form-group">
                    <label className="bx-form-label">Email Address</label>
                    <input
                      className="bx-form-input"
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="bx-form-row">
                  <div className="bx-form-group">
                    <label className="bx-form-label">Phone Number</label>
                    <input
                      className="bx-form-input"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="bx-form-group">
                    <label className="bx-form-label">Location</label>
                    <input
                      className="bx-form-input"
                      value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                  <button type="submit" className="bx-btn-primary">Save Changes</button>
                  <button type="button" className="bx-btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="bx-form-row">
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Full Name</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{profile.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Email Address</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{profile.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Phone</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{profile.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Location</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{profile.location}</div>
                </div>
              </div>
            )}
          </div>

          {/* Saved Addresses */}
          <div className="bx-card" style={{ padding: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <div className="bx-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <MapPin size={18} color="var(--accent-cyan)" /> Saved Shipping Addresses
              </div>
              <button className="bx-btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                <Plus size={14} /> Add Address
              </button>
            </div>

            <div className="bx-selector-grid">
              {profile.addresses.map(addr => (
                <div key={addr.id} className={`bx-selector-card ${addr.isDefault ? 'selected' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {addr.label} {addr.isDefault && '(Default)'}
                    </span>
                    <button className="bx-btn-ghost" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Edit</button>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{addr.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 4 }}>
                    {addr.line1}<br />
                    {addr.line2 && <>{addr.line2}<br /></>}
                    {addr.city}, {addr.country} {addr.zip}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bx-card" style={{ padding: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <div className="bx-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <CreditCard size={18} color="var(--accent-cyan)" /> Payment Methods
              </div>
              <button className="bx-btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                <Plus size={14} /> Add Card
              </button>
            </div>

            <div className="bx-selector-grid">
              {profile.paymentMethods.map(pm => (
                <div key={pm.id} className={`bx-selector-card ${pm.isDefault ? 'selected' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="bx-card-brand">
                      {pm.type === 'visa' ? '💳 VISA' : '💳 MASTERCARD'}
                    </span>
                    {pm.isDefault && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>Default</span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: 12, letterSpacing: '0.1em' }}>
                    •••• •••• •••• {pm.last4}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Expires {pm.expiry}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Authentication */}
          <div className="bx-card" style={{ padding: 'var(--space-xl)' }}>
            <div className="bx-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-md)' }}>
              <Lock size={18} color="var(--accent-cyan)" /> Security & Authentication
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Two-Factor Authentication (2FA)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Secure your account with authenticator codes during checkout</div>
                </div>
                <span className="bx-status bx-status-shipped">Enabled</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Password & Credentials</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last changed 3 months ago</div>
                </div>
                <button className="bx-btn-ghost" style={{ fontSize: '0.8rem' }}>
                  <Key size={14} /> Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
