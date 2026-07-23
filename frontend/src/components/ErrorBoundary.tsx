import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'react-hot-toast';

interface ErrorBoundaryProps {
  /** Children components to render */
  children: ReactNode;
  /** Optional fallback UI when an error occurs */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    toast.error('Something went wrong. Please try again later.');
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div 
          className="glass-card" 
          style={{ 
            padding: 'var(--space-xl)', 
            textAlign: 'center', 
            maxWidth: 520, 
            margin: '60px auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: 8, fontSize: '1.4rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            An unexpected error occurred in this view.
          </p>
          {error?.message && (
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--color-danger)',
              marginBottom: 'var(--space-lg)',
              wordBreak: 'break-word',
              textAlign: 'left'
            }}>
              {error.message}
            </div>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleReset}
              className="bx-btn-primary"
              style={{ padding: '9px 18px', fontSize: '0.85rem' }}
            >
              Try Again
            </button>
            <a
              href="/"
              className="bx-btn-ghost"
              style={{ padding: '9px 18px', fontSize: '0.85rem', textDecoration: 'none' }}
            >
              Return to Home
            </a>
          </div>
        </div>
      );
    }
    return children;
  }
}

export default ErrorBoundary;
