import type { LucideIcon } from 'lucide-react';
import ClayCard from './ClayCard';
import './ui.css';

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
}

export default function MetricCard({ label, value, icon: Icon, trend }: MetricCardProps) {
  return (
    <ClayCard className="vc-metric-card" interactive>
      <div className="vc-metric-icon">
        <Icon size={20} aria-hidden="true" />
      </div>
      <div>
        <p className="vc-metric-label">{label}</p>
        <strong className="vc-metric-value">{value}</strong>
        {trend && <span className="vc-metric-trend">{trend}</span>}
      </div>
    </ClayCard>
  );
}
