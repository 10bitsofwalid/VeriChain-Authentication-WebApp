import { useEffect, useState } from 'react';
import PageLoader from '../../components/ui/PageLoader';
import { verificationBadge } from '../../utils/badges';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { Package, Shield, AlertTriangle, Search } from 'lucide-react';
import DashboardMetricCard from '../../components/DashboardMetricCard';
import AnalyticsSection from '../../components/AnalyticsSection';

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
    return <PageLoader />;
  }

  const stats = [
    { label: 'My Products', value: items.length, icon: Package, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' },
    { label: 'Verified', value: items.filter(i => i.product?.verifiedStatus === 'verified').length, icon: Shield, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
    { label: 'Open Complaints', value: complaints.filter(c => ['pending', 'under_review'].includes(c.status)).length, icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  ];



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

<AnalyticsSection title="Overview">
  {stats.map(s => (
    <DashboardMetricCard
      key={s.label}
      icon={<s.icon size={20} color={s.color} />}
      label={s.label}
      value={s.value}
    />
  ))}
</AnalyticsSection>

<AnalyticsSection title="My Products" empty={items.length === 0}>
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
          <td><span className={`badge ${verificationBadge(item.product?.verifiedStatus || 'unknown')}`}>{item.product?.verifiedStatus || 'unknown'}</span></td>
          <td>{new Date(item.createdAt).toLocaleDateString()}</td>
        </tr>
      ))}
    </tbody>
  </table>
</AnalyticsSection>

<AnalyticsSection title="My Complaints" empty={complaints.length === 0}>
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
</AnalyticsSection>
    </div>
  );
}
