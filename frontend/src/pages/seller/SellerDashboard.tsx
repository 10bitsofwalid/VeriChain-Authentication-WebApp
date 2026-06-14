import { useEffect, useState } from 'react';
import client from '../../api/client';
import { ShoppingBag, Package, Truck, Tag } from 'lucide-react';

interface Item {
  _id: string;
  serialNumber: string;
  status: string;
  counterfeitRisk: string;
  product: {
    name: string;
    sku: string;
    imageUrl: string;
    category: string;
    verifiedStatus: string;
  };
  createdAt: string;
}

export default function SellerDashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await client.get('/items/my');
        setItems(res.data.items);
      } catch (err) {
        console.error('Failed to fetch inventory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  const statusCounts = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    { label: 'Total Inventory', value: items.length, icon: Package, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' },
    { label: 'In Transit', value: statusCounts['in_transit'] || 0, icon: Truck, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
    { label: 'Listed', value: statusCounts['listed'] || 0, icon: Tag, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
    { label: 'Sold', value: statusCounts['sold'] || 0, icon: ShoppingBag, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  ];

  const statusBadge = (status: string) => {
    switch (status) {
      case 'manufactured': return 'badge-info';
      case 'in_transit': return 'badge-warning';
      case 'listed': return 'badge-neutral';
      case 'sold': return 'badge-success';
      case 'recalled': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Seller Dashboard</h1>
        <p>Manage your inventory and track item statuses</p>
      </div>

      <div className="grid-stats" style={{ marginBottom: 'var(--space-xl)' }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="empty-state glass-card">
          <Package size={48} />
          <h3>No Items in Inventory</h3>
          <p>Items will appear here once they are transferred to your account by a manufacturer.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Serial Number</th>
                <th>Product</th>
                <th>Category</th>
                <th>Status</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-cyan)' }}>{item.serialNumber}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.product?.name || 'Unknown'}</td>
                  <td>{item.product?.category || '—'}</td>
                  <td><span className={`badge ${statusBadge(item.status)}`}>{item.status.replace('_', ' ')}</span></td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
