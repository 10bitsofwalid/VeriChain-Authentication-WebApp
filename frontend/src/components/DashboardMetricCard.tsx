// src/components/DashboardMetricCard.tsx
// @deprecated — For new features, use components/ui/MetricCard instead.
// This component is kept for backward compatibility with existing callers.
import React from 'react';

interface DashboardMetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: string; // e.g. '+5%'
  trendDirection?: 'up' | 'down';
  className?: string;
}

const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
  icon,
  label,
  value,
  trend,
  trendDirection = 'up',
  className = '',
}) => {
  const trendColor = trendDirection === 'up' ? 'var(--color-success)' : 'var(--color-danger)';
  return (
    <div
      className={`dashboard-metric-card glass-card ${className}`}
      style={{
        padding: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm)',
        transition: 'transform var(--transition-fast)',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        {icon}
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{label}</h3>
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{value}</div>
      {trend && (
        <span style={{ color: trendColor, fontSize: '0.875rem' }}>{trend}</span>
      )}
    </div>
  );
};

export default DashboardMetricCard;
