import { ShieldCheck } from 'lucide-react';

interface SellerInfoCardProps {
  seller: any;
}

export default function SellerInfoCard({ seller }: SellerInfoCardProps) {
  if (!seller) {
    return null;
  }

  const name = seller.name || 'Unknown Seller';
  const role = seller.role || 'seller';
  const trustScore = seller.trustScore ?? 100;
  const verified = seller.verified;

  return (
    <section className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Current Custodian / Seller</h3>
      
      <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div 
          style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '18px'
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{name}</h4>
            {verified && (
              <span className="badge badge-success" style={{ fontSize: '9px', padding: '1px 4px' }}>
                <ShieldCheck size={9} /> Verified
              </span>
            )}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            Role: {role}
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
            {trustScore}%
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
            Seller Trust
          </span>
        </div>
      </div>
    </section>
  );
}
