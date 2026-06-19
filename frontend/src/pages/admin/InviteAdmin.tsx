import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { Mail, User, Shield, Check, Copy, Trash2, ArrowLeft, Loader, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Invitation {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'moderator';
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  createdAt: string;
  invitedBy?: {
    name: string;
    email: string;
  };
}

export default function InviteAdmin() {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Invite form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'moderator'>('moderator');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await client.get('/admin/invitations');
      setInvitations(res.data.invitations);
    } catch (err: any) {
      console.error('Failed to fetch invitations:', err);
      setError('Could not load invitations list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await client.post('/admin/invitations', { name, email, role });
      setSuccess('Invitation created successfully!');
      setName('');
      setEmail('');
      setRole('moderator');
      
      // Add the new invitation to state
      setInvitations(prev => [res.data.invitation, ...prev]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) return;
    
    setError('');
    setSuccess('');
    try {
      await client.delete(`/admin/invitations/${id}`);
      setSuccess('Invitation revoked successfully.');
      setInvitations(prev =>
        prev.map(invite => (invite._id === id ? { ...invite, status: 'expired' } : invite))
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke invitation.');
    }
  };

  const handleCopyLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/accept-invite?token=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedToken(token);
    setTimeout(() => {
      setCopiedToken(null);
    }, 2000);
  };

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate('/dashboard')}
        className="btn btn-ghost"
        style={{ marginBottom: 'var(--space-lg)', padding: '6px 0' }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>System Invitations</h1>
          <p>Invite and manage administrator and moderator credentials</p>
        </div>
        <button className="btn btn-ghost" onClick={fetchInvitations} disabled={loading} title="Refresh Invitations">
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-md)' }}><AlertCircle size={18} /><span>{error}</span></div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 'var(--space-md)' }}><Check size={18} /><span>{success}</span></div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Send Invitation Form */}
        <div className="glass-card">
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="var(--accent-cyan)" /> Invite New User
          </h2>
          
          <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="invite-name">Full Name</label>
              <div className="input-icon-wrapper">
                <User size={16} className="input-icon" />
                <input
                  id="invite-name"
                  type="text"
                  className="form-input input-with-icon"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="invite-email">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="invite-email"
                  type="email"
                  className="form-input input-with-icon"
                  placeholder="jane.doe@verichain.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="invite-role">System Role</label>
              <div className="input-icon-wrapper">
                <Shield size={16} className="input-icon" />
                <select
                  id="invite-role"
                  className="form-select input-with-icon"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  required
                >
                  <option value="moderator">Moderator</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '4px' }} disabled={submitting}>
              {submitting ? <Loader size={16} className="spin" /> : 'Create Invitation'}
            </button>
          </form>
        </div>

        {/* Invitations History / List */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Invitation Logs</h2>
          {loading ? (
            <div className="loading-container" style={{ minHeight: '200px' }}><div className="spinner" /></div>
          ) : invitations.length === 0 ? (
            <div className="empty-state glass-card" style={{ padding: 'var(--space-xl)' }}>
              <Mail size={32} />
              <h3>No Invitations Sent</h3>
              <p>Generate invitations to add moderators or admins to the VeriChain network.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invitee</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Expiration</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((invite) => {
                    const isPending = invite.status === 'pending';
                    const isExpired = new Date(invite.expiresAt) < new Date();
                    const statusText = isPending && isExpired ? 'expired' : invite.status;
                    
                    let statusBadgeClass = 'badge-neutral';
                    if (statusText === 'accepted') statusBadgeClass = 'badge-success';
                    else if (statusText === 'pending') statusBadgeClass = 'badge-info';
                    else if (statusText === 'expired') statusBadgeClass = 'badge-danger';

                    return (
                      <tr key={invite._id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{invite.name}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{invite.email}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-neutral">{invite.role}</span>
                        </td>
                        <td>
                          <span className={`badge ${statusBadgeClass}`}>{statusText}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '13px' }}>
                            {new Date(invite.expiresAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            {isPending && !isExpired && (
                              <>
                                <button
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => handleCopyLink(invite.token)}
                                  title="Copy activation link"
                                  style={{ padding: '6px' }}
                                >
                                  {copiedToken === invite.token ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                                </button>
                                <button
                                  className="btn btn-sm btn-ghost"
                                  onClick={() => handleRevoke(invite._id)}
                                  title="Revoke invitation"
                                  style={{ padding: '6px', color: 'var(--color-danger)' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                            {(!isPending || isExpired) && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
