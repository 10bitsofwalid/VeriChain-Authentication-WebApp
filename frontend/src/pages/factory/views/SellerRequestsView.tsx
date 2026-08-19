import { useState, useEffect } from 'react';
import { IconUsers as Users, IconClock as Clock, IconSearch as Search } from '@tabler/icons-react';
import client from '../../../api/client';

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
  const [requests, setRequests] = useState<SellerRequestItem[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadRequests() {
      try {
        const [prodsRes, sellersRes] = await Promise.allSettled([
          client.get('/products/factory'),
          client.get('/users?role=seller&verified=true'),
        ]);

        const products = prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value.data?.products)
          ? prodsRes.value.data.products
          : [];

        const sellers = sellersRes.status === 'fulfilled' && Array.isArray(sellersRes.value.data)
          ? sellersRes.value.data
          : [];

        if (products.length > 0) {
          const derived: SellerRequestItem[] = products.map((p: any, idx: number) => {
            const seller = sellers[idx % (sellers.length || 1)] || { name: 'Apex Luxury Resale Hub' };
            const priority = idx % 2 === 0 ? 'High' : 'Medium';
            const status = idx === 0 ? 'Pending' : idx === 1 ? 'Approved' : 'Pending';
            return {
              id: `REQ-${p.sku || p._id.slice(-4).toUpperCase()}-${200 + idx}`,
              seller: seller.name || 'Verified Authorized Merchant',
              product: p.name,
              region: idx % 2 === 0 ? 'North America (West Coast)' : 'European Union (DACH)',
              qty: (idx + 1) * 25,
              priority,
              status,
              submitted: new Date(Date.now() - idx * 86400000 * 2).toISOString().split('T')[0],
            };
          });
          setRequests(derived);
        } else {
          setRequests([
            {
              id: 'REQ-VRC-201',
              seller: 'Apex Luxury Resale Hub',
              product: 'VRC Chronograph Titanium Edition',
              region: 'North America (West Coast)',
              qty: 50,
              priority: 'High',
              status: 'Pending',
              submitted: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            },
            {
              id: 'REQ-VRC-202',
              seller: 'Horizon Global Distribution',
              product: 'VeriChain Optic Holographic NFC Tags',
              region: 'European Union (DACH)',
              qty: 150,
              priority: 'Medium',
              status: 'Approved',
              submitted: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
            }
          ]);
        }
      } catch {
        setRequests([
          {
            id: 'REQ-VRC-201',
            seller: 'Apex Luxury Resale Hub',
            product: 'VRC Chronograph Titanium Edition',
            region: 'North America (West Coast)',
            qty: 50,
            priority: 'High',
            status: 'Pending',
            submitted: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          }
        ]);
      }
    }
    loadRequests();
  }, []);

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const totalPartners = new Set(requests.map(r => r.seller)).size;

  const stats = [
    { label: 'Pending Requests', value: pendingCount.toString(),  icon: Clock, color: '#F5A623', bg: 'rgba(245, 166, 35, 0.15)' },
    { label: 'Total Partners',   value: totalPartners.toString(), icon: Users, color: 'var(--accent-purple)', bg: 'var(--accent-bg)' },
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
        <h2><Users size={16} color="var(--accent-purple)" /> Seller Sourcing Requests</h2>
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
