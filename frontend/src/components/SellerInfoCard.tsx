import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, Store } from 'lucide-react';

interface SellerInfoCardProps {
  seller: any;
  title?: string;
}

export default function SellerInfoCard({ seller, title }: SellerInfoCardProps) {
  if (!seller) {
    return null;
  }

  const sellerId = seller._id || seller.id;
  const name = seller.name || 'Unknown Seller';
  const role = seller.role || 'seller';
  const displayScore = seller.trustScore && seller.trustScore > 0 ? seller.trustScore : 98;
  const verified = seller.verified !== false;
  const headerTitle = title || 'Current Custodian / Seller';

  return (
    <section
      className="glass-card p-4"
      style={{
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-card)',
        transition: 'all var(--transition-base)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{headerTitle}</h3>
        {sellerId && (
          <Link
            to={`/seller/${sellerId}`}
            style={{
              fontSize: '0.78rem',
              color: 'var(--accent-purple, #F59E0B)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 700,
            }}
          >
            <Store size={13} /> Storefront <ExternalLink size={11} />
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(22, 35, 59, 0.25) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '18px',
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: '140px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {sellerId ? (
              <Link to={`/seller/${sellerId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{name}</h4>
              </Link>
            ) : (
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{name}</h4>
            )}
            {verified && (
              <span
                className="badge"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10B981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  fontWeight: 700,
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <ShieldCheck size={10} /> Verified
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            Role: {role}
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-purple, #F59E0B)' }}>
            {displayScore}%
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
            Seller Trust
          </span>
        </div>
      </div>
    </section>
  );
}
