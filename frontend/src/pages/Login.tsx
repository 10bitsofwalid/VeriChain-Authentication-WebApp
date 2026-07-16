import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AlertBanner from '../components/ui/AlertBanner';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, Loader } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
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
      <div className="auth-card glass-card animate-fade-in-up">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <Shield size={28} />
            <span className="text-gradient">VeriChain</span>
          </Link>
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
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
            <label className="form-label" htmlFor="login-email">Email</label>
            <div className="input-icon-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="login-email"
                type="email"
                className="form-input input-with-icon"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); clearError(); }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="login-password"
                type="password"
                className="form-input input-with-icon"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); clearError(); }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={submitting}>
            {submitting ? <Loader size={18} className="spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
