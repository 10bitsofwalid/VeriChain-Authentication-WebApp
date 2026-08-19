import { useNavigate } from 'react-router-dom';
import {
  IconDiamond as Gem,
  IconDeviceLaptop as Laptop,
  IconPill as Pill,
  IconShirt as Shirt,
  IconSparkles as Sparkles,
  IconDeviceWatch as Watch,
} from '@tabler/icons-react';

const categories = [
  { name: 'Electronics', icon: Laptop, label: 'Verified Catalog', tone: 'blue' },
  { name: 'Luxury Goods', icon: Gem, label: 'Verified Catalog', tone: 'violet' },
  { name: 'Apparel', icon: Shirt, label: 'Verified Catalog', tone: 'rose' },
  { name: 'Cosmetics', icon: Sparkles, label: 'Verified Catalog', tone: 'emerald' },
  { name: 'Pharmaceuticals', icon: Pill, label: 'Verified Catalog', tone: 'amber' },
  { name: 'Wearables', icon: Watch, label: 'Verified Catalog', tone: 'sky' },
];

export default function CategoriesSection() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/dashboard/marketplace?category=${encodeURIComponent(categoryName)}`);
  };

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
          <button
            key={cat.name}
            className={`category-card category-card-${cat.tone}`}
            type="button"
            onClick={() => handleCategoryClick(cat.name)}
          >
            <span className="category-icon">
              <cat.icon size={24} aria-hidden="true" />
            </span>
            <span>
              <strong>{cat.name}</strong>
              <small>{cat.label}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
