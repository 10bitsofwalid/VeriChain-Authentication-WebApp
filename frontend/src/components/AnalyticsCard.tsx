import React from 'react';
import MetricCard from './ui/MetricCard';

interface AnalyticsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ icon, title, value }) => {
  return <MetricCard label={title} value={value} icon={icon} />;
};

export default AnalyticsCard;
