import { Award, Calendar, Hash, FileText } from 'lucide-react';

interface DigitalBirthCertificateCardProps {
  product: any;
}

export default function DigitalBirthCertificateCard({ product }: DigitalBirthCertificateCardProps) {
  const serial = product.item?.serialNumber || 'N/A';
  const verifiedStatus = product.product?.verifiedStatus || 'unknown';
  const category = product.product?.category || 'N/A';
  const sku = product.product?.sku || 'N/A';
  const firstJourney = product.item?.journey?.[0];
  const hash = firstJourney?.txHash || '0x' + 'f'.repeat(64);
  const manufacturingDate = product.item?.createdAt 
    ? new Date(product.item.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) 
    : 'N/A';

  return (
    <section 
      className="glass-card" 
      style={{ 
        marginBottom: 'var(--space-xl)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.8))',
        border: '1.5px dashed var(--accent-cyan)',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award color="var(--accent-cyan)" /> Digital Birth Certificate
        </h3>
        <span className={`badge ${verifiedStatus === 'verified' ? 'badge-success' : 'badge-warning'}`}>
          {verifiedStatus === 'verified' ? 'Authentic' : 'Verification Pending'}
        </span>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
        This document represents the immutable blockchain provenance record for this specific physical asset. Any deviation in custody or checks is logged transparently.
      </p>

      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 'var(--space-md)',
          background: 'rgba(0, 88, 188, 0.03)',
          padding: 'var(--space-md)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Hash size={12} /> Serial Number
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
            {serial}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={12} /> SKU Catalog ID
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {sku}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} /> Manufacturing Date
          </span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {manufacturingDate}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Asset Category</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {category}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-default)' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
          Cryptographic Ledger Birth Transaction Hash
        </span>
        <span 
          style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            wordBreak: 'break-all',
            background: 'rgba(0,0,0,0.04)',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'block'
          }}
        >
          {hash}
        </span>
      </div>
    </section>
  );
}
