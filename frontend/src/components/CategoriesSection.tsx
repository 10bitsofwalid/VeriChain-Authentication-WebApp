import { Laptop, Gem, Shirt, Sparkles, Pill } from 'lucide-react';

const categories = [
  { name: 'Electronics', icon: Laptop, count: '1,240 verified', color: '#0058bc' },
  { name: 'Luxury Goods', icon: Gem, count: '850 verified', color: '#8b5cf6' },
  { name: 'Apparel', icon: Shirt, count: '3,110 verified', color: '#ec4899' },
  { name: 'Cosmetics', icon: Sparkles, count: '940 verified', color: '#10b981' },
  { name: 'Pharmaceuticals', icon: Pill, count: '4,520 verified', color: '#ef4444' },
];

export default function CategoriesSection() {
  return (
    <section style={{ marginBottom: 'var(--space-2xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Verify by Industry</h2>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Decentralized category registry</span>
      </div>

      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: 'var(--space-md)' 
        }}
      >
        {categories.map((cat) => {
          const IconComponent = cat.icon;
          return (
            <div 
              key={cat.name} 
              className="glass-card" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                textAlign: 'center',
                padding: 'var(--space-lg)',
                cursor: 'pointer',
                gap: 'var(--space-sm)'
              }}
            >
              <div 
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  background: `${cat.color}15`, 
                  color: cat.color,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <IconComponent size={24} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.count}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
