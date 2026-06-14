import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { Package, Shield, AlertTriangle, Search } from 'lucide-react';

interface Item {
  _id: string;
  serialNumber: string;
  status: string;
  counterfeitRisk: string;
  product: {
    name: string;
    sku: string;
    category: string;
    verifiedStatus: string;
  };
  createdAt: string;
}

interface Complaint {
  _id: string;
  reason: string;
  status: string;
  createdAt: string;
  productInstance: { serialNumber: string };
}

export default function BuyerDashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, complaintsRes] = await Promise.all([
          client.get('/items/my'),
          client.get('/complaints'),
        ]);
        setItems(itemsRes.data.items);
        setComplaints(complaintsRes.data.complaints);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  const stats = [
    { label: 'My Products', value: items.length, icon: Package, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' },
    { label: 'Verified', value: items.filter(i => i.product?.verifiedStatus === 'verified').length, icon: Shield, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
    { label: 'Open Complaints', value: complaints.filter(c => ['pending', 'under_review'].includes(c.status)).length, icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  ];

  const statusBadge = (status: string) => {
    switch (status) {
      case 'verified': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'rejected': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>My Dashboard</h1>
          <p>Track your purchased products and verification status</p>
        </div>
        <Link to="/verify" className="btn btn-secondary">
          <Search size={16} />
          Verify a Product
        </Link>
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

      {/* My Items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
        <Package size={18} color="var(--accent-cyan)" />
        <h2 style={{ fontSize: '18px', fontWeight: 600 }}>My Products</h2>
      </div>

      {items.length === 0 ? (
        <div className="empty-state glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
          <Package size={48} />
          <h3>No Products Yet</h3>
          <p>Products you purchase will appear here with their verification status.</p>
        </div>
      ) : (
        <div className="table-container" style={{ marginBottom: 'var(--space-xl)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Serial Number</th>
                <th>Product</th>
                <th>Category</th>
                <th>Verification</th>
                <th>Purchased</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-cyan)' }}>{item.serialNumber}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.product?.name || 'Unknown'}</td>
                  <td>{item.product?.category || '—'}</td>
                  <td><span className={`badge ${statusBadge(item.product?.verifiedStatus)}`}>{item.product?.verifiedStatus || 'unknown'}</span></td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Complaints */}
      {complaints.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <AlertTriangle size={18} color="var(--color-warning)" />
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>My Complaints</h2>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Filed</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{c.productInstance?.serialNumber || '—'}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{c.reason}</td>
                    <td><span className={`badge ${c.status === 'resolved' ? 'badge-success' : c.status === 'dismissed' ? 'badge-danger' : 'badge-warning'}`}>{c.status.replace('_', ' ')}</span></td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
