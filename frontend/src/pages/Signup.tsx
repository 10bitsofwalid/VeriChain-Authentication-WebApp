import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AlertBanner from '../components/ui/AlertBanner';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User, Loader, MapPin, Award, Hash } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import './Auth.css';

export default function Signup() {
  const { signup, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    factoryLocation: '',
    factoryCapacity: '',
    factoryCertificateNo: '',
    logoUrl: '',
    certificateUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    clearError();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch {
      // error handled by context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card glass-card animate-fade-in-up" style={{ maxWidth: 460 }}>
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <Shield size={28} />
            <span className="text-gradient">VeriChain</span>
          </Link>
          <h1>Create Account</h1>
          <p>Join the authenticity network</p>
        </div>

        {error && (
          <AlertBanner
            type="error"
            message={error}
            onDismiss={clearError}
            style={{ marginBottom: 'var(--space-md)' }}
          />
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="signup-name">Full Name</label>
            <div className="input-icon-wrapper">
              <User size={16} className="input-icon" />
              <input
                id="signup-name"
                type="text"
                className="form-input input-with-icon"
                placeholder="John Doe"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email</label>
            <div className="input-icon-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="signup-email"
                type="email"
                className="form-input input-with-icon"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="signup-password"
                type="password"
                className="form-input input-with-icon"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-role">I am a...</label>
            <select
              id="signup-role"
              className="form-select"
              value={form.role}
              onChange={e => update('role', e.target.value)}
            >
              <option value="buyer">Buyer — I purchase products</option>
              <option value="seller">Seller — I resell products</option>
              <option value="factory">Factory — I manufacture products</option>
            </select>
          </div>

          {form.role === 'seller' && (
            <div className="seller-fields animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <FileUpload
                label="Store/Brand Logo"
                accept=".jpg,.jpeg,.png,.webp"
                maxSizeMB={2}
                value={form.logoUrl}
                onChange={(url) => update('logoUrl', url)}
                type="image"
              />
            </div>
          )}

          {form.role === 'factory' && (
            <div className="factory-fields animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="signup-location">Factory Location</label>
                <div className="input-icon-wrapper">
                  <MapPin size={16} className="input-icon" />
                  <input
                    id="signup-location"
                    type="text"
                    className="form-input input-with-icon"
                    placeholder="e.g. Shenzhen, China"
                    value={form.factoryLocation}
                    onChange={e => update('factoryLocation', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="signup-capacity">Production Capacity</label>
                <div className="input-icon-wrapper">
                  <Award size={16} className="input-icon" />
                  <input
                    id="signup-capacity"
                    type="text"
                    className="form-input input-with-icon"
                    placeholder="e.g. 10,000 units/month"
                    value={form.factoryCapacity}
                    onChange={e => update('factoryCapacity', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="signup-cert">Certificate No.</label>
                <div className="input-icon-wrapper">
                  <Hash size={16} className="input-icon" />
                  <input
                    id="signup-cert"
                    type="text"
                    className="form-input input-with-icon"
                    placeholder="ISO/GMP certificate number"
                    value={form.factoryCertificateNo}
                    onChange={e => update('factoryCertificateNo', e.target.value)}
                  />
                </div>
              </div>
              <FileUpload
                label="Company/Brand Logo"
                accept=".jpg,.jpeg,.png,.webp"
                maxSizeMB={2}
                value={form.logoUrl}
                onChange={(url) => update('logoUrl', url)}
                type="image"
              />
              <FileUpload
                label="Factory Certificate Document"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                maxSizeMB={5}
                value={form.certificateUrl}
                onChange={(url) => update('certificateUrl', url)}
                type="any"
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={submitting}>
            {submitting ? <Loader size={18} className="spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
