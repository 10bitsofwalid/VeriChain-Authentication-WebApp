import React, { useEffect, useState } from 'react';
import PageLoader from '../../components/ui/PageLoader';
import MetricCard from '../../components/ui/MetricCard';
import { useLocation } from 'react-router-dom';
import client from '../../api/client';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Loader,
  AlertOctagon,
  TrendingUp,
} from 'lucide-react';

interface ModeratorAnalytics {
  pendingVerifications: number;
  openComplaints: number;
  flaggedListings: number;
}

interface ProductEntry {
  _id: string;
  name: string;
  sku: string;
  category: string;
  verifiedStatus: string;
  createdAt: string;
  factory: { name: string; email: string };
  imageUrl: string;
  certificateUrl: string;
}

interface ComplaintEntry {
  _id: string;
  reason: string;
  description: string;
  evidenceUrl?: string;
  transactionHash?: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  moderatorNotes?: string;
  buyer: { _id: string; name: string; email: string };
  seller: { _id: string; name: string; email: string };
  productInstance: { _id: string; serialNumber: string; status: string };
  createdAt: string;
}

interface FlaggedItemEntry {
  _id: string;
  serialNumber: string;
  status: string;
  counterfeitRisk: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  product?: {
    name: string;
    sku: string;
    category: string;
    verifiedStatus: string;
  };
  currentOwner?: {
    name: string;
    email: string;
    role: string;
  };
}

interface ModeratorDashboardProps {
  defaultTab?: 'overview' | 'verification' | 'complaints' | 'fake-listings';
}

export default function ModeratorDashboard({ defaultTab }: ModeratorDashboardProps) {
  const [analytics, setAnalytics] = useState<ModeratorAnalytics | null>(null);
  const [products, setProducts] = useState<ProductEntry[]>([]);
  const [complaints, setComplaints] = useState<ComplaintEntry[]>([]);
  const [flaggedItems, setFlaggedItems] = useState<FlaggedItemEntry[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<'overview' | 'verification' | 'complaints' | 'fake-listings'>('overview');
  
  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductEntry | null>(null);
  
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintEntry | null>(null);
  const [complaintStatus, setComplaintStatus] = useState<ComplaintEntry['status']>('under_review');
  const [moderatorNotes, setModeratorNotes] = useState('');

  const [showFlaggedModal, setShowFlaggedModal] = useState(false);
  const [selectedFlaggedItem, setSelectedFlaggedItem] = useState<FlaggedItemEntry | null>(null);
  const [itemRisk, setItemRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [itemStatus, setItemStatus] = useState<string>('listed');

  const location = useLocation();

  useEffect(() => {
    if (defaultTab) {
      setTab(defaultTab);
    } else if (location.pathname.endsWith('/product-verification')) {
      setTab('verification');
    } else if (location.pathname.endsWith('/complaints-moderator')) {
      setTab('complaints');
    } else if (location.pathname.endsWith('/fake-listings')) {
      setTab('fake-listings');
    } else {
      setTab('overview');
    }
  }, [location.pathname, defaultTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, productsRes, complaintsRes, flaggedRes] = await Promise.all([
        client.get('/moderator/dashboard'),
        client.get('/moderator/products'),
        client.get('/complaints'),
        client.get('/moderator/fake-listings'),
      ]);
      
      setAnalytics(analyticsRes.data.analytics);
      setProducts(productsRes.data.products);
      setComplaints(complaintsRes.data.complaints);
      setFlaggedItems(flaggedRes.data.items);
    } catch (err) {
      console.error('Failed to load moderator dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyProduct = async (id: string, verifiedStatus: 'verified' | 'rejected') => {
    try {
      setSubmitting(true);
      await client.patch(`/moderator/products/${id}/verify`, { verifiedStatus });
      setProducts(prev => prev.filter(p => p._id !== id));
      
      // Update analytics
      if (analytics) {
        setAnalytics({
          ...analytics,
          pendingVerifications: Math.max(0, analytics.pendingVerifications - 1),
        });
      }
      setShowProductModal(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Failed to update product verification:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setSubmitting(true);
      await client.patch(`/complaints/${selectedComplaint._id}`, {
        status: complaintStatus,
        moderatorNotes,
      });

      setComplaints(prev =>
        prev.map(c => (c._id === selectedComplaint._id ? { ...c, status: complaintStatus, moderatorNotes } : c))
      );

      // Refresh stats
      const analyticsRes = await client.get('/moderator/dashboard');
      setAnalytics(analyticsRes.data.analytics);

      setShowComplaintModal(false);
      setSelectedComplaint(null);
    } catch (err) {
      console.error('Failed to update complaint:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFlaggedItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlaggedItem) return;

    try {
      setSubmitting(true);
      await client.patch(`/moderator/items/${selectedFlaggedItem._id}/risk`, {
        counterfeitRisk: itemRisk,
        status: itemStatus,
      });

      setFlaggedItems(prev =>
        prev.map(item =>
          item._id === selectedFlaggedItem._id ? { ...item, counterfeitRisk: itemRisk, status: itemStatus } : item
        )
      );

      // Refresh stats
      const analyticsRes = await client.get('/moderator/dashboard');
      setAnalytics(analyticsRes.data.analytics);

      setShowFlaggedModal(false);
      setSelectedFlaggedItem(null);
    } catch (err) {
      console.error('Failed to update flagged item risk:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  const stats = [
    { label: 'Pending Verifications', value: analytics?.pendingVerifications || 0, icon: Shield, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
    { label: 'Open Complaints', value: analytics?.openComplaints || 0, icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
    { label: 'Flagged High-Risk Listings', value: analytics?.flaggedListings || 0, icon: AlertOctagon, color: '#e11d48', bg: 'rgba(225, 29, 72, 0.12)' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Moderation Control Center</h1>
        <p>Review disputes, verify manufacturer templates, and flags counterfeit assets</p>
      </div>

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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--border-default)', paddingBottom: 'var(--space-sm)' }}>
        {(['overview', 'verification', 'complaints', 'fake-listings'] as const).map(t => (
          <button
            key={t}
            className="btn btn-ghost"
            onClick={() => setTab(t)}
            style={{
              borderBottom: tab === t ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              borderRadius: 0,
              color: tab === t ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {t === 'overview' ? 'Overview' : t === 'verification' ? 'Product Verification Queue' : t === 'complaints' ? 'Disputes / Complaints Queue' : 'Flagged High-Risk Queue'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="glass-card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <TrendingUp size={48} color="var(--accent-cyan)" style={{ marginBottom: 'var(--space-sm)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Moderation Overview</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto var(--space-md) auto' }}>
              Welcome back to the VeriChain Moderator console. There are currently {analytics?.pendingVerifications} product templates awaiting approval, {analytics?.openComplaints} disputes, and {analytics?.flaggedListings} flagged listings requiring inspection.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => setTab('verification')}>Review Products</button>
              <button className="btn btn-secondary" onClick={() => setTab('complaints')}>Review Complaints</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'verification' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <Shield size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Product Verification Queue</h2>
          </div>

          {products.length === 0 ? (
            <div className="empty-state glass-card">
              <CheckCircle size={48} color="var(--color-success)" />
              <h3>All Products Verified</h3>
              <p>No manufacturing templates are currently pending review.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product Details</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Manufacturer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                          {p.imageUrl && (
                            <img src={p.imageUrl} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Registered {new Date(p.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{p.sku}</td>
                      <td><span className="badge badge-neutral">{p.category}</span></td>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.factory?.name || 'Unknown'}</td>
                      <td>
                        <button className="btn btn-sm btn-secondary" onClick={() => { setSelectedProduct(p); setShowProductModal(true); }}>
                          <Eye size={14} style={{ marginRight: '4px' }} /> Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'complaints' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <AlertTriangle size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Disputes / Complaints Queue</h2>
          </div>

          {complaints.length === 0 ? (
            <div className="empty-state glass-card">
              <CheckCircle size={48} color="var(--color-success)" />
              <h3>No Disputes Found</h3>
              <p>Platform complaints are currently clear.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Serial Number</th>
                    <th>Reason</th>
                    <th>Involved Parties</th>
                    <th>Date Filed</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => {
                    let badgeClass = 'badge-neutral';
                    if (c.status === 'pending') badgeClass = 'badge-info';
                    else if (c.status === 'under_review') badgeClass = 'badge-warning';
                    else if (c.status === 'resolved') badgeClass = 'badge-success';
                    else if (c.status === 'dismissed') badgeClass = 'badge-danger';

                    return (
                      <tr key={c._id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-cyan)' }}>
                          {c.productInstance?.serialNumber || 'Unregistered'}
                        </td>
                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.reason}</td>
                        <td>
                          <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column' }}>
                            <span>Buyer: {c.buyer?.name}</span>
                            <span style={{ color: 'var(--text-muted)' }}>Seller: {c.seller?.name}</span>
                          </div>
                        </td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${badgeClass}`}>{c.status.replace('_', ' ')}</span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-secondary" onClick={() => {
                            setSelectedComplaint(c);
                            setComplaintStatus(c.status);
                            setModeratorNotes(c.moderatorNotes || '');
                            setShowComplaintModal(true);
                          }}>
                            <Eye size={14} style={{ marginRight: '4px' }} /> Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'fake-listings' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <AlertOctagon size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Flagged High-Risk Listings</h2>
          </div>

          {flaggedItems.length === 0 ? (
            <div className="empty-state glass-card">
              <CheckCircle size={48} color="var(--color-success)" />
              <h3>No Flagged Items</h3>
              <p>No active listings are marked with medium or high counterfeit risk.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Serial Number</th>
                    <th>Product Name</th>
                    <th>Current Owner</th>
                    <th>Risk Status</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedItems.map(item => (
                    <tr key={item._id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-cyan)' }}>
                        {item.serialNumber}
                      </td>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {item.product?.name || 'Unknown SKU'}
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column' }}>
                          <span>{item.currentOwner?.name}</span>
                          <span style={{ color: 'var(--text-muted)' }}>Role: {item.currentOwner?.role}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${item.counterfeitRisk === 'high' ? 'badge-danger' : 'badge-warning'}`}>
                          {item.counterfeitRisk.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{item.status}</span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-secondary" onClick={() => {
                          setSelectedFlaggedItem(item);
                          setItemRisk(item.counterfeitRisk);
                          setItemStatus(item.status);
                          setShowFlaggedModal(true);
                        }}>
                          <Eye size={14} style={{ marginRight: '4px' }} /> Inspect Risk
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Inspect Product Modal */}
      {showProductModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Verify Product Template</h3>
              <button className="modal-close" onClick={() => { setShowProductModal(false); setSelectedProduct(null); }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', margin: 'var(--space-sm) 0' }}>
              <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                {selectedProduct.imageUrl && (
                  <img src={selectedProduct.imageUrl} alt={selectedProduct.name} style={{ width: '96px', height: '96px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-default)' }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedProduct.name}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>SKU: {selectedProduct.sku}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Category: {selectedProduct.category}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Manufacturer:</span>
                <p style={{ margin: '2px 0 0 0', fontWeight: 500 }}>{selectedProduct.factory?.name} ({selectedProduct.factory?.email})</p>
              </div>

              {selectedProduct.certificateUrl && (
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Certificate Document:</span>
                  <a href={selectedProduct.certificateUrl} target="_blank" rel="noreferrer" style={{ display: 'block', textDecoration: 'underline', color: 'var(--accent-cyan)', marginTop: '2px', wordBreak: 'break-all' }}>
                    {selectedProduct.certificateUrl}
                  </a>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-secondary" onClick={() => handleVerifyProduct(selectedProduct._id, 'rejected')} disabled={submitting}>
                <XCircle size={16} style={{ marginRight: '6px' }} /> Reject Template
              </button>
              <button className="btn btn-primary" onClick={() => handleVerifyProduct(selectedProduct._id, 'verified')} disabled={submitting}>
                <CheckCircle size={16} style={{ marginRight: '6px' }} /> Approve & Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Complaint Modal */}
      {showComplaintModal && selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3>Dispute Resolution Panel</h3>
              <button className="modal-close" onClick={() => { setShowComplaintModal(false); setSelectedComplaint(null); }}>&times;</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', borderBottom: '1px solid var(--border-default)', paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Dispute Reason: </span>
                <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>{selectedComplaint.reason}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Serial Number: </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{selectedComplaint.productInstance?.serialNumber}</span>
              </div>
              {selectedComplaint.transactionHash && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Acquisition Tx Hash: </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{selectedComplaint.transactionHash}</span>
                </div>
              )}
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Description: </span>
                <p style={{ marginTop: '4px', background: 'rgba(10, 14, 26, 0.4)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
                  {selectedComplaint.description}
                </p>
              </div>
              {selectedComplaint.evidenceUrl && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Evidence URL: </span>
                  <a href={selectedComplaint.evidenceUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                    {selectedComplaint.evidenceUrl}
                  </a>
                </div>
              )}
              <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: '4px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Buyer (Filer): </span>
                  <span>{selectedComplaint.buyer?.name}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Seller: </span>
                  <span>{selectedComplaint.seller?.name}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateComplaint} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="comp-status">Update Status</label>
                <select
                  id="comp-status"
                  className="form-select"
                  value={complaintStatus}
                  onChange={e => setComplaintStatus(e.target.value as any)}
                  required
                >
                  <option value="pending">Pending Review</option>
                  <option value="under_review">Under Active Investigation</option>
                  <option value="resolved">Resolved (Settled)</option>
                  <option value="dismissed">Dismissed (No Discrepancy)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="comp-notes">Resolution Notes</label>
                <textarea
                  id="comp-notes"
                  className="form-textarea"
                  placeholder="Provide resolution details or action notes..."
                  value={moderatorNotes}
                  onChange={e => setModeratorNotes(e.target.value)}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowComplaintModal(false); setSelectedComplaint(null); }} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <Loader size={14} className="spin" /> : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flagged Item Inspection Modal */}
      {showFlaggedModal && selectedFlaggedItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Flagged Asset Verification</h3>
              <button className="modal-close" onClick={() => { setShowFlaggedModal(false); setSelectedFlaggedItem(null); }}>&times;</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', fontSize: '13px', borderBottom: '1px solid var(--border-default)', paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Item Serial: </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>{selectedFlaggedItem.serialNumber}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Product Catalogue: </span>
                <span>{selectedFlaggedItem.product?.name} ({selectedFlaggedItem.product?.sku})</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Current Owner: </span>
                <span>{selectedFlaggedItem.currentOwner?.name} ({selectedFlaggedItem.currentOwner?.email})</span>
              </div>
            </div>

            <form onSubmit={handleUpdateFlaggedItem} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="asset-risk">Counterfeit Risk Level</label>
                <select
                  id="asset-risk"
                  className="form-select"
                  value={itemRisk}
                  onChange={e => setItemRisk(e.target.value as any)}
                  required
                >
                  <option value="low">Low Risk (Authentic)</option>
                  <option value="medium">Medium Risk (Disputed)</option>
                  <option value="high">High Risk (Counterfeit Suspicion)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="asset-status">Item Flow Status</label>
                <select
                  id="asset-status"
                  className="form-select"
                  value={itemStatus}
                  onChange={e => setItemStatus(e.target.value)}
                  required
                >
                  <option value="manufactured">Manufactured</option>
                  <option value="in_transit">In Transit</option>
                  <option value="listed">Listed for Sale</option>
                  <option value="sold">Sold</option>
                  <option value="recalled">Recalled (Safety quarantine)</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowFlaggedModal(false); setSelectedFlaggedItem(null); }} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <Loader size={14} className="spin" /> : 'Save Flag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
