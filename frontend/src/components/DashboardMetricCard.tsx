import React from 'react';
import MetricCard from './ui/MetricCard';

interface DashboardMetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: string;
  trendDirection?: 'up' | 'down';
  className?: string;
}

const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
  icon,
  label,
  value,
  trend,
}) => {
  return <MetricCard label={label} value={value} icon={icon} trend={trend} />;
};

export default DashboardMetricCard;
