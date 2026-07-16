import { useEffect, useState } from 'react';
import PageLoader from '../../components/ui/PageLoader';
import AlertBanner from '../../components/ui/AlertBanner';
import Modal from '../../components/ui/Modal';
import MetricCard from '../../components/ui/MetricCard';
import { verificationBadge } from '../../utils/badges';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  Boxes,
  AlertTriangle,
  TrendingUp,
  Truck,
  ShoppingCart,
  Plus,
} from 'lucide-react';

interface Analytics {
  totalTemplates: number;
  totalManufactured: number;
  activeRecalls: number;
  inTransit: number;
  sold: number;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  sku: string;
  verifiedStatus: string;
  imageUrl: string;
  createdAt: string;
}

export default function FactoryDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Batch generation states
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchCount, setBatchCount] = useState(10);
  const [batchPrefix, setBatchPrefix] = useState('VC');
  const [startingSerial, setStartingSerial] = useState(100001);
  const [generating, setGenerating] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [analyticsRes, productsRes] = await Promise.all([
        client.get('/products/analytics'),
        client.get('/products/factory'),
      ]);
      setAnalytics(analyticsRes.data.analytics);
      setProducts(productsRes.data.products);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenBatchModal = (productId: string) => {
    setActiveProductId(productId);
    setShowBatchModal(true);
    setBatchCount(10);
    setBatchPrefix('VC');
    setStartingSerial(100001);
    setModalError('');
    setModalSuccess('');
  };

  const handleGenerateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProductId) return;

    setGenerating(true);
    setModalError('');
    setModalSuccess('');

    try {
      const res = await client.post(`/products/${activeProductId}/batch`, {
        count: batchCount,
        prefix: batchPrefix,
        startingSerial,
      });
      setModalSuccess(res.data.message);
      
      // Refresh analytics and product lists
      await fetchData();

      setTimeout(() => {
        setShowBatchModal(false);
        setActiveProductId(null);
      }, 2000);
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to generate batch');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  const stats = [
    { label: 'Product Templates', value: analytics?.totalTemplates || 0, icon: Package, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' },
    { label: 'Total Manufactured', value: analytics?.totalManufactured || 0, icon: Boxes, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
    { label: 'In Transit', value: analytics?.inTransit || 0, icon: Truck, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
    { label: 'Sold', value: analytics?.sold || 0, icon: ShoppingCart, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
    { label: 'Active Recalls', value: analytics?.activeRecalls || 0, icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
  ];



  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Factory Dashboard</h1>
          <p>Manage your products and monitor manufacturing activity</p>
        </div>
        {user?.verified ? (
          <Link to="/dashboard/register-product" className="btn btn-primary">
            <Plus size={18} />
            New Product
          </Link>
        ) : (
          <button className="btn btn-primary" disabled style={{ opacity: 0.5 }}>
            <Plus size={18} />
            New Product (Unverified)
          </button>
        )}
      </div>

      {user && !user.verified && (
        <AlertBanner
          type="error"
          message={
            <span>
              <strong>Account Verification Pending:</strong> Your manufacturer account is pending administrator approval.
              You cannot register new products or generate batch serials until verified.
            </span>
          }
          style={{ marginBottom: 'var(--space-lg)' }}
        />
      )}

      {/* Stats */}
      <div className="grid-stats" style={{ marginBottom: 'var(--space-xl)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-lg)' }}>
        {stats.map(s => (
          <MetricCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={<s.icon size={20} color={s.color} />}
          />
        ))}
      </div>

      {/* Products Table */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
        <TrendingUp size={18} color="var(--accent-cyan)" />
        <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Your Products</h2>
      </div>

      {products.length === 0 ? (
        <div className="empty-state glass-card">
          <Package size={48} />
          <h3>No Products Yet</h3>
          <p>Register your first product template to start generating serialized batches.</p>
          <Link to="/dashboard/register-product" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
            <Plus size={16} /> Register Product
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{product.sku}</td>
                  <td>{product.category}</td>
                  <td><span className={`badge ${verificationBadge(product.verifiedStatus)}`}>{product.verifiedStatus}</span></td>
                  <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleOpenBatchModal(product._id)}
                      disabled={!user?.verified}
                      title={!user?.verified ? "Account pending verification" : undefined}
                    >
                      <Plus size={14} /> Generate Batch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        title="Generate Serialized Batch"
      >
        {modalError && <AlertBanner type="error" message={modalError} style={{ marginBottom: 'var(--space-md)' }} />}
        {modalSuccess && <AlertBanner type="success" message={modalSuccess} style={{ marginBottom: 'var(--space-md)' }} />}
        
        <form onSubmit={handleGenerateBatch} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="batch-count">Batch Count (Units)</label>
            <input
              id="batch-count"
              type="number"
              className="form-input"
              min="1"
              max="500"
              value={batchCount}
              onChange={e => setBatchCount(parseInt(e.target.value) || 1)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="batch-prefix">Serial Prefix</label>
            <input
              id="batch-prefix"
              type="text"
              className="form-input"
              placeholder="e.g. VC"
              value={batchPrefix}
              onChange={e => setBatchPrefix(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="starting-serial">Starting Serial Number</label>
            <input
              id="starting-serial"
              type="number"
              className="form-input"
              min="1"
              value={startingSerial}
              onChange={e => setStartingSerial(parseInt(e.target.value) || 1)}
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowBatchModal(false)} disabled={generating}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={generating}>
              {generating ? 'Generating...' : 'Generate Batch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
