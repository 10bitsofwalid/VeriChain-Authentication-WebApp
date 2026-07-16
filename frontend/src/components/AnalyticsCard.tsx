// src/components/AnalyticsCard.tsx
// @deprecated — For new features, use components/ui/MetricCard instead.
// This component is kept for backward compatibility with existing callers.
import React from 'react';

interface AnalyticsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ icon, title, value, ctaLabel, onCtaClick }) => (
  <div className="analytics-card glass-card" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', transition: 'transform var(--transition-fast)', cursor: ctaLabel ? 'pointer' : 'default' }} onClick={ctaLabel ? onCtaClick : undefined}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
      {icon}
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{value}</div>
    {ctaLabel && (
      <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', padding: '4px 8px' }}>{ctaLabel}</button>
    )}
  </div>
);

export default AnalyticsCard;
