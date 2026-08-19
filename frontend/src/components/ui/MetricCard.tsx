import type { TablerIcon as LucideIcon } from '@tabler/icons-react';
import React from 'react';
import ClayCard from './ClayCard';
import './ui.css';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon | React.ReactNode;
  trend?: string;
}

export default function MetricCard({ label, value, icon, trend }: MetricCardProps) {
  return (
    <ClayCard className="vc-metric-card" interactive>
      <div className="vc-metric-icon">
        {React.isValidElement(icon) ? (
          icon
        ) : (
          (() => {
            const Icon = icon as LucideIcon;
            return <Icon size={20} aria-hidden="true" />;
          })()
        )}
      </div>
      <div>
        <p className="vc-metric-label">{label}</p>
        <strong className="vc-metric-value">{String(value)}</strong>
        {trend && <span className="vc-metric-trend">{trend}</span>}
      </div>
    </ClayCard>
  );
}
