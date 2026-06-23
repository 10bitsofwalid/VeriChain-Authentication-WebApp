
import { useState, useEffect } from 'react';
import client from '../api/client';
import ProductCard from './ProductCard';

export default function RecentlyVerifiedProducts() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await client.get('/items/recently-verified');
        setItems(res.data.items.slice(0, 4));
      } finally {
        setLoading(false);
      }
    }
    fetchRecent();
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
        Recently Verified Products
      </h3>
      <div className="grid-cards">
        {items.map((item: any) => (
          <ProductCard key={item._id} item={item} />
        ))}
      </div>
    </section>
  );
}
