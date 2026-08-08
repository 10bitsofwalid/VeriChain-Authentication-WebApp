import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Package, ShieldCheck, ShoppingCart } from 'lucide-react';
import client from '../../../api/client';

export default function AnalyticsView() {
  const [productCount, setProductCount] = useState<number>(0);
  const [verifiedCount, setVerifiedCount] = useState<number>(0);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await client.get('/products/factory');
        if (res.data?.products && Array.isArray(res.data.products)) {
          setProductCount(res.data.products.length);
          const verified = res.data.products.filter((p: any) => p.verifiedStatus === 'verified').length;
          setVerifiedCount(verified);
          const mapped = res.data.products.slice(0, 5).map((p: any) => ({
            name: p.name,
            sku: p.sku || 'SKU',
            category: p.category || 'General',
            status: p.verifiedStatus || 'pending',
          }));
          setTopProducts(mapped);
        }
      } catch {
        setProductCount(0);
        setVerifiedCount(0);
        setTopProducts([]);
      }
    }
    loadAnalytics();
  }, []);

  const kpis = [
    { label: 'Catalog SKUs', value: productCount.toString(), color: '#8b5cf6', icon: Package },
    { label: 'Verified Products', value: verifiedCount.toString(), color: '#10b981', icon: ShieldCheck },
    { label: 'Pending Verification', value: (productCount - verifiedCount).toString(), color: '#f59e0b', icon: ShoppingCart },
  ];

  return (
    <div>
      {/* KPI Row */}
      <div className="fd-kpi-row">
        {kpis.map(k => (
          <div className="fd-kpi-item" key={k.label}>
            <k.icon size={20} color={k.color} style={{ marginBottom: 8 }} />
            <span className="fd-kpi-number" style={{ color: k.color }}>{k.value}</span>
            <span className="fd-kpi-label">{k.label}</span>
          </div>
        ))}
      </div>

      <div className="fd-two-col">
        {/* Verification Ratio */}
        <div className="fd-card">
          <div className="fd-section-hd" style={{ marginBottom: 'var(--space-lg)' }}>
            <h2><BarChart2 size={16} color="#8b5cf6" /> Ledger Verification Health</h2>
          </div>
          <div style={{ padding: 'var(--space-md) 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Cryptographic Verification Rate</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>
                {productCount > 0 ? Math.round((verifiedCount / productCount) * 100) : 100}%
              </span>
            </div>
            <div className="fd-progress-track" style={{ height: 10 }}>
              <div
                className="fd-progress-fill"
                style={{
                  width: `${productCount > 0 ? (verifiedCount / productCount) * 100 : 100}%`,
                  background: '#10b981',
                }}
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 12 }}>
              Measures percentage of manufactured product SKUs with valid consensus signatures on the VeriChain mainnet.
            </p>
          </div>
        </div>

        {/* Top Factory Products Table */}
        <div className="fd-card">
          <div className="fd-section-hd" style={{ marginBottom: 'var(--space-md)' }}>
            <h2><TrendingUp size={16} color="#06b6d4" /> Registered Products</h2>
          </div>
          <table className="fd-table" style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 18, color: 'var(--text-muted)' }}>
                    No factory products registered yet.
                  </td>
                </tr>
              ) : (
                topProducts.map(p => (
                  <tr key={p.sku}>
                    <td>{p.name}</td>
                    <td style={{ fontFamily: 'monospace' }}>{p.sku}</td>
                    <td>{p.category}</td>
                    <td>
                      <span className={`fd-badge ${p.status === 'verified' ? 'fd-badge-green' : 'fd-badge-amber'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
