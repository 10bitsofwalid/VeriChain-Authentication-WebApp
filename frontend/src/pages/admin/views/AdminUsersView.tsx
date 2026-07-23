import { useState } from 'react';
import ActionButton from '../../../components/ui/ActionButton';
import StatusChip from '../../../components/ui/StatusChip';
import {
  Users,
  Search,
  CheckCircle,
  UserCheck,
  UserX,
  X,
  Mail,
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

const INITIAL_USERS: UserRecord[] = [
  { id: 'usr-001', name: 'Aura Manufacturing Co.', email: 'ops@auracraft.io', role: 'factory', verified: true, status: 'active', joinedDate: '2025-11-12', productsRegistered: 412 },
  { id: 'usr-002', name: 'Velvet Vault Goods', email: 'support@velvetvault.com', role: 'seller', verified: true, status: 'active', joinedDate: '2026-01-05', salesCount: 1290 },
  { id: 'usr-003', name: 'Elena Rostova', email: 'elena.rostova@gmail.com', role: 'buyer', verified: true, status: 'active', joinedDate: '2026-03-22' },
  { id: 'usr-004', name: 'Apex Authentics Hub', email: 'contact@apexauthentics.net', role: 'seller', verified: false, status: 'pending', joinedDate: '2026-07-01', salesCount: 14 },
  { id: 'usr-005', name: 'Marcus Vance', email: 'marcus.v@verichain.org', role: 'moderator', verified: true, status: 'active', joinedDate: '2025-08-19' },
  { id: 'usr-006', name: 'Titan Chrono Factory', email: 'admin@titanchrono.ch', role: 'factory', verified: true, status: 'active', joinedDate: '2025-09-30', productsRegistered: 890 },
  { id: 'usr-007', name: 'Shadow Reseller X', email: 'anon9912@protonmail.com', role: 'seller', verified: false, status: 'suspended', joinedDate: '2026-06-18', salesCount: 3 },
];

export default function AdminUsersView() {
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUserModal, setSelectedUserModal] = useState<UserRecord | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleVerify = (id: string) => {
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
              {filteredUsers.map(u => (
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
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    No users match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail & Role Edit Modal */}
      {selectedUserModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Users size={22} color="#06b6d4" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>User Account Inspector</h3>
              </div>
              <button 
                onClick={() => setSelectedUserModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>{selectedUserModal.name}</div>
                <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem' }}>
                  <Mail size={14} /> {selectedUserModal.email}
                </div>
              </div>

              <div className="admin-grid-2">
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Account Role</label>
                  <select
                    className="admin-select"
                    style={{ width: '100%' }}
                    value={selectedUserModal.role}
                    onChange={e => handleChangeRole(selectedUserModal.id, e.target.value as UserRecord['role'])}
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="factory">Factory</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Account Status</label>
                  <StatusChip tone={selectedUserModal.status === 'active' ? 'success' : 'danger'}>
                    {selectedUserModal.status.toUpperCase()}
                  </StatusChip>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <ActionButton
                  variant={selectedUserModal.verified ? "ghost" : "primary"}
                  size="sm"
                  style={{ flex: 1 }}
                  onClick={() => handleToggleVerify(selectedUserModal.id)}
                >
                  {selectedUserModal.verified ? 'Revoke Verification' : 'Grant Verification'}
                </ActionButton>
                <ActionButton
                  variant={selectedUserModal.status === 'suspended' ? "secondary" : "danger"}
                  size="sm"
                  style={{ flex: 1 }}
                  onClick={() => handleToggleStatus(selectedUserModal.id)}
                >
                  {selectedUserModal.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
