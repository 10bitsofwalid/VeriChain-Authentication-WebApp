import { TrendingUp, Store, Package, CheckCircle } from 'lucide-react';

const ALLOCATIONS = [
  { id: 'ALO-001', seller: 'NovaTrend Boutique',  product: 'AirMax Pro Sneaker',   units: 120, status: 'Active',   share: 48, region: 'North America' },
  { id: 'ALO-002', seller: 'PeakGear Hub',         product: 'ChromePlus Watch',     units: 40,  status: 'Active',   share: 27, region: 'Europe'        },
  { id: 'ALO-003', seller: 'StyleVault Co.',        product: 'Heritage Leather Bag', units: 60,  status: 'Pending',  share: 30, region: 'Asia Pacific'  },
  { id: 'ALO-004', seller: 'UrbanEdge Store',       product: 'NebulaX Backpack',    units: 95,  status: 'Active',   share: 31, region: 'North America' },
  { id: 'ALO-005', seller: 'LuxeLine Market',       product: 'AlphaCore Hoodie',    units: 200, status: 'Active',   share: 33, region: 'Europe'        },
  { id: 'ALO-006', seller: 'SportZone Official',    product: 'PrimeRun Shorts',     units: 150, status: 'Completed',share: 38, region: 'MENA'          },
  { id: 'ALO-007', seller: 'TechDen Retail',        product: 'StealthPod Earbuds',  units: 74,  status: 'Pending',  share: 30, region: 'Asia Pacific'  },
  { id: 'ALO-008', seller: 'CapZone Online',        product: 'UltraFit Cap',        units: 350, status: 'Completed',share: 100, region: 'Global'       },
];

const STATS = [
  { label: 'Total Allocations', value: '24',    icon: TrendingUp,   color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', trend: '3 pending review' },
  { label: 'Active Sellers',    value: '18',    icon: Store,        color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  trend: '+4 onboarded'     },
  { label: 'Units Allocated',   value: '1,089', icon: Package,      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', trend: '4 products'       },
  { label: 'Fulfilled',         value: '82%',   icon: CheckCircle,  color: '#10b981', bg: 'rgba(16,185,129,0.12)', trend: '↑ 6% this month'  },
];

const statusBadge: Record<string, string> = {
  'Active':    'fd-badge fd-badge-green',
  'Pending':   'fd-badge fd-badge-amber',
  'Completed': 'fd-badge fd-badge-blue',
};

export default function AllocationsView() {
  return (
    <div>
      <div className="fd-stats-grid">
        {STATS.map(s => (
          <div className="fd-stat-card" key={s.label}>
            <div className="fd-stat-icon" style={{ background: s.bg }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <p className="fd-stat-label">{s.label}</p>
              <p className="fd-stat-value">{s.value}</p>
              <span className="fd-stat-trend">{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="fd-section-hd">
        <h2><TrendingUp size={16} color="#8b5cf6" /> Allocation Registry</h2>
      </div>

      <div className="fd-table-wrap">
        <table className="fd-table">
          <thead>
            <tr>
              <th>Allocation ID</th>
              <th>Seller</th>
              <th>Product</th>
              <th>Region</th>
              <th>Units</th>
              <th>Market Share</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ALLOCATIONS.map(a => (
              <tr key={a.id}>
                <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>{a.id}</td>
                <td>{a.seller}</td>
                <td>{a.product}</td>
                <td><span className="fd-badge fd-badge-gray">{a.region}</span></td>
                <td style={{ fontWeight: 700 }}>{a.units}</td>
                <td style={{ minWidth: 140 }}>
                  <div className="fd-progress-wrap">
                    <div className="fd-progress-track">
                      <div className="fd-progress-fill" style={{ width: `${a.share}%` }} />
                    </div>
                    <span className="fd-progress-pct">{a.share}%</span>
                  </div>
                </td>
                <td><span className={statusBadge[a.status] ?? 'fd-badge fd-badge-gray'}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
