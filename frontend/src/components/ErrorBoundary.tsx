// src/components/ErrorBoundary.tsx
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
}

/**
 * ErrorBoundary catches JavaScript errors in its child component tree,
 * logs them, and displays a fallback UI. It also shows a toast notification
 * to inform the user that something went wrong.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    // Update state so the next render shows the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an external service here.
    console.error('ErrorBoundary caught an error', error, errorInfo);
    toast.error('Something went wrong. Please try again later.');
  }

  render() {
    const { hasError } = this.state;
    const { fallback, children } = this.props;
    if (hasError) {
      // Render provided fallback or a simple message.
      return fallback ?? (
        <div className="glass-card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--text-primary)' }}>Oops! An unexpected error occurred.</h2>
        </div>
      );
    }
    return children;
  }
}

export default ErrorBoundary;
