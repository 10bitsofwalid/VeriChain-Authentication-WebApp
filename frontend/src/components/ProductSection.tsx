import { ArrowRight, PackageOpen } from 'lucide-react';
import ProductCard from './ProductCard';
import EmptyState from './ui/EmptyState';

interface ProductSectionProps {
  title: string;
  products: any[];
  description?: string;
}

const sectionCopy: Record<string, string> = {
  'Featured Products': 'Curated authentic products with strong seller and manufacturer trust signals.',
  'Trending Products': 'Items gaining buyer attention while maintaining low counterfeit risk.',
  'Recently Verified': 'Fresh certificates and ownership updates from the VeriChain ledger.',
  'Recommended Products': 'Personalized picks from verified marketplace inventory.',
};

export default function ProductSection({ title, products, description }: ProductSectionProps) {
  return (
    <section className="marketplace-section">
      <div className="marketplace-section-header">
        <div>
          <span className="marketplace-eyebrow">Marketplace</span>
          <h2>{title}</h2>
        </div>
        <p>{description || sectionCopy[title]}</p>
        {products.length > 0 && (
          <button className="marketplace-text-button" type="button">
            View all
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No verified products yet"
          message="New authenticated products will appear here as sellers publish inventory."
        />
      ) : (
        <div className="marketplace-product-grid">
          {products.map((item) => (
            <ProductCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
