import { useState } from 'react';
import { User, ShieldCheck, Lock, Check, Edit2 } from 'lucide-react';
import './BuyerExperience.css';
import BuyerNav from './BuyerNav';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
          <p>Manage your account credentials, security settings, and verified identity</p>
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
        {/* Left Sidebar: Profile Summary Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="bx-card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
            <div style={{ margin: '0 auto var(--space-md)', display: 'flex', justifyContent: 'center' }}>
              <div className="bx-avatar-ring">
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'var(--accent-primary, #1A2B4C)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: '#fff'
                }}>
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
              {form.name || user?.name || 'Verified User'}
            </h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 'var(--space-md)' }}>
              {form.email || user?.email}
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md)',
              marginBottom: 'var(--space-md)'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Account Role
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'capitalize' }}>
                {user?.role || 'Buyer'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4 }}>
                <ShieldCheck size={12} /> {user?.verified ? 'Verified Member' : 'Active Account'}
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
                      placeholder="Optional"
                    />
                  </div>
                  <div className="bx-form-group">
                    <label className="bx-form-label">Location</label>
                    <input
                      className="bx-form-input"
                      value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      placeholder="Optional"
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
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{form.name || user?.name || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Email Address</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{form.email || user?.email || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Role</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{user?.role || 'Buyer'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Status</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: user?.verified ? '#059669' : 'var(--text-primary)' }}>
                    {user?.verified ? 'Verified' : 'Active'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Security & Authentication */}
          <div className="bx-card" style={{ padding: 'var(--space-xl)' }}>
            <div className="bx-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-md)' }}>
              <Lock size={18} color="var(--accent-cyan)" /> Security & Authentication
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Blockchain Identity Validation</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cryptographic signatures and certificate credentials mapped to your user ID</div>
                </div>
                <span className="bx-status bx-status-shipped">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
