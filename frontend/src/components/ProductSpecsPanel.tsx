interface ProductSpecsPanelProps {
  specs: Record<string, string> | Map<string, string> | any;
}

export default function ProductSpecsPanel({ specs }: ProductSpecsPanelProps) {
  // specs might be a Map or standard Object depending on mongoose hydration
  const specList = specs 
    ? (specs instanceof Map ? Array.from(specs.entries()) : Object.entries(specs))
    : [];

  if (specList.length === 0) {
    return null;
  }

  return (
    <section className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Product Specifications</h3>
      
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: 'var(--space-sm)' 
        }}
      >
        {specList.map(([key, value]) => (
          <div 
            key={key} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: 'var(--space-sm)', 
              background: 'rgba(0,0,0,0.02)',
              borderRadius: 'var(--radius-sm)',
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
              {key.replace(/_/g, ' ')}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {String(value)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
