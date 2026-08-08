import { useState } from 'react';
import { TrendingUp, Store, Package } from 'lucide-react';

interface AllocationItem {
  id: string;
  seller: string;
  product: string;
  region: string;
  units: number;
  share: number;
  status: string;
}

const statusBadge: Record<string, string> = {
  'Active':    'fd-badge fd-badge-green',
  'Pending':   'fd-badge fd-badge-amber',
  'Completed': 'fd-badge fd-badge-blue',
};

export default function AllocationsView() {
  const [allocations] = useState<AllocationItem[]>([]);

  const stats = [
    { label: 'Total Allocations', value: allocations.length.toString(), icon: TrendingUp, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    { label: 'Active Sellers',    value: '0',                          icon: Store,      color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
    { label: 'Units Allocated',   value: '0',                          icon: Package,    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  ];

  return (
    <div>
      <div className="fd-stats-grid">
        {stats.map(s => (
          <div className="fd-stat-card" key={s.label}>
            <div className="fd-stat-icon" style={{ background: s.bg }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <p className="fd-stat-label">{s.label}</p>
              <p className="fd-stat-value">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="fd-section-hd">
        <h2><TrendingUp size={16} color="#8b5cf6" /> Allocation Registry</h2>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{allocations.length} allocations</span>
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
            {allocations.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  No merchant allocations currently registered.
                </td>
              </tr>
            ) : (
              allocations.map(a => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
