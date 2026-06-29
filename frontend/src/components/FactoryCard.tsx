import React from 'react';
import { CheckCircle, Heart } from 'lucide-react';

interface Factory {
  _id: string;
  name: string;
  logoUrl?: string;
  verificationStatus: string;
  trustScore?: number;
  country?: string;
  certifications?: string[];
  categories?: string[];
}

interface FactoryCardProps {
  factory: Factory;
  selected: boolean;
  onSelect: () => void;
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
}

const FactoryCard: React.FC<FactoryCardProps> = ({
  factory,
  selected,
  onSelect,
  isSaved = false,
  onToggleSave,
}) => {
  return (
    <div
      className={`factory-card glass-card ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{
        position: 'relative',
        cursor: 'pointer',
        padding: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-md)',
        transition: 'transform 0.2s ease',
      }}
    >
      {onToggleSave && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(e);
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isSaved ? '#ef4444' : 'var(--text-secondary)',
            transition: 'transform 0.2s ease, color 0.2s ease',
            zIndex: 2,
          }}
          className="favorite-button"
          title={isSaved ? 'Remove Supplier' : 'Save Supplier'}
        >
          <Heart size={18} fill={isSaved ? '#ef4444' : 'none'} />
        </button>
      )}

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
        {factory.country && <div>Location: {factory.country}</div>}
        {factory.trustScore !== undefined && <div>Trust Score: {factory.trustScore}</div>}
        {factory.certifications?.length !== undefined && (<div>Certifications: {factory.certifications.length}</div>)}
        {factory.categories?.length && (<div>Categories: {factory.categories.join(', ')}</div>)}
      </div>
      <button className="btn btn-primary" onClick={onSelect} style={{ marginTop: 'var(--space-sm)' }}>
        View Inventory
      </button>
    </div>
  );
};

export default FactoryCard;
