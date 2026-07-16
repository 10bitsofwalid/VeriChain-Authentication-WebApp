import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import AlertBanner from '../components/ui/AlertBanner';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import './Auth.css';

export default function AcceptInvite() {
  const { acceptInvitation, error, clearError } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token') || '';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    clearError();
    if (!token) {
      setLocalError('Invitation token is missing. Please check your invitation link.');
    }
  }, [token, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!token) {
      setLocalError('No invitation token present.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await acceptInvitation(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch {
      // Error handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card glass-card animate-fade-in-up" style={{ maxWidth: 440 }}>
        <div className="auth-header">
          <div className="auth-logo">
            <Shield size={28} />
            <span className="text-gradient">VeriChain</span>
          </div>
          <h1>Activate Account</h1>
          <p>Complete your admin or moderator registration</p>
        </div>

        {localError && (
          <AlertBanner
            type="error"
            message={localError}
            onDismiss={() => setLocalError('')}
            style={{ marginBottom: 'var(--space-md)' }}
          />
        )}

        {error && (
          <AlertBanner
            type="error"
            message={error}
            onDismiss={clearError}
            style={{ marginBottom: 'var(--space-md)' }}
          />
        )}

        {success ? (
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 'var(--space-md)', 
              textAlign: 'center',
              padding: 'var(--space-md) 0'
            }}
          >
            <div style={{ color: 'var(--color-success)', background: 'var(--color-success-bg)', borderRadius: '50%', padding: '16px' }}>
              <CheckCircle size={48} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Activation Successful!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Your account has been fully activated. You are being redirected to the dashboard...
            </p>
            <Loader className="spin" size={24} color="var(--accent-cyan)" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="invite-password">Set Password</label>
              <div className="input-icon-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="invite-password"
                  type="password"
                  className="form-input input-with-icon"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={!token || submitting}
                  minLength={6}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="invite-confirm-password">Confirm Password</label>
              <div className="input-icon-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="invite-confirm-password"
                  type="password"
                  className="form-input input-with-icon"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={!token || submitting}
                  minLength={6}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg auth-submit" 
              disabled={submitting || !token}
            >
              {submitting ? <Loader size={18} className="spin" /> : 'Activate Account'}
            </button>
          </form>
        )}

        <p className="auth-switch" style={{ marginTop: 'var(--space-md)' }}>
          Back to <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
