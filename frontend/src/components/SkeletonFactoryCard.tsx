import React from 'react';
import SkeletonCard from './ui/SkeletonCard';

const SkeletonFactoryCard: React.FC = () => {
  const rows = [
    { width: 80, height: 80, borderRadius: '50%' },
    { width: '60%', height: 16 },
    { width: '40%', height: 12 },
  ];

  return <SkeletonCard className="factory-card glass-card" alignItems="center" rows={rows} />;
};

export default SkeletonFactoryCard;
