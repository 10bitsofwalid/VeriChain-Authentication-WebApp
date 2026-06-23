import React from 'react';
import { useShopping } from '../context/ShoppingContext';
import ProductCard from '../components/ProductCard';

const Wishlist: React.FC = () => {
  const { wishlist, dispatch } = useShopping();

  if (wishlist.length === 0) {
    return (
      <div className="empty-state glass-card">
        <h2>Your wishlist is empty.</h2>
        <p>Save products you like to view them later.</p>
      </div>
    );
  }

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: id });
  };

  return (
    <div className="wishlist-page glass-card" style={{ padding: 'var(--space-lg)' }}>
      <h1>Wishlist</h1>
      <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
        {wishlist.map((product) => (
          <div key={product.id} style={{ position: 'relative' }}>
            <ProductCard item={{ product, serialNumber: '', counterfeitnessRisk: '' }} />
            <button
              className="btn btn-ghost btn-sm"
              style={{ position: 'absolute', top: 5, right: 5 }}
              onClick={() => handleRemove(product.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
