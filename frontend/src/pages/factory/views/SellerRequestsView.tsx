import { useState } from 'react';
import { Users, Clock, Search } from 'lucide-react';

interface SellerRequestItem {
  id: string;
  seller: string;
  product: string;
  qty: number;
  priority: string;
  status: string;
  submitted: string;
  region: string;
}

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
  const [requests] = useState<SellerRequestItem[]>([]);
  const [search, setSearch] = useState('');

  const stats = [
    { label: 'Pending Requests', value: requests.filter(r => r.status === 'Pending').length.toString(), icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Total Partners',   value: '0',                                                             icon: Users, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  ];

  const filtered = requests.filter(r =>
    r.seller.toLowerCase().includes(search.toLowerCase()) ||
    r.product.toLowerCase().includes(search.toLowerCase())
  );

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
        <h2><Users size={16} color="#8b5cf6" /> Seller Sourcing Requests</h2>
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  No incoming merchant supply requests.
                </td>
              </tr>
            ) : (
              filtered.map(r => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
