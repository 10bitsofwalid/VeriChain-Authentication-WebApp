import { useState } from 'react';
import ActionButton from '../../../components/ui/ActionButton';
import StatusChip from '../../../components/ui/StatusChip';
import MetricCard from '../../../components/ui/MetricCard';
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  X,
} from 'lucide-react';

interface ComplaintRecord {
  id: string;
  ticketNo: string;
  reporter: string;
  targetUser: string;
  category: 'Fake Listing' | 'Non-Delivery' | 'Defective Seal' | 'Unauthorized Seller';
  severity: 'high' | 'medium' | 'low';
  status: 'open' | 'under_review' | 'resolved' | 'escalated';
  submittedDate: string;
  description: string;
}

const INITIAL_COMPLAINTS: ComplaintRecord[] = [
  {
    id: 'cmp-101',
    ticketNo: 'CMP-2026-881',
    reporter: 'Elena Rostova',
    targetUser: 'Shadow Reseller X',
    category: 'Fake Listing',
    severity: 'high',
    status: 'open',
    submittedDate: '2026-07-22',
    description: 'Received item without valid VeriChain NFC tag. QR code redirects to suspicious third-party site.',
  },
  {
    id: 'cmp-102',
    ticketNo: 'CMP-2026-879',
    reporter: 'Marcus Vance',
    targetUser: 'Apex Authentics Hub',
    category: 'Unauthorized Seller',
    severity: 'medium',
    status: 'under_review',
    submittedDate: '2026-07-21',
    description: 'Store claims official factory distribution rights without verified brand certificate.',
  },
  {
    id: 'cmp-103',
    ticketNo: 'CMP-2026-865',
    reporter: 'Aura Manufacturing Co.',
    targetUser: 'Velvet Vault Goods',
    category: 'Defective Seal',
    severity: 'low',
    status: 'resolved',
    submittedDate: '2026-07-18',
    description: 'Security hologram seal reported torn prior to buyer dispatch.',
  },
  {
    id: 'cmp-104',
    ticketNo: 'CMP-2026-840',
    reporter: 'David K.',
    targetUser: 'Boutique Imports LLC',
    category: 'Non-Delivery',
    severity: 'high',
    status: 'escalated',
    submittedDate: '2026-07-15',
    description: 'Payment collected 10 days ago but no tracked shipment logged on blockchain ledger.',
  },
];

export default function AdminComplaintsView() {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>(INITIAL_COMPLAINTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeComplaint, setActiveComplaint] = useState<ComplaintRecord | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateStatus = (id: string, newStatus: ComplaintRecord['status']) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    showToast(`Ticket status changed to ${newStatus.toUpperCase()}`);
    if (activeComplaint && activeComplaint.id === id) {
      setActiveComplaint(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;
    handleUpdateStatus(activeComplaint.id, 'resolved');
    setActiveComplaint(null);
    setResolutionNote('');
  };

  const filtered = complaints.filter(c => {
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesStat = selectedStatus === 'all' || c.status === selectedStatus;
    const matchesSearch = searchQuery === '' ||
      c.ticketNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.targetUser.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStat && matchesSearch;
  });

  const openCount = complaints.filter(c => c.status === 'open').length;
  const reviewCount = complaints.filter(c => c.status === 'under_review').length;
  const highSevCount = complaints.filter(c => c.severity === 'high').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg, 20px)' }}>
      {toastMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md, 8px)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="admin-grid-4">
        <MetricCard
          label="Open Tickets"
          value={openCount.toString()}
          icon={<AlertTriangle size={20} color="#ef4444" />}
        />
        <MetricCard
          label="Under Review"
          value={reviewCount.toString()}
          icon={<Clock size={20} color="#f59e0b" />}
        />
        <MetricCard
          label="High Severity"
          value={highSevCount.toString()}
          icon={<ShieldAlert size={20} color="#8b5cf6" />}
        />
        <MetricCard
          label="Resolved Tickets"
          value={resolvedCount.toString()}
          icon={<CheckCircle2 size={20} color="#10b981" />}
        />
      </div>

      {/* Toolbar */}
      <div className="admin-card">
        <div className="admin-toolbar" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="admin-search-input">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search ticket #, reporter, target..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="admin-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Fake Listing">Fake Listing</option>
              <option value="Non-Delivery">Non-Delivery</option>
              <option value="Defective Seal">Defective Seal</option>
              <option value="Unauthorized Seller">Unauthorized Seller</option>
            </select>
            <select
              className="admin-select"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="under_review">Under Review</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Category</th>
                <th>Complainant</th>
                <th>Reported Party</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#06b6d4' }}>
                    {c.ticketNo}
                  </td>
                  <td style={{ fontWeight: 500, color: '#f8fafc' }}>{c.category}</td>
                  <td style={{ color: '#cbd5e1' }}>{c.reporter}</td>
                  <td style={{ color: '#cbd5e1' }}>{c.targetUser}</td>
                  <td>
                    <StatusChip tone={c.severity === 'high' ? 'danger' : c.severity === 'medium' ? 'warning' : 'info'}>
                      {c.severity.toUpperCase()}
                    </StatusChip>
                  </td>
                  <td>
                    <StatusChip tone={c.status === 'resolved' ? 'success' : c.status === 'open' ? 'danger' : c.status === 'escalated' ? 'warning' : 'info'}>
                      {c.status.replace('_', ' ').toUpperCase()}
                    </StatusChip>
                  </td>
                  <td style={{ fontSize: '0.825rem', color: '#94a3b8' }}>{c.submittedDate}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <ActionButton
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveComplaint(c)}
                      >
                        Inspect & Resolve
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    No complaints matching filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Inspector Modal */}
      {activeComplaint && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 700, fontFamily: 'monospace' }}>
                  {activeComplaint.ticketNo}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>
                  Dispute Resolution Panel
                </h3>
              </div>
              <button 
                onClick={() => setActiveComplaint(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 14, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Reporter: <strong>{activeComplaint.reporter}</strong></span>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Target: <strong>{activeComplaint.targetUser}</strong></span>
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  "{activeComplaint.description}"
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Update Ticket Status</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['open', 'under_review', 'escalated', 'resolved'] as const).map(st => (
                    <button
                      type="button"
                      key={st}
                      className={`btn btn-ghost ${activeComplaint.status === st ? 'active' : ''}`}
                      onClick={() => handleUpdateStatus(activeComplaint.id, st)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        border: activeComplaint.status === st ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                        background: activeComplaint.status === st ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                        color: activeComplaint.status === st ? '#38bdf8' : '#94a3b8',
                      }}
                    >
                      {st.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Resolution Notes</label>
                <textarea
                  className="admin-select"
                  style={{ width: '100%', minHeight: 80, resize: 'vertical' }}
                  placeholder="Enter administrative review summary or action rationale..."
                  value={resolutionNote}
                  onChange={e => setResolutionNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <ActionButton variant="ghost" size="sm" onClick={() => setActiveComplaint(null)} type="button">
                  Cancel
                </ActionButton>
                <ActionButton variant="primary" size="sm" type="submit">
                  Save & Resolve Ticket
                </ActionButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
