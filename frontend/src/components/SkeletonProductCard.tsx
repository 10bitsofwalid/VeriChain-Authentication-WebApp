import React from 'react';
import SkeletonCard from './ui/SkeletonCard';

const SkeletonProductCard: React.FC = () => {
  const rows = [
    { width: '100%', height: 180 },
    { width: '60%', height: 16 },
    { width: '40%', height: 12 },
    { width: '80%', height: 12 },
  ];

  return <SkeletonCard className="product-card glass-card" rows={rows} />;
};

export default SkeletonProductCard;
