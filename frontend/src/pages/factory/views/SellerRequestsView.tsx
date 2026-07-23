import { useState } from 'react';
import { Users, Clock, CheckCircle, XCircle, Search } from 'lucide-react';

const REQUESTS = [
  { id: 'REQ-2210', seller: 'NovaTrend Boutique',  product: 'AirMax Pro Sneaker',   qty: 200, priority: 'High',   status: 'Pending',  submitted: '2026-07-22', region: 'North America' },
  { id: 'REQ-2211', seller: 'PeakGear Hub',         product: 'ChromePlus Watch',     qty: 50,  priority: 'Medium', status: 'Approved', submitted: '2026-07-21', region: 'Europe'        },
  { id: 'REQ-2212', seller: 'StyleVault Co.',        product: 'Heritage Leather Bag', qty: 80,  priority: 'Low',    status: 'Pending',  submitted: '2026-07-20', region: 'Asia Pacific'  },
  { id: 'REQ-2213', seller: 'UrbanEdge Store',       product: 'NebulaX Backpack',    qty: 150, priority: 'High',   status: 'Declined', submitted: '2026-07-19', region: 'North America' },
  { id: 'REQ-2214', seller: 'LuxeLine Market',       product: 'AlphaCore Hoodie',    qty: 300, priority: 'Medium', status: 'Approved', submitted: '2026-07-18', region: 'Europe'        },
];

const STATS = [
  { label: 'Pending',   value: '5',  icon: Clock,        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', trend: '2 high priority' },
  { label: 'Approved',  value: '14', icon: CheckCircle,  color: '#10b981', bg: 'rgba(16,185,129,0.12)', trend: 'This month'      },
  { label: 'Declined',  value: '3',  icon: XCircle,      color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  trend: 'Capacity limits' },
  { label: 'Sellers',   value: '18', icon: Users,        color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', trend: 'Active partners' },
];

const statusBadge: Record<string, string> = {
  'Pending':  'fd-badge fd-badge-amber',
  'Approved': 'fd-badge fd-badge-green',
  'Declined': 'fd-badge fd-badge-red',
};

const priorityBadge: Record<string, string> = {
  'High':   'fd-badge fd-badge-red',
  'Medium': 'fd-badge fd-badge-amber',
  'Low':    'fd-badge fd-badge-blue',
};

export default function SellerRequestsView() {
  const [search, setSearch] = useState('');

  const filtered = REQUESTS.filter(r =>
    r.seller.toLowerCase().includes(search.toLowerCase()) ||
    r.product.toLowerCase().includes(search.toLowerCase())
  );

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

      <div className="fd-control-bar">
        <div className="fd-search-wrap">
          <Search size={15} />
          <input
            id="seller-req-search"
            type="text"
            placeholder="Search seller or product…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="fd-section-hd">
        <h2><Users size={16} color="#8b5cf6" /> Seller Requests</h2>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{filtered.length} requests</span>
      </div>

      <div className="fd-table-wrap">
        <table className="fd-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Seller</th>
              <th>Product</th>
              <th>Region</th>
              <th>Qty</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>{r.id}</td>
                <td>{r.seller}</td>
                <td>{r.product}</td>
                <td><span className="fd-badge fd-badge-gray">{r.region}</span></td>
                <td style={{ fontWeight: 700 }}>{r.qty}</td>
                <td><span className={priorityBadge[r.priority] ?? 'fd-badge fd-badge-gray'}>{r.priority}</span></td>
                <td><span className={statusBadge[r.status] ?? 'fd-badge fd-badge-gray'}>{r.status}</span></td>
                <td>{r.submitted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
