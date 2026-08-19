import { useState, useEffect } from 'react';
import {
  IconPackage as Package,
  IconSearch as Search,
  IconFilter as Filter,
  IconAlertCircle as AlertCircle,
  IconCircleCheck as CheckCircle,
  IconClock as Clock,
  IconBolt as Zap,
} from '@tabler/icons-react';
import client from '../../../api/client';

interface FactoryInventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  qty: number;
  location: string;
  updated: string;
}

const statusBadge: Record<string, string> = {
  'In Stock':     'fd-badge fd-badge-green',
  'Low Stock':    'fd-badge fd-badge-amber',
  'Out of Stock': 'fd-badge fd-badge-red',
};

export default function InventoryView() {
  const [items, setItems] = useState<FactoryInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    async function loadInventory() {
      try {
        const res = await client.get('/products/factory');
        if (res.data?.products && Array.isArray(res.data.products)) {
          const list: FactoryInventoryItem[] = res.data.products.map((p: any) => ({
            id: p._id,
            name: p.name,
            sku: p.sku || 'SKU-001',
            category: p.category || 'General',
            status: (p.stock === 0 ? 'Out of Stock' : (p.stock < 10 ? 'Low Stock' : 'In Stock')) as any,
            qty: p.stock ?? 25,
            location: p.location || 'Factory Main Warehouse',
            updated: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          }));
          setItems(list);
        } else {
          setItems([]);
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    loadInventory();
  }, []);

  const totalSKUs = items.length;
  const inStock = items.filter(i => i.status === 'In Stock').length;
  const lowStock = items.filter(i => i.status === 'Low Stock').length;
  const outOfStock = items.filter(i => i.status === 'Out of Stock').length;
  const totalUnits = items.reduce((s, i) => s + i.qty, 0);

  const stats = [
    { label: 'Total SKUs',   value: totalSKUs.toString(), icon: Package,     color: 'var(--accent-primary)', bg: 'rgba(26, 43, 76, 0.1)' },
    { label: 'In Stock',     value: inStock.toString(),   icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Low Stock',    value: lowStock.toString(),  icon: AlertCircle, color: '#F5A623', bg: 'rgba(245, 166, 35, 0.15)' },
    { label: 'Out of Stock', value: outOfStock.toString(),icon: Clock,       color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    { label: 'Total Units',  value: totalUnits.toString(),icon: Zap,         color: 'var(--accent-purple)', bg: 'var(--accent-bg)' },
  ];

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                        item.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || item.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      {/* Stats */}
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
        <h2><Package size={16} color="var(--accent-primary)" /> Inventory Items</h2>
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
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  Loading factory inventory...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  No inventory items recorded yet.
                </td>
              </tr>
            ) : (
              filtered.map(item => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
