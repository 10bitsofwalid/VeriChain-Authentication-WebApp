import { useEffect, useState } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  Package,
  Truck,
  Tag,
  Share2,
  Settings,
  AlertTriangle,
  CheckCircle,
  Loader,
} from 'lucide-react';

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
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Transfer form state
  const [transferToUserId, setTransferToUserId] = useState('');
  const [transferLocation, setTransferLocation] = useState('');

  // Status update form state
  const [statusVal, setStatusVal] = useState('in_transit');
  const [statusLocation, setStatusLocation] = useState('');

  const fetchItems = async () => {
    try {
      const res = await client.get('/items/my');
      setItems(res.data.items);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError('Could not load inventory items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleListOnMarketplace = async (itemId: string) => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await client.patch(`/items/${itemId}/status`, {
        status: 'listed',
        location: 'Seller Inventory - Listed for Sale',
      });
      setSuccess('Item listed on marketplace successfully.');
      await fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to list item on marketplace.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenTransfer = (item: Item) => {
    setSelectedItem(item);
    setTransferToUserId('');
    setTransferLocation('');
    setShowTransferModal(true);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !transferToUserId) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await client.post(`/items/${selectedItem._id}/transfer`, {
        toUserId: transferToUserId,
        location: transferLocation || 'Seller Dispatch',
      });
      setSuccess(`Item ${selectedItem.serialNumber} ownership transferred successfully.`);
      setShowTransferModal(false);
      setSelectedItem(null);
      await fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to transfer item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenStatus = (item: Item) => {
    setSelectedItem(item);
    setStatusVal(item.status);
    setStatusLocation('');
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !statusVal) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await client.patch(`/items/${selectedItem._id}/status`, {
        status: statusVal,
        location: statusLocation || 'Seller Warehouse Updates',
      });
      setSuccess(`Status of item ${selectedItem.serialNumber} updated to ${statusVal.replace('_', ' ')}.`);
      setShowStatusModal(false);
      setSelectedItem(null);
      await fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

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
    { label: 'Listed for Sale', value: statusCounts['listed'] || 0, icon: Tag, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
    { label: 'Sold Units', value: statusCounts['sold'] || 0, icon: ShoppingBag, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
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
        <h1>Seller Inventory Manager</h1>
        <p>Update statuses, dispatch items, or list products directly onto the Verified Marketplace</p>
      </div>

      {user && !user.verified && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
          <AlertTriangle size={18} />
          <span>
            <strong>Account Verification Pending:</strong> Your seller account is pending administrator approval.
            You cannot list items on the marketplace or transfer ownership until verified.
          </span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: 'var(--space-lg)' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="alert-close">&times;</button>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="alert-close">&times;</button>
        </div>
      )}

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
          <p>Items will appear here once they are transferred to your account by a manufacturer or other distributor.</p>
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
                <th style={{ textAlign: 'right' }}>Actions</th>
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
                  <td style={{ textAlign: 'right' }}>
                    {item.status !== 'recalled' && item.status !== 'sold' && (
                      <div style={{ display: 'inline-flex', gap: 'var(--space-xs)' }}>
                        {item.status !== 'listed' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleListOnMarketplace(item._id)}
                            disabled={submitting || !user?.verified}
                            title={!user?.verified ? "Account pending verification" : undefined}
                          >
                            <Tag size={12} /> List
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleOpenStatus(item)}
                          disabled={submitting || !user?.verified}
                          title={!user?.verified ? "Account pending verification" : undefined}
                        >
                          <Settings size={12} /> Status
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleOpenTransfer(item)}
                          disabled={submitting || !user?.verified}
                          title={!user?.verified ? "Account pending verification" : undefined}
                        >
                          <Share2 size={12} /> Transfer
                        </button>
                      </div>
                    )}
                    {(item.status === 'recalled' || item.status === 'sold') && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>No Actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {showTransferModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Transfer Item Ownership</h3>
              <button className="modal-close" onClick={() => { setShowTransferModal(false); setSelectedItem(null); }}>&times;</button>
            </div>
            
            <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'rgba(10, 14, 26, 0.4)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
                Item: <strong>{selectedItem.product?.name}</strong><br />
                Serial: <code style={{ color: 'var(--accent-cyan)' }}>{selectedItem.serialNumber}</code>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="recipient-id">Recipient User ID</label>
                <input
                  id="recipient-id"
                  type="text"
                  className="form-input"
                  placeholder="Enter recipient's system ID"
                  value={transferToUserId}
                  onChange={e => setTransferToUserId(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="transfer-loc">Transfer Location / Point</label>
                <input
                  id="transfer-loc"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Retail Outlet, Central Hub"
                  value={transferLocation}
                  onChange={e => setTransferLocation(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowTransferModal(false); setSelectedItem(null); }} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting || !transferToUserId}>
                  {submitting ? <Loader size={14} className="spin" /> : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Update Item Status</h3>
              <button className="modal-close" onClick={() => { setShowStatusModal(false); setSelectedItem(null); }}>&times;</button>
            </div>
            
            <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'rgba(10, 14, 26, 0.4)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
                Item: <strong>{selectedItem.product?.name}</strong><br />
                Current Status: <span className={`badge ${statusBadge(selectedItem.status)}`}>{selectedItem.status}</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="select-status">New Status</label>
                <select
                  id="select-status"
                  className="form-select"
                  value={statusVal}
                  onChange={e => setStatusVal(e.target.value)}
                  required
                >
                  <option value="manufactured">Manufactured (In Facility)</option>
                  <option value="in_transit">In Transit (Dispatch/Shipment)</option>
                  <option value="listed">Listed (For sale in marketplace)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="status-loc">Location Description</label>
                <input
                  id="status-loc"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Route 66 Transit, Warehouse D"
                  value={statusLocation}
                  onChange={e => setStatusLocation(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowStatusModal(false); setSelectedItem(null); }} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <Loader size={14} className="spin" /> : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
