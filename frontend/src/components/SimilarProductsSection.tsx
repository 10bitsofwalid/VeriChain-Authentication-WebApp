import { useEffect, useState } from 'react';
import client from '../api/client';
import ProductCard from './ProductCard';

interface SimilarProductsSectionProps {
  productId: string;
}

export default function SimilarProductsSection({ productId }: SimilarProductsSectionProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimilar() {
      try {
        const res = await client.get('/items/marketplace');
        const filtered = res.data.items.filter(
          (item: any) => item._id !== productId
        ).slice(0, 4);
        setItems(filtered);
      } catch (err) {
        console.error('Failed to load similar products', err);
      } finally {
        setLoading(false);
      }
    }
    if (productId) {
      fetchSimilar();
    }
  }, [productId]);

  if (loading || items.length === 0) {
    return null;
  }

  return (
    <section style={{ marginTop: 'var(--space-2xl)', marginBottom: 'var(--space-2xl)' }}>
      <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-md)' }}>
        Similar Products You May Like
      </h3>
      <div className="grid-cards">
        {items.map((item) => (
          <ProductCard key={item._id} item={item} />
        ))}
      </div>
    </section>
  );
}
