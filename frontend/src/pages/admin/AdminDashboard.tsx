import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import client from '../../api/client';
import {
  Users,
  Package,
  Boxes,
  AlertTriangle,
  Shield,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface DashboardData {
  totalUsers: number;
  totalProducts: number;
  totalItems: number;
  pendingVerifications: number;
  openComplaints: number;
  roleBreakdown: Record<string, number>;
  itemStatusBreakdown: Record<string, number>;
  recentActivity: Array<{
    _id: string;
    action: string;
    details: string;
    timestamp: string;
    actor: { name: string; role: string };
  }>;
}

interface UserEntry {
  _id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  createdAt: string;
}

interface ProductEntry {
  _id: string;
  name: string;
  sku: string;
  category: string;
  verifiedStatus: string;
  createdAt: string;
  factory: { name: string } | string;
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [products, setProducts] = useState<ProductEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'users' | 'products'>('overview');
  
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.endsWith('/users')) {
      setTab('users');
    } else if (location.pathname.endsWith('/products-admin')) {
      setTab('products');
    } else {
      setTab('overview');
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashRes, usersRes, productsRes] = await Promise.all([
        client.get('/admin/dashboard'),
        client.get('/admin/users'),
        client.get('/admin/products'),
      ]);
      setDashboard(dashRes.data.dashboard);
      setUsers(usersRes.data.users);
      setProducts(productsRes.data.products);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string, verified: boolean) => {
    try {
      await client.patch(`/admin/users/${userId}/verify`, { verified });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, verified } : u));
    } catch (err) {
      console.error('Failed to update user verification:', err);
    }
  };

  const handleVerifyProduct = async (productId: string, verifiedStatus: 'verified' | 'rejected') => {
    try {
      await client.patch(`/admin/products/${productId}/verify`, { verifiedStatus });
      setProducts(prev => prev.map(p => p._id === productId ? { ...p, verifiedStatus } : p));
      // Refresh stats
      const dashRes = await client.get('/admin/dashboard');
      setDashboard(dashRes.data.dashboard);
    } catch (err) {
      console.error('Failed to update product verification:', err);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  const stats = [
    { label: 'Total Users', value: dashboard?.totalUsers || 0, icon: Users, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' },
    { label: 'Products', value: dashboard?.totalProducts || 0, icon: Package, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
    { label: 'Items', value: dashboard?.totalItems || 0, icon: Boxes, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
    { label: 'Pending Verifications', value: dashboard?.pendingVerifications || 0, icon: Shield, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
    { label: 'Open Complaints', value: dashboard?.openComplaints || 0, icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>System overview, user management, and activity monitoring</p>
      </div>

      {/* Stats */}
      <div className="grid-stats" style={{ marginBottom: 'var(--space-xl)' }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div className="stat-value">{s.value.toLocaleString()}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--border-default)', paddingBottom: 'var(--space-sm)' }}>
        {(['overview', 'users', 'products'] as const).map(t => (
          <button
            key={t}
            className={`btn btn-ghost ${tab === t ? '' : ''}`}
            onClick={() => setTab(t)}
            style={{
              borderBottom: tab === t ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              borderRadius: 0,
              color: tab === t ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {t === 'overview' ? 'Recent Activity' : t === 'users' ? 'User Management' : 'Product Templates'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <FileText size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Recent Activity</h2>
          </div>

          {dashboard?.recentActivity && dashboard.recentActivity.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Details</th>
                    <th>By</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentActivity.map(log => (
                    <tr key={log._id}>
                      <td>
                        <span className="badge badge-info" style={{ fontSize: '11px' }}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.details}
                      </td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {log.actor?.name || 'System'}
                      </td>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state glass-card">
              <FileText size={48} />
              <h3>No Activity Yet</h3>
              <p>System activity will appear here as users interact with the platform.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <Users size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>All Users</h2>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className="badge badge-neutral">{u.role}</span></td>
                    <td>
                      {u.verified ? (
                        <span className="badge badge-success">Verified</span>
                      ) : (
                        <span className="badge badge-warning">Pending</span>
                      )}
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      {!u.verified ? (
                        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                          <button
                            className="btn btn-sm"
                            style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', border: 'none' }}
                            onClick={() => handleVerifyUser(u._id, true)}
                            title="Approve"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: 'none' }}
                            onClick={() => handleVerifyUser(u._id, false)}
                            title="Reject"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <Package size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Product Templates</h2>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Manufacturer</th>
                  <th>Verification Status</th>
                  <th>Registered Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map(p => (
                    <tr key={p._id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{p.sku}</td>
                      <td><span className="badge badge-neutral">{p.category}</span></td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {typeof p.factory === 'object' && p.factory ? (p.factory as any).name : 'Unknown Factory'}
                      </td>
                      <td>
                        {p.verifiedStatus === 'verified' ? (
                          <span className="badge badge-success">Verified</span>
                        ) : p.verifiedStatus === 'rejected' ? (
                          <span className="badge badge-danger">Rejected</span>
                        ) : (
                          <span className="badge badge-warning">Pending</span>
                        )}
                      </td>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td>
                        {p.verifiedStatus === 'pending' ? (
                          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                            <button
                              className="btn btn-sm"
                              style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', border: 'none' }}
                              onClick={() => handleVerifyProduct(p._id, 'verified')}
                              title="Approve & Verify"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: 'none' }}
                              onClick={() => handleVerifyProduct(p._id, 'rejected')}
                              title="Reject"
                            >
                              <XCircle size={14} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--space-md)' }}>
                      No product templates registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
