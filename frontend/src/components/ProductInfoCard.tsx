import { CheckCircle, Award, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface ProductInfoCardProps {
  product: any;
}

export default function ProductInfoCard({ product }: ProductInfoCardProps) {
  const price = product.product?.price ?? null;
  const authenticity = product.product?.verifiedStatus ?? 'unknown';
  const trustScore = product.factory?.trustScore ?? product.seller?.trustScore ?? 0;
  const brand = product.product?.brand ?? 'N/A';
  const category = product.product?.category ?? 'N/A';

  return (
    <div className="product-info-card glass-card">
      <h2 className="product-name" style={{ fontSize: '22px', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
        {product.product?.name}
      </h2>
      {price !== null && (
        <p className="price" style={{ fontSize: '18px', fontWeight: 500, marginBottom: 'var(--space-sm)' }}>
          {formatCurrency(price)}
        </p>
      )}
      <div className="badges" style={{ display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)' }}>
        <span className={`badge ${authenticity === 'verified' ? 'badge-success' : 'badge-warning'}`}>
          <ShieldCheck size={14} /> {authenticity === 'verified' ? 'Authentic' : 'Pending'}
        </span>
        <span className="badge badge-info">
          <Award size={14} /> Trust Score: {trustScore}%
        </span>
      </div>
      <p className="brand-category" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
        <strong>Brand:</strong> {brand} &nbsp;|&nbsp; <strong>Category:</strong> {category}
      </p>
    </div>
  );
}
