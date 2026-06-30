import { Gem, Laptop, Pill, Shirt, Sparkles, Watch } from 'lucide-react';

const categories = [
  { name: 'Electronics', icon: Laptop, count: '1,240 verified', tone: 'blue' },
  { name: 'Luxury Goods', icon: Gem, count: '850 verified', tone: 'violet' },
  { name: 'Apparel', icon: Shirt, count: '3,110 verified', tone: 'rose' },
  { name: 'Cosmetics', icon: Sparkles, count: '940 verified', tone: 'emerald' },
  { name: 'Pharmaceuticals', icon: Pill, count: '4,520 verified', tone: 'amber' },
  { name: 'Wearables', icon: Watch, count: '720 verified', tone: 'sky' },
];

export default function CategoriesSection() {
  return (
    <section className="marketplace-section">
      <div className="marketplace-section-header">
        <div>
          <span className="marketplace-eyebrow">Verified categories</span>
          <h2>Explore authenticated industries</h2>
        </div>
        <p>Every category includes manufacturer provenance, product certificates, and seller trust signals.</p>
      </div>

      <div className="category-grid">
        {categories.map((cat) => (
          <button key={cat.name} className={`category-card category-card-${cat.tone}`} type="button">
            <span className="category-icon">
              <cat.icon size={24} aria-hidden="true" />
            </span>
            <span>
              <strong>{cat.name}</strong>
              <small>{cat.count}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
