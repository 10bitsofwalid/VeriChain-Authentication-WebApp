import React from 'react';

// Simple skeleton placeholder for factory card while loading
const SkeletonFactoryCard: React.FC = () => (
  <div className="factory-card glass-card" style={{
    padding: 'var(--space-lg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-md)',
    background: 'var(--bg-skeleton)',
    animation: 'pulse 1.5s ease-in-out infinite',
  }}>
    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-skeleton)' }} />
    <div style={{ width: '60%', height: 16, background: 'var(--bg-skeleton)' }} />
    <div style={{ width: '40%', height: 12, background: 'var(--bg-skeleton)' }} />
  </div>
);

export default SkeletonFactoryCard;
