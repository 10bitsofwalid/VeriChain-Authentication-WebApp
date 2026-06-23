import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ExternalLink, Tag, User } from 'lucide-react';
import LazyImage from './LazyImage';

interface ProductCardProps {
  item: any; // using any due to existing structure
}

import { riskBadge, verificationBadge } from '../utils/badges';
import { useShopping } from '../context/ShoppingContext';
import { Heart, Scale } from 'lucide-react';

export const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const { dispatch, wishlist, compare } = useShopping();
  const placeholder = {
    factoryName: 'Acme Factory',
    trustScore: Math.round(Math.random() * 100),
    rating: (Math.random() * 5).toFixed(1),
    stock: Math.floor(Math.random() * 100),
    price: (Math.random() * 500 + 20).toFixed(2),
  };

  return (
    <div className="glass-card animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Image */}
      <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'rgba(15,20,36,0.4)', border: '1px solid var(--border-subtle)', marginBottom: 'var(--space-md)' }}>
        <LazyImage
          src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80'}
          alt={item.product?.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
          <span className={`badge ${verificationBadge(item.product?.verifiedStatus)}`}> {item.product?.verifiedStatus === 'verified' ? 'Authentic' : 'Pending'} </span>
        </div>
      </div>

      {/* Meta */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        <span className="badge badge-neutral" style={{ alignSelf: 'flex-start' }}>
          <Tag size={10} style={{ marginRight: '2px' }} />
          {item.product?.category}
        </span>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '4px', color: 'var(--text-primary)' }}>{item.product?.name}</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: '40px' }}>
          {item.product?.description}
        </p>
        {/* Technical meta */}
        <div style={{ background: 'rgba(10,14,26,0.4)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', fontSize: '12px', border: '1px solid var(--border-subtle)', marginTop: 'var(--space-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Serial:</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{item.serialNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>SKU:</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{item.product?.sku}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Risk:</span>
            <span className={`badge ${riskBadge(item.counterfeitRisk)}`} style={{ fontSize: '10px', padding: '1px 6px' }}>{item.counterfeitRisk}</span>
          </div>
          {/* Placeholder fields */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Factory:</span>
            <span>{placeholder.factoryName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Trust Score:</span>
            <span>{placeholder.trustScore}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Rating:</span>
            <span>{placeholder.rating} ★</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Stock:</span>
            <span>{placeholder.stock}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Price:</span>
            <span>${placeholder.price}</span>
          </div>
        </div>
        {/* Seller info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)', fontSize: '13px' }}>
          <User size={14} color="var(--text-muted)" />
          <span style={{ color: 'var(--text-muted)' }}>Seller:</span>
          <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{item.currentOwner?.name}</span>
        </div>
      </div>

      {/* Action footer */}
        <div style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-default)', display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
          <Link to={`/verify?serial=${item.serialNumber}`} className="btn btn-outline" style={{ flex: '1' }}>
            Verify
          </Link>
          <button className="btn btn-primary" style={{ flex: '1' }} onClick={() => console.log('Buy clicked', item._id)}>
            <ShoppingBag size={14} /> Buy
          </button>
          {item.product?.certificateUrl && (
            <a href={item.product.certificateUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" title="View Authenticity Certificate">
              <ExternalLink size={14} />
            </a>
          )}
          {/* Wishlist and Compare buttons */}
          <button className="btn btn-ghost" title="Add to Wishlist" onClick={() => {
            const exists = wishlist.some(p => p.id === item.product?.id);
            if (exists) {
              dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: item.product.id });
            } else {
              dispatch({ type: 'ADD_TO_WISHLIST', payload: { id: item.product.id, name: item.product.name, price: parseFloat(item.product.price), imageUrl: item.product.imageUrl } });
            }
          }}>
            <Heart size={16} fill={wishlist.some(p => p.id === item.product?.id) ? "currentColor" : "none"} />
          </button>
          <button className="btn btn-ghost" title="Add to Compare" onClick={() => {
            const exists = compare.some(p => p.id === item.product?.id);
            if (exists) {
              dispatch({ type: 'REMOVE_FROM_COMPARE', payload: item.product.id });
            } else if (compare.length < 4) {
              dispatch({ type: 'ADD_TO_COMPARE', payload: { id: item.product.id, name: item.product.name, price: parseFloat(item.product.price), imageUrl: item.product.imageUrl } });
            } else {
              alert('Compare list can contain up to 4 items');
            }
          }}>
            <Scale size={16} />
          </button>
        </div>
    </div>
  );
};

export default memo(ProductCard);
