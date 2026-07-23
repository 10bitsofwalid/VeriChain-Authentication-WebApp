import { useState } from 'react';
import { Package, Search, Filter, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';

const INVENTORY = [
  { id: 'SN-10001', name: 'AirMax Pro Sneaker', sku: 'AMP-WHT-42', category: 'Footwear',  status: 'In Stock',   qty: 240, location: 'Warehouse A',  updated: '2026-07-20' },
  { id: 'SN-10002', name: 'Heritage Leather Bag', sku: 'HLB-BRN-01', category: 'Bags',    status: 'Low Stock',  qty: 18,  location: 'Warehouse B',  updated: '2026-07-21' },
  { id: 'SN-10003', name: 'ChromePlus Watch',    sku: 'CPW-SLV-05', category: 'Watches',  status: 'In Stock',   qty: 95,  location: 'Vault C',      updated: '2026-07-19' },
  { id: 'SN-10004', name: 'UltraFit Cap',        sku: 'UFC-RED-02', category: 'Apparel',  status: 'Out of Stock',qty: 0,  location: 'Warehouse A',  updated: '2026-07-18' },
  { id: 'SN-10005', name: 'NebulaX Backpack',    sku: 'NBX-BLK-10', category: 'Bags',    status: 'In Stock',   qty: 312, location: 'Warehouse D',  updated: '2026-07-22' },
  { id: 'SN-10006', name: 'PrimeRun Shorts',     sku: 'PRS-NVY-08', category: 'Apparel', status: 'Low Stock',  qty: 11,  location: 'Warehouse B',  updated: '2026-07-20' },
  { id: 'SN-10007', name: 'AlphaCore Hoodie',    sku: 'ACH-GRY-14', category: 'Apparel', status: 'In Stock',   qty: 188, location: 'Warehouse A',  updated: '2026-07-21' },
  { id: 'SN-10008', name: 'StealthPod Earbuds',  sku: 'SPE-BLK-03', category: 'Electronics', status: 'In Stock', qty: 74, location: 'Vault C',   updated: '2026-07-22' },
];

const STATS = [
  { label: 'Total SKUs',    value: '148',  trend: '+12 this month', icon: Package,      color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  { label: 'In Stock',      value: '122',  trend: '82% of total',   icon: CheckCircle,  color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { label: 'Low Stock',     value: '18',   trend: 'Action needed',  icon: AlertCircle,  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { label: 'Out of Stock',  value: '8',    trend: 'Reorder required',icon: Clock,       color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  { label: 'Total Units',   value: '4,820',trend: '+320 vs last wk', icon: Zap,         color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
];

const statusBadge: Record<string, string> = {
  'In Stock':     'fd-badge fd-badge-green',
  'Low Stock':    'fd-badge fd-badge-amber',
  'Out of Stock': 'fd-badge fd-badge-red',
};

export default function InventoryView() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = INVENTORY.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                        item.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || item.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      {/* Stats */}
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

      {/* Control Bar */}
      <div className="fd-control-bar">
        <div className="fd-search-wrap">
          <Search size={15} />
          <input
            id="inventory-search"
            type="text"
            placeholder="Search products or SKU…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Filter size={15} style={{ color: 'var(--text-muted)' }} />
        <select
          id="inventory-status-filter"
          className="fd-select"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="fd-section-hd">
        <h2><Package size={16} color="#06b6d4" /> Inventory Items</h2>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{filtered.length} items</span>
      </div>
      <div className="fd-table-wrap">
        <table className="fd-table">
          <thead>
            <tr>
              <th>Serial / ID</th>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Status</th>
              <th>Qty</th>
              <th>Location</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id}>
                <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>{item.id}</td>
                <td>{item.name}</td>
                <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>{item.sku}</td>
                <td>{item.category}</td>
                <td><span className={statusBadge[item.status]}>{item.status}</span></td>
                <td style={{ fontWeight: 700, color: item.qty === 0 ? '#ef4444' : item.qty < 20 ? '#f59e0b' : 'var(--text-primary)' }}>{item.qty}</td>
                <td>{item.location}</td>
                <td>{item.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
