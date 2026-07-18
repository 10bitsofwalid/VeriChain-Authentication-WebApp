import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => (
  <div className="auth-page">
    <div className="auth-glow" />
    <div className="auth-card glass-card animate-fade-in-up" style={{ maxWidth: 440 }}>
      <div className="auth-header">
        <Link to="/" className="auth-logo">
          {/* Replace with your logo component or SVG */}
          <span className="text-gradient">VeriChain</span>
        </Link>
        {title && <h1>{title}</h1>}
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </div>
  </div>
);

export default AuthLayout;
