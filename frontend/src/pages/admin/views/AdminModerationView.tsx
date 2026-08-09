import { useState, useEffect } from 'react';
import ActionButton from '../../../components/ui/ActionButton';
import StatusChip from '../../../components/ui/StatusChip';
import MetricCard from '../../../components/ui/MetricCard';
import client from '../../../api/client';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  X,
  FileCheck,
} from 'lucide-react';

interface ModerationItem {
  id: string;
  itemType: 'Product Template' | 'Seller Listing' | 'Batch Serial Range';
  title: string;
  submittedBy: string;
  flagReason: string;
  riskScore: number;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  date: string;
  nfcHash?: string;
}

export default function AdminModerationView() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadModeration() {
      try {
        const [prodRes, compRes] = await Promise.allSettled([
          client.get('/moderator/products'),
          client.get('/complaints'),
        ]);

        const list: ModerationItem[] = [];

        const prodList = prodRes.status === 'fulfilled' ? (Array.isArray(prodRes.value.data) ? prodRes.value.data : prodRes.value.data?.products) : null;
        if (Array.isArray(prodList)) {
          prodList.forEach((p: any) => {
            list.push({
              id: p._id,
              itemType: 'Product Template',
              title: p.name,
              submittedBy: p.factory?.name || p.manufacturer || 'Certified Factory',
              flagReason: p.verifiedStatus === 'pending' ? 'Pending initial certificate audit' : 'Routine compliance check',
              riskScore: p.verifiedStatus === 'rejected' ? 85 : 10,
              status: p.verifiedStatus === 'verified' ? 'approved' : p.verifiedStatus === 'rejected' ? 'rejected' : 'pending',
              date: new Date(p.createdAt || Date.now()).toISOString().split('T')[0],
              nfcHash: p.certificateUrl || '0xVC-CERT',
            });
          });
        }

        if (compRes.status === 'fulfilled' && compRes.value.data?.complaints) {
          compRes.value.data.complaints.forEach((c: any) => {
            list.push({
              id: c._id,
              itemType: 'Seller Listing',
              title: `Complaint on ${c.productInstance?.product?.name || 'Product'}`,
              submittedBy: c.buyer?.name || 'Buyer',
              flagReason: c.reason || 'Discrepancy reported',
              riskScore: 75,
              status: c.status === 'resolved' ? 'approved' : c.status === 'dismissed' ? 'rejected' : 'flagged',
              date: new Date(c.createdAt || Date.now()).toISOString().split('T')[0],
            });
          });
        }

        setItems(list);
      } catch {
        setItems([]);
      }
    }
    loadModeration();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAction = async (id: string, newStatus: 'approved' | 'rejected' | 'flagged') => {
    try {
      if (newStatus === 'approved') {
        await client.patch(`/admin/products/${id}/verify`, { verifiedStatus: 'verified' }).catch(async () => {
          return await client.patch(`/moderator/products/${id}/verify`, { verifiedStatus: 'verified' });
        });
      } else if (newStatus === 'rejected') {
        await client.patch(`/admin/products/${id}/verify`, { verifiedStatus: 'rejected' }).catch(async () => {
          return await client.patch(`/moderator/products/${id}/verify`, { verifiedStatus: 'rejected' });
        });
      }
    } catch {}
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    showToast(`Moderation item marked as ${newStatus.toUpperCase()}`);
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const filtered = items.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.flagReason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = items.filter(i => i.status === 'pending').length;
  const flaggedCount = items.filter(i => i.status === 'flagged').length;
  const approvedCount = items.filter(i => i.status === 'approved').length;
  const rejectedCount = items.filter(i => i.status === 'rejected').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg, 20px)' }}>
      {toastMessage && (
        <div style={{
          background: 'rgba(6, 182, 212, 0.15)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          color: '#38bdf8',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md, 8px)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <ShieldCheck size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Moderation Metrics */}
      <div className="admin-grid-4">
        <MetricCard
          label="Pending Review"
          value={pendingCount.toString()}
          icon={<ShieldAlert size={20} color="#f59e0b" />}
        />
        <MetricCard
          label="Flagged / Suspicious"
          value={flaggedCount.toString()}
          icon={<AlertTriangle size={20} color="#ef4444" />}
        />
        <MetricCard
          label="Approved Items"
          value={approvedCount.toString()}
          icon={<CheckCircle size={20} color="#10b981" />}
        />
        <MetricCard
          label="Rejected Items"
          value={rejectedCount.toString()}
          icon={<XCircle size={20} color="#8b5cf6" />}
        />
      </div>

      {/* Control Bar */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <FileCheck size={20} color="#06b6d4" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
              Moderation & Integrity Queue
            </h3>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div className="admin-search-input">
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search moderation items..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="admin-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Item / Title</th>
                <th>Submitted By</th>
                <th>Flag Reason</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <span className="fd-badge fd-badge-purple">{item.itemType}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#f8fafc' }}>{item.title}</td>
                  <td>{item.submittedBy}</td>
                  <td style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{item.flagReason}</td>
                  <td>
                    <StatusChip tone={item.status === 'approved' ? 'success' : item.status === 'rejected' || item.status === 'flagged' ? 'danger' : 'warning'}>
                      {item.status.toUpperCase()}
                    </StatusChip>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.date}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => setSelectedItem(item)}
                        title="View Details"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#10b981' }}
                        onClick={() => handleAction(item.id, 'approved')}
                        title="Approve"
                      >
                        <CheckCircle size={13} />
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444' }}
                        onClick={() => handleAction(item.id, 'rejected')}
                        title="Reject"
                      >
                        <XCircle size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No items in moderation queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Modal */}
      {selectedItem && (
        <div className="recall-modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div className="recall-modal" onClick={e => e.stopPropagation()}>
            <div className="recall-modal-header">
              <h3>Moderation Review — {selectedItem.title}</h3>
              <button
                onClick={() => setSelectedItem(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="recall-modal-body">
              <div className="detail-info-grid">
                <div className="detail-info-card">
                  <div className="detail-info-label">Item Type</div>
                  <div className="detail-info-value">{selectedItem.itemType}</div>
                </div>
                <div className="detail-info-card">
                  <div className="detail-info-label">Submitted By</div>
                  <div className="detail-info-value">{selectedItem.submittedBy}</div>
                </div>
                <div className="detail-info-card">
                  <div className="detail-info-label">Flag Reason</div>
                  <div className="detail-info-value">{selectedItem.flagReason}</div>
                </div>
                <div className="detail-info-card">
                  <div className="detail-info-label">Status</div>
                  <div className="detail-info-value" style={{ textTransform: 'uppercase' }}>{selectedItem.status}</div>
                </div>
              </div>
            </div>
            <div className="recall-modal-footer">
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </ActionButton>
              <ActionButton
                variant="danger"
                size="sm"
                onClick={() => handleAction(selectedItem.id, 'rejected')}
              >
                Reject
              </ActionButton>
              <ActionButton
                variant="primary"
                size="sm"
                onClick={() => handleAction(selectedItem.id, 'approved')}
              >
                Approve
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
