import { useState } from 'react';
import ActionButton from '../../../components/ui/ActionButton';
import StatusChip from '../../../components/ui/StatusChip';
import MetricCard from '../../../components/ui/MetricCard';
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
  riskScore: number; // 0 - 100
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  date: string;
  nfcHash?: string;
}

const INITIAL_MODERATION: ModerationItem[] = [
  {
    id: 'mod-1',
    itemType: 'Product Template',
    title: 'Aura Luxury Chronograph Series V',
    submittedBy: 'Titan Chrono Factory',
    flagReason: 'High-value product registration threshold (> $10k MSRP)',
    riskScore: 12,
    status: 'pending',
    date: '2026-07-23',
    nfcHash: '0x992f...a12c',
  },
  {
    id: 'mod-2',
    itemType: 'Seller Listing',
    title: 'Limited Edition Leather Handbag',
    submittedBy: 'Apex Authentics Hub',
    flagReason: 'Mismatched factory serial allocation',
    riskScore: 78,
    status: 'flagged',
    date: '2026-07-22',
    nfcHash: '0x44ab...f881',
  },
  {
    id: 'mod-3',
    itemType: 'Batch Serial Range',
    title: 'Batch #B-902 (500 units)',
    submittedBy: 'LuxeCraft Inc.',
    flagReason: 'Routine factory batch integrity scan',
    riskScore: 5,
    status: 'approved',
    date: '2026-07-20',
    nfcHash: '0x12ec...0099',
  },
  {
    id: 'mod-4',
    itemType: 'Seller Listing',
    title: 'Ultra Precision Optical Sensor',
    submittedBy: 'Shadow Reseller X',
    flagReason: 'Duplicate digital birth certificate detected',
    riskScore: 92,
    status: 'rejected',
    date: '2026-07-19',
    nfcHash: '0xff81...c332',
  },
];

export default function AdminModerationView() {
  const [items, setItems] = useState<ModerationItem[]>(INITIAL_MODERATION);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAction = (id: string, newStatus: 'approved' | 'rejected' | 'flagged') => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    showToast(`Moderation item marked as ${newStatus.toUpperCase()}`);
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const filtered = items.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || item.itemType === filterType;
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.flagReason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
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
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="admin-grid-4">
        <MetricCard
          label="Pending Queue"
          value={pendingCount.toString()}
          icon={<FileCheck size={20} color="#06b6d4" />}
        />
        <MetricCard
          label="Flagged / Suspicious"
          value={flaggedCount.toString()}
          icon={<ShieldAlert size={20} color="#ef4444" />}
        />
        <MetricCard
          label="Approved Listings"
          value={approvedCount.toString()}
          icon={<ShieldCheck size={20} color="#10b981" />}
        />
        <MetricCard
          label="Rejected / Blocked"
          value={rejectedCount.toString()}
          icon={<XCircle size={20} color="#f59e0b" />}
        />
      </div>

      {/* Filters Toolbar */}
      <div className="admin-card">
        <div className="admin-toolbar" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="admin-search-input">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search item, entity, or flag reason..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="admin-select"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="all">All Item Types</option>
              <option value="Product Template">Product Template</option>
              <option value="Seller Listing">Seller Listing</option>
              <option value="Batch Serial Range">Batch Serial Range</option>
            </select>
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

      {/* Moderation Queue Table */}
      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item / Entity</th>
                <th>Type</th>
                <th>Submitted By</th>
                <th>Flag Rationale</th>
                <th>AI Risk Score</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#06b6d4' }}>{item.nfcHash}</div>
                  </td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                      {item.itemType}
                    </span>
                  </td>
                  <td style={{ color: '#cbd5e1' }}>{item.submittedBy}</td>
                  <td style={{ color: '#94a3b8', fontSize: '0.825rem', maxWidth: 260 }}>{item.flagReason}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: item.riskScore > 70 ? '#ef4444' : item.riskScore > 30 ? '#f59e0b' : '#10b981',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      {item.riskScore} / 100
                    </span>
                  </td>
                  <td>
                    <StatusChip tone={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : item.status === 'flagged' ? 'warning' : 'info'}>
                      {item.status.toUpperCase()}
                    </StatusChip>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <ActionButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Eye size={14} /> View
                      </ActionButton>
                      <ActionButton
                        variant="primary"
                        size="sm"
                        onClick={() => handleAction(item.id, 'approved')}
                      >
                        Approve
                      </ActionButton>
                      <ActionButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleAction(item.id, 'rejected')}
                      >
                        Reject
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    No moderation items matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Inspector Modal */}
      {selectedItem && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>{selectedItem.itemType}</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', color: '#f8fafc' }}>
                  {selectedItem.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 14, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 4 }}>Submission Details</div>
                <div style={{ color: '#f8fafc', fontWeight: 600 }}>Submitted by: {selectedItem.submittedBy}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.825rem', marginTop: 4 }}>Date: {selectedItem.date}</div>
                <div style={{ color: '#06b6d4', fontFamily: 'monospace', fontSize: '0.825rem', marginTop: 4 }}>Hash: {selectedItem.nfcHash}</div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: 12, borderRadius: 8 }}>
                <div style={{ color: '#f87171', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={16} /> Flag Reason & AI Risk Analysis
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: 4 }}>
                  {selectedItem.flagReason}
                </div>
                <div style={{ color: '#f87171', fontWeight: 700, fontSize: '0.85rem', marginTop: 6 }}>
                  Calculated Risk Index: {selectedItem.riskScore}%
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <ActionButton
                  variant="primary"
                  size="sm"
                  style={{ flex: 1 }}
                  onClick={() => handleAction(selectedItem.id, 'approved')}
                >
                  Approve Registration
                </ActionButton>
                <ActionButton
                  variant="danger"
                  size="sm"
                  style={{ flex: 1 }}
                  onClick={() => handleAction(selectedItem.id, 'rejected')}
                >
                  Reject & Delist
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
