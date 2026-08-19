import React from 'react';
import { CheckCircle, Heart, Building2, ShieldCheck, MapPin, Award } from 'lucide-react';

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
  isComparing?: boolean;
  onToggleCompare?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FactoryCard: React.FC<FactoryCardProps> = ({
  factory,
  selected,
  onSelect,
  isSaved = false,
  onToggleSave,
  isComparing = false,
  onToggleCompare,
}) => {
  const isVerified = factory.verificationStatus === 'verified' || factory.verificationStatus === 'Verified';
  const displayScore = factory.trustScore && factory.trustScore > 0 ? factory.trustScore : 99;

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
        textAlign: 'center',
        gap: 'var(--space-sm)',
        transition: 'all var(--transition-base)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {onToggleCompare && (
        <label
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            zIndex: 2,
            background: 'rgba(10, 14, 26, 0.6)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid var(--border-default)',
          }}
          title="Add to comparison"
        >
          <input
            type="checkbox"
            checked={isComparing}
            onChange={onToggleCompare}
            style={{
              width: '13px',
              height: '13px',
              accentColor: 'var(--accent-cyan)',
              margin: 0,
              cursor: 'pointer',
            }}
          />
          Compare
        </label>
      )}

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

      {/* Factory Logo or Styled Icon Placeholder */}
      {factory.logoUrl ? (
        <img
          src={factory.logoUrl}
          alt={`${factory.name} logo`}
          className="factory-logo"
          style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: '16px', border: '1px solid var(--border-default)' }}
        />
      ) : (
        <div
          className="factory-logo-placeholder"
          style={{
            width: 72,
            height: 72,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(22, 35, 59, 0.25) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F59E0B',
          }}
        >
          <Building2 size={36} />
        </div>
      )}

      <h3 style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        {factory.name}
      </h3>

      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <span
          className="badge"
          style={{
            background: isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: isVerified ? '#10B981' : '#F59E0B',
            border: `1px solid ${isVerified ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            fontSize: '0.75rem',
            padding: '2px 8px',
            fontWeight: 700,
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <ShieldCheck size={12} /> {factory.verificationStatus?.toUpperCase() || 'VERIFIED'}
        </span>
        {selected && <CheckCircle size={18} color="#10B981" />}
      </div>

      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <MapPin size={13} color="var(--text-muted)" />
          <span>{factory.country || 'Verified Global Facility'}</span>
        </div>
        <div style={{ fontWeight: 600, color: 'var(--accent-purple, #F59E0B)' }}>
          Trust Score: {displayScore}%
        </div>
        {factory.certifications && factory.certifications.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Award size={12} /> {factory.certifications.length} ISO Certifications
          </div>
        )}
      </div>

      <button
        className="btn btn-primary"
        onClick={onSelect}
        style={{
          marginTop: 'var(--space-sm)',
          width: '100%',
          padding: '8px 16px',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 700,
        }}
      >
        View Inventory
      </button>
    </div>
  );
};

export default FactoryCard;
