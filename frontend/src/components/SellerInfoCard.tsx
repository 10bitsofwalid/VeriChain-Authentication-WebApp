import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink } from 'lucide-react';

interface SellerInfoCardProps {
  seller: any;
}

export default function SellerInfoCard({ seller }: SellerInfoCardProps) {
  if (!seller) {
    return null;
  }

  const sellerId = seller._id || seller.id;
  const name = seller.name || 'Unknown Seller';
  const role = seller.role || 'seller';
  const trustScore = seller.trustScore ?? 100;
  const verified = seller.verified;

  return (
    <section className="glass-card p-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Current Custodian / Seller</h3>
        {sellerId && (
          <Link
            to={`/seller/${sellerId}`}
            style={{ fontSize: '12px', color: 'var(--accent-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
          >
            Storefront <ExternalLink size={12} />
          </Link>
        )}
      </div>
      
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
            {sellerId ? (
              <Link to={`/seller/${sellerId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{name}</h4>
              </Link>
            ) : (
              <h4 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{name}</h4>
            )}
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
