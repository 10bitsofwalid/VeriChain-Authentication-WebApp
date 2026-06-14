import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Search,
  ArrowRight,
  CheckCircle,
  Globe,
  Lock,
  Zap,
} from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">
      {/* Nav */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <Shield size={24} />
            <span>VeriChain</span>
          </div>
          <div className="landing-nav-links">
            <Link to="/verify" className="btn btn-ghost">Verify a Product</Link>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">Log In</Link>
                <Link to="/signup" className="btn btn-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-glow" />
        <div className="hero-content animate-fade-in-up">
          <div className="hero-badge">
            <Zap size={14} />
            <span>Blockchain-Powered Authenticity</span>
          </div>
          <h1 className="hero-title">
            Verify Product
            <br />
            <span className="text-gradient">Authenticity Instantly</span>
          </h1>
          <p className="hero-subtitle">
            VeriChain provides end-to-end supply chain transparency. Track every product
            from manufacture to purchase with immutable blockchain records.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start Verifying
              <ArrowRight size={18} />
            </Link>
            <Link to="/verify" className="btn btn-secondary btn-lg">
              <Search size={18} />
              Check a Product
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">50K+</span>
              <span className="hero-stat-label">Products Verified</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">2,500+</span>
              <span className="hero-stat-label">Manufacturers</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">99.9%</span>
              <span className="hero-stat-label">Accuracy Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={f.title} className={`feature-card glass-card animate-fade-in-up delay-${i + 1}`}>
              <div className="feature-icon" style={{ background: f.bg }}>
                <f.icon size={22} color={f.color} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section animate-fade-in-up">
        <div className="cta-card glass-card">
          <h2>Ready to Protect Your Brand?</h2>
          <p>Join thousands of manufacturers securing their products with VeriChain.</p>
          <Link to="/signup" className="btn btn-primary btn-lg">
            Create Free Account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="footer-brand">
            <Shield size={18} />
            <span>VeriChain</span>
          </div>
          <p>&copy; {new Date().getFullYear()} VeriChain. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: 'Instant Verification',
    description: 'Scan a serial number to instantly verify any product\'s authenticity and trace its complete supply chain history.',
    icon: Search,
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.12)',
  },
  {
    title: 'Immutable Records',
    description: 'Every transaction is recorded with a unique hash, creating an unforgeable chain of custody from factory to consumer.',
    icon: Lock,
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
  },
  {
    title: 'Global Tracking',
    description: 'Monitor products across borders with real-time location tracking and multi-stakeholder visibility.',
    icon: Globe,
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
  },
  {
    title: 'Counterfeit Detection',
    description: 'AI-powered risk assessment flags suspicious items and helps moderators take immediate action.',
    icon: CheckCircle,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
  },
];
