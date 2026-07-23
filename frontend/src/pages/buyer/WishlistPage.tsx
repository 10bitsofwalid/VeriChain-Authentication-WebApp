import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ShieldCheck, AlertTriangle, Star, ArrowRight } from 'lucide-react';
import './BuyerExperience.css';
import BuyerNav from './BuyerNav';
import { mockWishlist } from './mockData';
import type { WishlistItem } from './mockData';

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>(mockWishlist);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddToCart = (item: WishlistItem) => {
    setAddedMessage(`"${item.name}" added to cart!`);
    setTimeout(() => setAddedMessage(null), 3000);
  };

  return (
    <div className="buyer-page">
      <BuyerNav wishlistCount={items.length} />

      <div className="bx-header">
        <div className="bx-header-left">
          <h1>
            My Wishlist
            <span className="bx-count-badge">{items.length}</span>
          </h1>
          <p>Saved authentic products you're watching</p>
        </div>
        {items.length > 0 && (
          <button 
            className="bx-btn-ghost"
            onClick={() => setItems([])}
          >
            Clear All Items
          </button>
        )}
      </div>

      {addedMessage && (
        <div style={{
          marginBottom: 'var(--space-md)',
          padding: '12px 16px',
          background: 'rgba(0, 88, 188, 0.1)',
          border: '1px solid rgba(0, 88, 188, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--accent-cyan)',
          fontWeight: 600,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <ShieldCheck size={16} />
          {addedMessage}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bx-empty">
          <div className="bx-empty-icon">
            <Heart size={36} />
          </div>
          <h2>Your wishlist is empty</h2>
          <p>Save items you like while browsing to easily track price drops and authenticity updates.</p>
          <Link to="/" className="bx-btn-primary">
            <ShoppingBag size={16} /> Discover Products
          </Link>
        </div>
      ) : (
        <div className="bx-product-grid">
          {items.map(item => (
            <div key={item.id} className="bx-wish-card">
              <div className="bx-wish-img-wrap">
                <img src={item.image} alt={item.name} className="bx-wish-img" />
                <button
                  className="bx-wish-remove-btn"
                  onClick={() => removeItem(item.id)}
                  title="Remove from wishlist"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="bx-wish-body">
                <div className="bx-wish-brand">{item.brand}</div>
                <div className="bx-wish-name">{item.name}</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0' }}>
                  {item.verified ? (
                    <span className="bx-verified">
                      <ShieldCheck size={10} /> Verified Authentic
                    </span>
                  ) : (
                    <span className="bx-unverified">
                      <AlertTriangle size={10} /> Unverified
                    </span>
                  )}
                  <span style={{ fontSize: '0.72rem', color: item.inStock ? '#059669' : 'var(--text-muted)', fontWeight: 600 }}>
                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <div className="bx-wish-rating">
                  <Star size={13} fill="#f59e0b" color="#f59e0b" />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.rating}</span>
                  <span>({item.reviews.toLocaleString()} reviews)</span>
                </div>

                <div className="bx-wish-price-row">
                  <span className="bx-wish-price">${item.price.toFixed(2)}</span>
                  {item.originalPrice && (
                    <span className="bx-wish-orig-price">${item.originalPrice.toFixed(2)}</span>
                  )}
                </div>

                <div className="bx-wish-footer">
                  <button
                    className="bx-btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.inStock}
                  >
                    <ShoppingBag size={14} /> Add to Cart
                  </button>
                  <Link
                    to="/buyer/checkout"
                    className="bx-btn-ghost"
                    style={{ padding: '8px 10px' }}
                    title="Buy now"
                  >
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
