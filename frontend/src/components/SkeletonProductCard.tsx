import React from 'react';

// Skeleton placeholder for product card while loading
const SkeletonProductCard: React.FC = () => (
  <div className="product-card glass-card" style={{
    padding: 'var(--space-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    background: 'var(--bg-skeleton)',
    animation: 'pulse 1.5s ease-in-out infinite',
  }}>
    <div style={{ width: '100%', height: 180, background: 'var(--bg-skeleton)' }} />
    <div style={{ width: '60%', height: 16, background: 'var(--bg-skeleton)' }} />
    <div style={{ width: '40%', height: 12, background: 'var(--bg-skeleton)' }} />
    <div style={{ width: '80%', height: 12, background: 'var(--bg-skeleton)' }} />
  </div>
);

export default SkeletonProductCard;
