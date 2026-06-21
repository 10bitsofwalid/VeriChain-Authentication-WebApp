import { ShieldCheck, ShoppingBag } from 'lucide-react';

interface StickyInfoPanelProps {
  product: any;
}

export default function StickyInfoPanel({ product }: StickyInfoPanelProps) {
  const verifiedStatus = product.product?.verifiedStatus || 'unknown';

  return (
    <div 
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-default)',
        padding: 'var(--space-sm) var(--space-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <img 
          src={product.product?.imageUrl || 'https://via.placeholder.com/50'} 
          alt={product.product?.name}
          style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
        />
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {product.product?.name}
          </h4>
          <span 
            className={`badge ${verifiedStatus === 'verified' ? 'badge-success' : 'badge-warning'}`}
            style={{ fontSize: '10px', padding: '1px 6px', marginTop: '2px' }}
          >
            <ShieldCheck size={10} /> {verifiedStatus === 'verified' ? 'Authentic' : 'Pending'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => console.log('Buy clicked', product._id)}
        >
          <ShoppingBag size={12} /> Buy Now
        </button>
      </div>
    </div>
  );
}
