import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import {
  AlertTriangle,
  Plus,
  Loader,
  CheckCircle,
  Eye,
} from 'lucide-react';

interface Complaint {
  _id: string;
  reason: string;
  description: string;
  evidenceUrl?: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  moderatorNotes?: string;
  buyer: { _id: string; name: string; email: string };
  seller: { _id: string; name: string; email: string };
  productInstance: { _id: string; serialNumber: string; status: string };
  createdAt: string;
}

interface MyItem {
  _id: string;
  serialNumber: string;
  product?: {
    name: string;
  };
  currentOwner: string;
  status: string;
  journey: Array<{
    actor: string;
  }>;
}

export default function Complaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [myItems, setMyItems] = useState<MyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [showFileModal, setShowFileModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // File Complaint form state
  const [selectedItemInstanceId, setSelectedItemInstanceId] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  // Review Complaint form state
  const [reviewStatus, setReviewStatus] = useState<Complaint['status']>('under_review');
  const [moderatorNotes, setModeratorNotes] = useState('');

  const fetchData = async () => {
    try {
      const [compRes] = await Promise.all([
        client.get('/complaints'),
      ]);
      setComplaints(compRes.data.complaints);

      // If buyer, also fetch their owned items to lodge complaints
      if (user?.role === 'buyer') {
        const itemsRes = await client.get('/items/my');
        setMyItems(itemsRes.data.items);
      }
    } catch (err: any) {
      console.error('Failed to load complaints:', err);
      setError('Could not fetch complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemInstanceId || !reason || !description) {
      setError('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await client.post('/complaints', {
        productInstanceId: selectedItemInstanceId,
        reason,
        description,
        evidenceUrl: evidenceUrl || undefined,
      });

      setSuccess('Complaint filed successfully. A moderator will review it shortly.');
      setShowFileModal(false);
      // Reset form
      setSelectedItemInstanceId('');
      setReason('');
      setDescription('');
      setEvidenceUrl('');
      // Reload complaints
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to file complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReview = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setReviewStatus(complaint.status);
    setModeratorNotes(complaint.moderatorNotes || '');
    setShowReviewModal(true);
  };

  const handleReviewComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await client.patch(`/complaints/${selectedComplaint._id}`, {
        status: reviewStatus,
        moderatorNotes,
      });

      setSuccess(`Complaint updated status to ${reviewStatus.replace('_', ' ')}.`);
      setShowReviewModal(false);
      setSelectedComplaint(null);
      // Reload complaints
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'resolved': return 'badge-success';
      case 'dismissed': return 'badge-danger';
      case 'under_review': return 'badge-warning';
      case 'pending': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const isModOrAdmin = ['admin', 'moderator'].includes(user?.role || '');

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Complaints Panel</h1>
          <p>
            {isModOrAdmin
              ? 'Review, investigate, and resolve product authenticity disputes'
              : 'Submit claims and monitor feedback for counterfeits or discrepancies'}
          </p>
        </div>
        {user?.role === 'buyer' && (
          <button className="btn btn-primary" onClick={() => setShowFileModal(true)}>
            <Plus size={16} /> File a Complaint
          </button>
        )}
      </div>

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

      {complaints.length === 0 ? (
        <div className="empty-state glass-card">
          <AlertTriangle size={48} />
          <h3>No Complaints Filed</h3>
          <p>
            {isModOrAdmin
              ? 'No active complaints registered on the platform.'
              : 'You have not registered any complaints yet.'}
          </p>
          {user?.role === 'buyer' && (
            <button className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }} onClick={() => setShowFileModal(true)}>
              <Plus size={16} /> File First Complaint
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Serial</th>
                <th>Reason</th>
                <th>{isModOrAdmin ? 'Buyer / Seller' : isModOrAdmin ? 'Parties' : 'Opposing Party'}</th>
                <th>Filed Date</th>
                <th>Status</th>
                {isModOrAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-cyan)' }}>
                    {c.productInstance?.serialNumber || 'Unregistered'}
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.reason}</td>
                  <td>
                    {isModOrAdmin ? (
                      <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column' }}>
                        <span>Buyer: {c.buyer?.name || '—'}</span>
                        <span style={{ color: 'var(--text-muted)' }}>Seller: {c.seller?.name || '—'}</span>
                      </div>
                    ) : user?.role === 'buyer' ? (
                      <span>Seller: {c.seller?.name || 'Unknown'}</span>
                    ) : (
                      <span>Buyer: {c.buyer?.name || 'Unknown'}</span>
                    )}
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${statusBadge(c.status)}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  {isModOrAdmin && (
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleOpenReview(c)}>
                        <Eye size={14} style={{ marginRight: '4px' }} /> Review
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* File Complaint Modal (Buyer Only) */}
      {showFileModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>File Authenticity Complaint</h3>
              <button className="modal-close" onClick={() => setShowFileModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleFileComplaint} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="select-item">Select Owned Item</label>
                <select
                  id="select-item"
                  className="form-select"
                  value={selectedItemInstanceId}
                  onChange={e => setSelectedItemInstanceId(e.target.value)}
                  required
                >
                  <option value="">-- Select Product Instance --</option>
                  {myItems.map(item => (
                    <option key={item._id} value={item._id}>
                      {item.product?.name || 'Product'} (Serial: {item.serialNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="complaint-reason">Complaint Reason</label>
                <select
                  id="complaint-reason"
                  className="form-select"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                >
                  <option value="">-- Select Reason --</option>
                  <option value="Counterfeit Suspicion">Counterfeit Suspicion</option>
                  <option value="Defective QR Code">Defective QR Code / Verification Link</option>
                  <option value="Unregistered Seller Listing">Unregistered Seller / Wrong Details</option>
                  <option value="Product Spec Discrepancy">Product Spec Discrepancy</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="complaint-desc">Details & Description</label>
                <textarea
                  id="complaint-desc"
                  className="form-textarea"
                  placeholder="Provide details about why you suspect counterfeit or have an issue with this seller listing..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>

              <FileUpload
                label="Evidence File (optional)"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                maxSizeMB={5}
                value={evidenceUrl}
                onChange={(url) => setEvidenceUrl(url)}
                type="any"
              />

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFileModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting || !selectedItemInstanceId || !reason || !description}>
                  {submitting ? <Loader size={14} className="spin" /> : 'File Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Complaint Modal (Moderator/Admin Only) */}
      {showReviewModal && selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3>Review Dispute</h3>
              <button className="modal-close" onClick={() => { setShowReviewModal(false); setSelectedComplaint(null); }}>&times;</button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-sm)',
              fontSize: '13px',
              borderBottom: '1px solid var(--border-default)',
              paddingBottom: 'var(--space-md)',
              marginBottom: 'var(--space-md)'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Reason: </span>
                <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>{selectedComplaint.reason}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Serial Number: </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{selectedComplaint.productInstance?.serialNumber}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Description: </span>
                <p style={{ marginTop: '4px', background: 'rgba(10, 14, 26, 0.4)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}>
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
                  <span style={{ color: 'var(--text-muted)' }}>Buyer: </span>
                  <span>{selectedComplaint.buyer?.name} ({selectedComplaint.buyer?.email})</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Seller: </span>
                  <span>{selectedComplaint.seller?.name} ({selectedComplaint.seller?.email})</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleReviewComplaint} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="review-status">Set Status</label>
                <select
                  id="review-status"
                  className="form-select"
                  value={reviewStatus}
                  onChange={e => setReviewStatus(e.target.value as any)}
                  required
                >
                  <option value="pending">Pending Review</option>
                  <option value="under_review">Under Active Investigation</option>
                  <option value="resolved">Resolved (Authentic / Settled)</option>
                  <option value="dismissed">Dismissed (No Action Required)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mod-notes">Moderator / Action Notes</label>
                <textarea
                  id="mod-notes"
                  className="form-textarea"
                  placeholder="Provide resolution details, actions taken against counterfeiters, or verification notes..."
                  value={moderatorNotes}
                  onChange={e => setModeratorNotes(e.target.value)}
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowReviewModal(false); setSelectedComplaint(null); }}
                  disabled={submitting}
                >
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
    </div>
  );
}
