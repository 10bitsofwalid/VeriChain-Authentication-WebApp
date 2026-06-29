import React from 'react';
import { CheckCircle, ShieldCheck, MapPin, Heart } from 'lucide-react';

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

interface ComparisonGridProps {
  factories: Factory[];
}

const ComparisonGrid: React.FC<ComparisonGridProps> = ({ factories }) => {
  if (factories.length === 0) return null;
  return (
    <div className="comparison-grid glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-2xl)', overflowX: 'auto' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>Supplier Comparison</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))`,
          gap: 'var(--space-lg)',
        }}
      >
        {factories.map((f) => (
          <div key={f._id} className="factory-comparison-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              {f.logoUrl ? (
                <img src={f.logoUrl} alt={f.name} style={{ width: 50, height: 50, borderRadius: '50%' }} />
              ) : (
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              )}
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{f.name}</h3>
            </div>
            <div style={{ marginTop: 'var(--space-sm)' }}>
              <span className="badge" style={{ background: f.verificationStatus === 'verified' ? 'var(--accent-success)' : 'var(--accent-warning)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>{f.verificationStatus}</span>
            </div>
            <div style={{ marginTop: 'var(--space-sm)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {f.country && <div>Location: {f.country}</div>}
              {f.trustScore !== undefined && <div>Trust Score: {f.trustScore}</div>}
              {f.certifications && <div>Certifications: {f.certifications.join(', ')}</div>}
              {f.categories && <div>Categories: {f.categories.join(', ')}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonGrid;
