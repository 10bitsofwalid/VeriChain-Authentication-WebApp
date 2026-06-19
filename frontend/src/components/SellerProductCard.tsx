import React from 'react';
import { ShoppingCart, Eye } from 'lucide-react';

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
}

const SellerProductCard: React.FC<SellerProductCardProps> = ({ product }) => {
  const handleRequestInventory = () => {
    // Placeholder: integrate with API to request inventory
    console.log('Request inventory for', product._id);
  };

  const handleSaveFactory = () => {
    // Placeholder: integrate with API to save factory
    console.log('Save factory for product', product._id);
  };

  const handleCompare = () => {
    // Placeholder: open compare modal or navigate
    console.log('Compare product', product._id);
  };

  return (
    <div className="product-card glass-card" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
      ) : (
        <div style={{ width: '100%', height: 180, background: 'var(--bg-card)' }} />
      )}
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{product.name}</h3>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <div>Batch: {product.batchId}</div>
        <div>Qty: {product.availableQty}</div>
        <div>Price: ${product.wholesalePrice.toFixed(2)}</div>
        <div>Made: {new Date(product.manufacturingDate).toLocaleDateString()}</div>
        {product.certifications && product.certifications.length > 0 && (
          <div>Certifications: {product.certifications.join(', ')}</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'space-between' }}>
        <button className="btn btn-primary" onClick={handleRequestInventory} style={{ flex: 1 }}>
          <ShoppingCart size={16} /> Request
        </button>
        <button className="btn btn-outline" onClick={handleSaveFactory} style={{ flex: 1 }}>
          Save
        </button>
        <button className="btn btn-ghost" onClick={handleCompare} style={{ flex: 1 }}>
          <Eye size={16} /> Compare
        </button>
      </div>
    </div>
  );
};

export default SellerProductCard;
