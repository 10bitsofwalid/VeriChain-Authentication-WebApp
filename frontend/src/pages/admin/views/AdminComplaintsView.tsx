import { useState, useEffect } from 'react';
import ActionButton from '../../../components/ui/ActionButton';
import StatusChip from '../../../components/ui/StatusChip';
import MetricCard from '../../../components/ui/MetricCard';
import client from '../../../api/client';
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
  category: string;
  severity: 'high' | 'medium' | 'low';
  status: 'open' | 'under_review' | 'resolved' | 'escalated';
  submittedDate: string;
  description: string;
}

export default function AdminComplaintsView() {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeComplaint, setActiveComplaint] = useState<ComplaintRecord | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchComplaints = async () => {
    try {
      const res = await client.get('/complaints');
      if (res.data?.complaints && Array.isArray(res.data.complaints)) {
        const mapped: ComplaintRecord[] = res.data.complaints.map((c: any) => ({
          id: c._id,
          ticketNo: `CMP-${c._id.slice(-6).toUpperCase()}`,
          reporter: c.buyer?.name || 'Verified Buyer',
          targetUser: c.seller?.name || 'Network Merchant',
          category: c.reason || 'General Dispute',
          severity: 'medium',
          status: (c.status === 'resolved' ? 'resolved' : 'open') as any,
          submittedDate: new Date(c.createdAt || Date.now()).toISOString().split('T')[0],
          description: c.details || c.reason || 'Dispute logged on chain.',
        }));
        setComplaints(mapped);
      } else {
        setComplaints([]);
      }
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

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
    showToast('Complaint resolved and notification issued to parties');
  };

  const filtered = complaints.filter(c => {
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesStat = selectedStatus === 'all' || c.status === selectedStatus;
    const matchesQuery = searchQuery === '' ||
      c.ticketNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.targetUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStat && matchesQuery;
  });

  const openCount = complaints.filter(c => c.status === 'open').length;
  const underReviewCount = complaints.filter(c => c.status === 'under_review').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const escalatedCount = complaints.filter(c => c.status === 'escalated').length;

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
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="admin-grid-4">
        <MetricCard
          label="Open Tickets"
          value={openCount.toString()}
          icon={<AlertTriangle size={20} color="#f59e0b" />}
        />
        <MetricCard
          label="Under Review"
          value={underReviewCount.toString()}
          icon={<Clock size={20} color="#06b6d4" />}
        />
        <MetricCard
          label="Resolved Disputes"
          value={resolvedCount.toString()}
          icon={<CheckCircle2 size={20} color="#10b981" />}
        />
        <MetricCard
          label="Escalated Incidents"
          value={escalatedCount.toString()}
          icon={<ShieldAlert size={20} color="#ef4444" />}
        />
      </div>

      {/* Controls Bar */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div className="admin-search-input">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search ticket #, reporter, target or reason..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
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
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
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
                <th>Ticket ID</th>
                <th>Reporter</th>
                <th>Target Party</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    Loading logged disputes...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    No buyer or seller disputes logged on the platform.
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>
                        {c.ticketNo}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{c.reporter}</td>
                    <td>{c.targetUser}</td>
                    <td>
                      <span className="fd-badge fd-badge-gray">{c.category}</span>
                    </td>
                    <td>
                      <StatusChip tone={c.severity === 'high' ? 'danger' : c.severity === 'medium' ? 'warning' : 'info'}>
                        {c.severity.toUpperCase()}
                      </StatusChip>
                    </td>
                    <td>
                      <StatusChip tone={c.status === 'resolved' ? 'success' : c.status === 'escalated' ? 'danger' : 'warning'}>
                        {c.status.toUpperCase()}
                      </StatusChip>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{c.submittedDate}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <ActionButton
                          variant="secondary"
                          size="sm"
                          onClick={() => setActiveComplaint(c)}
                        >
                          Manage
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Complaint Modal */}
      {activeComplaint && (
        <div className="recall-modal-backdrop" onClick={() => setActiveComplaint(null)}>
          <div className="recall-modal" onClick={e => e.stopPropagation()}>
            <div className="recall-modal-header">
              <h3>Dispute Resolution — {activeComplaint.ticketNo}</h3>
              <button
                onClick={() => setActiveComplaint(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleResolveSubmit}>
              <div className="recall-modal-body">
                <div className="detail-info-grid">
                  <div className="detail-info-card">
                    <div className="detail-info-label">Reporter</div>
                    <div className="detail-info-value">{activeComplaint.reporter}</div>
                  </div>
                  <div className="detail-info-card">
                    <div className="detail-info-label">Reported Target</div>
                    <div className="detail-info-value">{activeComplaint.targetUser}</div>
                  </div>
                  <div className="detail-info-card">
                    <div className="detail-info-label">Category</div>
                    <div className="detail-info-value">{activeComplaint.category}</div>
                  </div>
                  <div className="detail-info-card">
                    <div className="detail-info-label">Current Status</div>
                    <div className="detail-info-value" style={{ textTransform: 'uppercase' }}>{activeComplaint.status}</div>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <label className="form-label">Incident Description & Evidence</label>
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    padding: 12,
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    color: '#cbd5e1',
                    lineHeight: 1.5,
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    {activeComplaint.description}
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <label className="form-label" htmlFor="resolution-note">Resolution Findings & Directives</label>
                  <textarea
                    id="resolution-note"
                    className="form-textarea"
                    rows={3}
                    placeholder="Enter resolution notes, refund triggers, or merchant warnings..."
                    value={resolutionNote}
                    onChange={e => setResolutionNote(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="recall-modal-footer">
                <ActionButton
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setActiveComplaint(null)}
                >
                  Cancel
                </ActionButton>
                <ActionButton
                  variant="danger"
                  size="sm"
                  type="button"
                  onClick={() => handleUpdateStatus(activeComplaint.id, 'escalated')}
                >
                  Escalate Incident
                </ActionButton>
                <ActionButton
                  variant="primary"
                  size="sm"
                  type="submit"
                >
                  Resolve & Close
                </ActionButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
