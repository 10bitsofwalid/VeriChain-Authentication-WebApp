import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  imageUrl?: string;
  batchId: string;
  availableQty: number;
  wholesalePrice: number;
  manufacturingDate: string;
  certifications?: string[];
  authenticityStatus: string;
  category?: string;
}

interface SellerProductCardProps {
  product: Product;
  onRequestAllocation?: () => void;
  onToggleReserve?: () => void;
  isReserved?: boolean;
}

const SellerProductCard: React.FC<SellerProductCardProps> = ({
  product,
  onRequestAllocation,
  onToggleReserve,
  isReserved = false,
}) => {
  return (
    <div
      className="product-card glass-card animate-fade-in"
      style={{
        padding: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
        position: 'relative',
        border: isReserved ? '1px solid #10b981' : '1px solid var(--border-default)',
        boxShadow: isReserved ? '0 0 12px rgba(16, 185, 129, 0.2)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {isReserved && (
        <span
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: '#10b981',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            zIndex: 1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          Reserved
        </span>
      )}

      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{
            width: '100%',
            height: 180,
            objectFit: 'cover',
            borderRadius: 'var(--radius-md)',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: 180,
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
          }}
        />
      )}
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{product.name}</h3>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1 }}>
        <div>Batch: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{product.batchId}</span></div>
        <div>Qty: {product.availableQty}</div>
        <div>Price: ${product.wholesalePrice.toFixed(2)}</div>
        <div>Made: {new Date(product.manufacturingDate).toLocaleDateString()}</div>
        {product.certifications && product.certifications.length > 0 && (
          <div style={{ marginTop: '4px' }}>
            Certifications: {product.certifications.join(', ')}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'auto' }}>
        <button
          className="btn btn-primary"
          onClick={onRequestAllocation}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <ShoppingCart size={14} /> Request
        </button>
        <button
          className={`btn ${isReserved ? 'btn-success' : 'btn-outline'}`}
          onClick={onToggleReserve}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: isReserved ? '#10b981' : 'transparent',
            borderColor: isReserved ? '#10b981' : 'var(--border-default)',
            color: isReserved ? '#ffffff' : 'var(--text-primary)',
          }}
        >
          {isReserved ? 'Reserved' : 'Reserve'}
        </button>
      </div>
    </div>
  );
};

export default SellerProductCard;
