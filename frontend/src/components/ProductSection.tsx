import ProductCard from './ProductCard';

interface ProductSectionProps {
  title: string;
  products: any[];
}

export default function ProductSection({ title, products }: ProductSectionProps) {
  return (
    <section style={{ marginBottom: 'var(--space-2xl)' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-md)' }}>
        {title}
      </h2>
      
      {products.length === 0 ? (
        <div className="glass-card" style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
          No products currently available in this section.
        </div>
      ) : (
        <div className="grid-cards">
          {products.map((item) => (
            <ProductCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
