import React from 'react';
import { CheckCircle } from 'lucide-react';

interface Factory {
  _id: string;
  name: string;
  logoUrl?: string;
  verificationStatus: string;
  trustScore?: number;
  country?: string;
  yearsVerified?: number;
}

interface FactoryCardProps {
  factory: Factory;
  selected: boolean;
  onSelect: () => void;
}

const FactoryCard: React.FC<FactoryCardProps> = ({ factory, selected, onSelect }) => {
  return (
    <div
      className={`factory-card glass-card ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        padding: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-md)',
        transition: 'transform 0.2s ease',
      }}
    >
      {factory.logoUrl ? (
        <img
          src={factory.logoUrl}
          alt={`${factory.name} logo`}
          className="factory-logo"
          style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: '50%' }}
        />
      ) : (
        <div
          className="factory-logo placeholder"
          style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-card)' }}
        />
      )}
      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{factory.name}</h3>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
        <span className="badge verification-badge" style={{ background: factory.verificationStatus === 'verified' ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
          {factory.verificationStatus}
        </span>
        {selected && <CheckCircle size={20} color="var(--accent-primary)" />}
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        {factory.country && <div>{factory.country}</div>}
        {factory.trustScore !== undefined && <div>Trust Score: {factory.trustScore}</div>}
        {factory.yearsVerified !== undefined && <div>Years Verified: {factory.yearsVerified}</div>}
      </div>
    </div>
  );
};

export default FactoryCard;
