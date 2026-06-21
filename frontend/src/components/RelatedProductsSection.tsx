import { useEffect, useState } from 'react';
import client from '../api/client';
import ProductCard from './ProductCard';

interface RelatedProductsSectionProps {
  category: string;
}

export default function RelatedProductsSection({ category }: RelatedProductsSectionProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const res = await client.get('/items/marketplace');
        const filtered = res.data.items.filter(
          (item: any) => item.product?.category === category
        ).slice(0, 4);
        setItems(filtered);
      } catch (err) {
        console.error('Failed to load related products', err);
      } finally {
        setLoading(false);
      }
    }
    if (category) {
      fetchRelated();
    }
  }, [category]);

  if (loading || items.length === 0) {
    return null;
  }

  return (
    <section style={{ marginTop: 'var(--space-2xl)', marginBottom: 'var(--space-2xl)' }}>
      <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-md)' }}>
        Related Products in {category}
      </h3>
      <div className="grid-cards">
        {items.map((item) => (
          <ProductCard key={item._id} item={item} />
        ))}
      </div>
    </section>
  );
}
