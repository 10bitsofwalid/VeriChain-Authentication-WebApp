import React from 'react';
import { CheckCircle } from 'lucide-react';

interface EmptyStateProps {
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <div className="empty-state glass-card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
    <CheckCircle size={48} />
    <h3 style={{ marginTop: 'var(--space-md)' }}>{message}</h3>
  </div>
);

export default EmptyState;
