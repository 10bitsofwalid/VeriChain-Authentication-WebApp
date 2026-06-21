import { Building, ShieldCheck, MapPin, Award, Activity } from 'lucide-react';

interface FactoryInfoCardProps {
  factory: any;
}

export default function FactoryInfoCard({ factory }: FactoryInfoCardProps) {
  if (!factory) {
    return (
      <section className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Manufacturer Information</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manufacturer information not available.</p>
      </section>
    );
  }

  const name = factory.name || 'Unknown Manufacturer';
  const verified = factory.verified;
  const trustScore = factory.trustScore ?? 100;
  const location = factory.factoryDetails?.location || 'Undisclosed Location';
  const capacity = factory.factoryDetails?.capacity || 'N/A';
  const certificateNo = factory.factoryDetails?.certificateNo || 'N/A';

  return (
    <section className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Verified Manufacturer</h3>

      <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
        {/* Logo/Icon */}
        <div 
          style={{
            width: '60px',
            height: '60px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0, 88, 188, 0.05)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan)'
          }}
        >
          <Building size={32} />
        </div>

        {/* Text Details */}
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{name}</h4>
            {verified && (
              <span className="badge badge-success" style={{ fontSize: '10px', padding: '1px 6px' }}>
                <ShieldCheck size={10} /> Verified
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} color="var(--text-muted)" /> {location}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Activity size={12} color="var(--text-muted)" /> Production Capacity: {capacity}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Award size={12} color="var(--text-muted)" /> License/Cert No: {certificateNo}
            </div>
          </div>
        </div>

        {/* Trust Score circular display */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 var(--space-md)' }}>
          <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-cyan)' }}>{trustScore}%</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trust Score</span>
        </div>
      </div>
    </section>
  );
}
