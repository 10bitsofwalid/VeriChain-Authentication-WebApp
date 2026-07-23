import { BarChart2, TrendingUp, Package, Truck, DollarSign, ShoppingCart } from 'lucide-react';

const KPI = [
  { label: 'Revenue (MTD)',    value: '$284K', color: '#10b981', icon: DollarSign  },
  { label: 'Units Produced',  value: '4,820', color: '#8b5cf6', icon: Package     },
  { label: 'Orders Fulfilled',value: '1,089', color: '#06b6d4', icon: ShoppingCart},
  { label: 'Shipments Sent',  value: '54',    color: '#f59e0b', icon: Truck       },
  { label: 'Growth (MoM)',    value: '+18%',  color: '#10b981', icon: TrendingUp  },
  { label: 'Defect Rate',     value: '0.3%',  color: '#ef4444', icon: BarChart2   },
];

const TOP_PRODUCTS = [
  { name: 'AirMax Pro Sneaker',   units: 960, revenue: '$86,400', share: 30 },
  { name: 'AlphaCore Hoodie',     units: 780, revenue: '$62,400', share: 24 },
  { name: 'NebulaX Backpack',     units: 610, revenue: '$48,800', share: 19 },
  { name: 'UltraFit Cap',         units: 420, revenue: '$25,200', share: 13 },
  { name: 'ChromePlus Watch',     units: 290, revenue: '$43,500', share: 9  },
  { name: 'StealthPod Earbuds',   units: 158, revenue: '$18,960', share: 5  },
];

const MONTHLY = [
  { month: 'Feb', value: 62  },
  { month: 'Mar', value: 78  },
  { month: 'Apr', value: 71  },
  { month: 'May', value: 95  },
  { month: 'Jun', value: 112 },
  { month: 'Jul', value: 134 },
];

const BAR_MAX = 140;

export default function AnalyticsView() {
  return (
    <div>
      {/* KPI Row */}
      <div className="fd-kpi-row">
        {KPI.map(k => (
          <div className="fd-kpi-item" key={k.label}>
            <k.icon size={20} color={k.color} style={{ marginBottom: 8 }} />
            <span className="fd-kpi-number" style={{ color: k.color }}>{k.value}</span>
            <span className="fd-kpi-label">{k.label}</span>
          </div>
        ))}
      </div>

      <div className="fd-two-col">
        {/* Bar Chart — Monthly Production */}
        <div className="fd-card">
          <div className="fd-section-hd" style={{ marginBottom: 'var(--space-lg)' }}>
            <h2><BarChart2 size={16} color="#8b5cf6" /> Monthly Production (units ×10)</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
            {MONTHLY.map(m => {
              const h = Math.round((m.value / BAR_MAX) * 150);
              return (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>{m.value}</span>
                  <div
                    style={{
                      width: '100%',
                      height: h,
                      borderRadius: '6px 6px 0 0',
                      background: 'linear-gradient(180deg, #8b5cf6 0%, #06b6d4 100%)',
                      opacity: m.month === 'Jul' ? 1 : 0.55,
                      transition: 'height 0.6s ease',
                    }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products Table */}
        <div className="fd-card">
          <div className="fd-section-hd" style={{ marginBottom: 'var(--space-md)' }}>
            <h2><TrendingUp size={16} color="#06b6d4" /> Top Products by Revenue</h2>
          </div>
          <table className="fd-table" style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Units</th>
                <th>Revenue</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {TOP_PRODUCTS.map(p => (
                <tr key={p.name}>
                  <td>{p.name}</td>
                  <td style={{ fontWeight: 700 }}>{p.units}</td>
                  <td style={{ color: '#10b981', fontWeight: 700 }}>{p.revenue}</td>
                  <td style={{ minWidth: 110 }}>
                    <div className="fd-progress-wrap">
                      <div className="fd-progress-track">
                        <div className="fd-progress-fill" style={{ width: `${p.share}%` }} />
                      </div>
                      <span className="fd-progress-pct">{p.share}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regional Distribution */}
      <div style={{ marginTop: 'var(--space-lg)' }}>
        <div className="fd-section-hd">
          <h2><TrendingUp size={16} color="#f59e0b" /> Regional Distribution</h2>
        </div>
        <div className="fd-card">
          {[
            { region: 'North America', pct: 38, color: '#06b6d4' },
            { region: 'Europe',        pct: 27, color: '#8b5cf6' },
            { region: 'Asia Pacific',  pct: 20, color: '#10b981' },
            { region: 'MENA',          pct: 10, color: '#f59e0b' },
            { region: 'Rest of World', pct: 5,  color: '#ef4444' },
          ].map(r => (
            <div key={r.region} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.region}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: r.color }}>{r.pct}%</span>
              </div>
              <div className="fd-progress-track" style={{ height: 8 }}>
                <div className="fd-progress-fill" style={{ width: `${r.pct}%`, background: r.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
