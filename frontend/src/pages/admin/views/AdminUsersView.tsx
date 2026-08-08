import { useState, useEffect } from 'react';
import ActionButton from '../../../components/ui/ActionButton';
import StatusChip from '../../../components/ui/StatusChip';
import client from '../../../api/client';
import {
  Search,
  CheckCircle,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'factory' | 'seller' | 'buyer';
  verified: boolean;
  status: 'active' | 'suspended' | 'pending';
  joinedDate: string;
  productsRegistered?: number;
  salesCount?: number;
}

export default function AdminUsersView() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUserModal, setSelectedUserModal] = useState<UserRecord | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await client.get('/users');
      if (Array.isArray(res.data)) {
        const mapped: UserRecord[] = res.data.map((u: any) => ({
          id: u._id,
          name: u.name || 'Anonymous User',
          email: u.email,
          role: u.role || 'buyer',
          verified: Boolean(u.verifiedStatus === 'verified' || u.role === 'admin' || u.role === 'buyer'),
          status: (u.accountStatus || 'active') as any,
          joinedDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          productsRegistered: 0,
          salesCount: 0,
        }));
        setUsers(mapped);
      } else {
        setUsers([]);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleVerify = async (id: string) => {
    try {
      const target = users.find(u => u.id === id);
      if (target && !target.verified) {
        await client.put(`/admin/factories/${id}/verify`).catch(() => {});
      }
    } catch {}

    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextState = !u.verified;
        showToast(`User ${u.name} verification status set to ${nextState ? 'VERIFIED' : 'UNVERIFIED'}`);
        return { ...u, verified: nextState };
      }
      return u;
    }));
    if (selectedUserModal && selectedUserModal.id === id) {
      setSelectedUserModal(prev => prev ? { ...prev, verified: !prev.verified } : null);
    }
  };

  const handleToggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'suspended' ? 'active' : 'suspended';
        showToast(`User ${u.name} status updated to ${nextStatus.toUpperCase()}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    if (selectedUserModal && selectedUserModal.id === id) {
      setSelectedUserModal(prev => prev ? { ...prev, status: prev.status === 'suspended' ? 'active' : 'suspended' } : null);
    }
  };

  const handleChangeRole = (id: string, newRole: UserRecord['role']) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    showToast(`Role updated for user`);
    if (selectedUserModal && selectedUserModal.id === id) {
      setSelectedUserModal(prev => prev ? { ...prev, role: newRole } : null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'verified' && u.verified) || 
      (selectedStatus === 'unverified' && !u.verified) ||
      (selectedStatus === u.status);
    const matchesSearch = searchQuery === '' ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg, 20px)' }}>
      {/* Toast Notification */}
      {notification && (
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
          <span>{notification}</span>
        </div>
      )}

      {/* Toolbar & Filters */}
      <div className="admin-card">
        <div className="admin-toolbar" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="admin-search-input">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="admin-select"
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="factory">Factory</option>
              <option value="seller">Seller</option>
              <option value="buyer">Buyer</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
            <select
              className="admin-select"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Showing <strong>{filteredUsers.length}</strong> of {users.length} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User / Identity</th>
                <th>Role</th>
                <th>Verification</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    Loading registered network users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    No registered users found matching query filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3))',
                          border: '1px solid rgba(6, 182, 212, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: '#ffffff'
                        }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{u.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusChip tone={u.role === 'admin' ? 'danger' : u.role === 'moderator' ? 'warning' : u.role === 'factory' ? 'info' : 'neutral'}>
                        {u.role.toUpperCase()}
                      </StatusChip>
                    </td>
                    <td>
                      {u.verified ? (
                        <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.825rem', fontWeight: 600 }}>
                          <UserCheck size={16} /> Verified
                        </span>
                      ) : (
                        <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.825rem' }}>
                          <UserX size={16} /> Unverified
                        </span>
                      )}
                    </td>
                    <td>
                      <StatusChip tone={u.status === 'active' ? 'success' : u.status === 'suspended' ? 'danger' : 'warning'}>
                        {u.status.toUpperCase()}
                      </StatusChip>
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{u.joinedDate}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <ActionButton
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedUserModal(u)}
                        >
                          Inspect
                        </ActionButton>
                        <ActionButton
                          variant={u.verified ? "ghost" : "primary"}
                          size="sm"
                          onClick={() => handleToggleVerify(u.id)}
                        >
                          {u.verified ? 'Revoke' : 'Verify'}
                        </ActionButton>
                        <ActionButton
                          variant={u.status === 'suspended' ? "secondary" : "danger"}
                          size="sm"
                          onClick={() => handleToggleStatus(u.id)}
                        >
                          {u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
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

      {/* User Details / Governance Modal */}
      {selectedUserModal && (
        <div className="recall-modal-backdrop" onClick={() => setSelectedUserModal(null)}>
          <div className="recall-modal" onClick={e => e.stopPropagation()}>
            <div className="recall-modal-header">
              <h3>User Identity & Governance — {selectedUserModal.name}</h3>
              <button
                onClick={() => setSelectedUserModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="recall-modal-body">
              <div className="detail-info-grid">
                <div className="detail-info-card">
                  <div className="detail-info-label">User ID</div>
                  <div className="detail-info-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {selectedUserModal.id}
                  </div>
                </div>
                <div className="detail-info-card">
                  <div className="detail-info-label">Email Address</div>
                  <div className="detail-info-value">{selectedUserModal.email}</div>
                </div>
                <div className="detail-info-card">
                  <div className="detail-info-label">System Role</div>
                  <div className="detail-info-value" style={{ textTransform: 'uppercase', color: '#38bdf8' }}>
                    {selectedUserModal.role}
                  </div>
                </div>
                <div className="detail-info-card">
                  <div className="detail-info-label">Account Status</div>
                  <div className="detail-info-value" style={{ textTransform: 'uppercase' }}>
                    {selectedUserModal.status}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <label className="form-label">Role Escalation / Modification</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {(['buyer', 'seller', 'factory', 'moderator', 'admin'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      className={`btn btn-ghost ${selectedUserModal.role === r ? 'active' : ''}`}
                      onClick={() => handleChangeRole(selectedUserModal.id, r)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        borderRadius: 6,
                        border: selectedUserModal.role === r ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.08)',
                        background: selectedUserModal.role === r ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                        color: selectedUserModal.role === r ? '#38bdf8' : '#94a3b8',
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="recall-modal-footer">
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => setSelectedUserModal(null)}
              >
                Close
              </ActionButton>
              <ActionButton
                variant={selectedUserModal.verified ? "ghost" : "primary"}
                size="sm"
                onClick={() => handleToggleVerify(selectedUserModal.id)}
              >
                {selectedUserModal.verified ? 'Revoke Verification' : 'Verify Account'}
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
