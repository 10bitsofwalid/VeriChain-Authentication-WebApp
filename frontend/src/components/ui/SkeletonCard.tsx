import React from 'react';

interface SkeletonRow {
  width: string | number;
  height: string | number;
  borderRadius?: string | number;
}

interface SkeletonCardProps {
  className?: string;
  alignItems?: 'flex-start' | 'center' | 'stretch';
  rows: SkeletonRow[];
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '', alignItems = 'stretch', rows }) => (
  <div className={`${className}`} style={{
    padding: 'var(--space-lg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems,
    gap: 'var(--space-md)',
    background: 'var(--bg-skeleton)',
    animation: 'pulse 1.5s ease-in-out infinite',
  }}>
    {rows.map((row, idx) => (
      <div
        key={idx}
        style={{
          width: row.width,
          height: row.height,
          borderRadius: row.borderRadius,
          background: 'var(--bg-skeleton)',
        }}
      />
    ))}
  </div>
);

export default SkeletonCard;
