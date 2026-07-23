import { useState } from 'react';
import ActionButton from '../../../components/ui/ActionButton';
import StatusChip from '../../../components/ui/StatusChip';
import {
  Shield,
  Key,
  Bell,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react';

interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  scope: 'Read-Only' | 'Full Administrative' | 'Verification API';
  created: string;
  lastUsed: string;
}

const INITIAL_API_KEYS: ApiKeyRecord[] = [
  { id: 'key-1', name: 'Mobile Scanning App Gateway', prefix: 'vc_live_9a82...', scope: 'Verification API', created: '2026-01-15', lastUsed: 'Just now' },
  { id: 'key-2', name: 'Factory ERP Sync Pipeline', prefix: 'vc_live_3f11...', scope: 'Full Administrative', created: '2026-03-02', lastUsed: '5 mins ago' },
  { id: 'key-3', name: 'Auditor External Integration', prefix: 'vc_live_0012...', scope: 'Read-Only', created: '2026-05-10', lastUsed: 'Yesterday' },
];

export default function AdminSettingsView() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>(INITIAL_API_KEYS);
  const [aiSensitivity, setAiSensitivity] = useState<'low' | 'medium' | 'strict'>('medium');
  const [autoFlagSeller, setAutoFlagSeller] = useState(true);
  const [require2FA, setRequire2FA] = useState(true);
  const [blockDuplicateScans, setBlockDuplicateScans] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://api.verichain.org/webhooks/security-alerts');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Platform security & AI settings updated successfully');
  };

  const handleRevokeKey = (id: string) => {
    setKeys(prev => prev.filter(k => k.id !== id));
    showToast('API Key revoked');
  };

  const handleCreateKey = () => {
    const newKey: ApiKeyRecord = {
      id: `key-${Date.now()}`,
      name: 'New Integration Secret',
      prefix: `vc_live_${Math.random().toString(36).substring(2, 8)}...`,
      scope: 'Verification API',
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
    };
    setKeys(prev => [newKey, ...prev]);
    showToast('Generated new VeriChain API Key');
  };

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

      {/* Security & AI Parameters */}
      <form onSubmit={handleSaveSettings} className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">
              <Shield size={20} color="#06b6d4" />
              Platform Security & AI Fraud Controls
            </h3>
            <p className="admin-card-subtitle">Configure automated threat mitigation policies and machine learning thresholds</p>
          </div>
          <ActionButton variant="primary" size="sm" type="submit">
            Save Policy Changes
          </ActionButton>
        </div>

        <div className="admin-grid-2" style={{ marginTop: 12 }}>
          {/* AI Moderation Sensitivity */}
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <label style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Zap size={16} color="#06b6d4" /> AI Auto-Moderation Sensitivity
            </label>
            <p style={{ color: '#94a3b8', fontSize: '0.825rem', marginBottom: 14 }}>
              Controls automatic flagging threshold for unverified product templates and duplicate serial patterns.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['low', 'medium', 'strict'] as const).map(sens => (
                <button
                  key={sens}
                  type="button"
                  onClick={() => setAiSensitivity(sens)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: aiSensitivity === sens ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                    background: aiSensitivity === sens ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                    color: aiSensitivity === sens ? '#38bdf8' : '#94a3b8',
                    fontWeight: aiSensitivity === sens ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  {sens.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Security Toggles */}
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={16} color="#10b981" /> Automated System Rules
            </label>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Block Instant Scan Bursting (Anti-Bot)</span>
              <input
                type="checkbox"
                checked={blockDuplicateScans}
                onChange={e => setBlockDuplicateScans(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#06b6d4', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Auto-Flag Sellers with &gt; 3 Complaints</span>
              <input
                type="checkbox"
                checked={autoFlagSeller}
                onChange={e => setAutoFlagSeller(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#06b6d4', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Enforce Mandatory 2FA for Admin Roles</span>
              <input
                type="checkbox"
                checked={require2FA}
                onChange={e => setRequire2FA(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#06b6d4', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </form>

      {/* API Keys Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">
              <Key size={18} color="#f59e0b" />
              API Access Keys & Integrations
            </h3>
            <p className="admin-card-subtitle">Manage programmatic REST & GraphQL API keys for external factory integrations</p>
          </div>
          <ActionButton variant="secondary" size="sm" onClick={handleCreateKey}>
            <Plus size={15} /> Generate New Key
          </ActionButton>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Key Name</th>
                <th>Token Prefix</th>
                <th>Access Scope</th>
                <th>Created Date</th>
                <th>Last Active</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.id}>
                  <td style={{ fontWeight: 600, color: '#f8fafc' }}>{k.name}</td>
                  <td style={{ fontFamily: 'monospace', color: '#06b6d4', fontSize: '0.85rem' }}>{k.prefix}</td>
                  <td>
                    <StatusChip tone={k.scope === 'Full Administrative' ? 'danger' : 'info'}>
                      {k.scope}
                    </StatusChip>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.825rem' }}>{k.created}</td>
                  <td style={{ color: '#cbd5e1', fontSize: '0.825rem' }}>{k.lastUsed}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => handleRevokeKey(k.id)}
                        style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}
                      >
                        <Trash2 size={15} /> Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Webhook Notifications */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h4 className="admin-card-title">
            <Bell size={18} color="#8b5cf6" />
            Security Notification Webhook Dispatcher
          </h4>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            className="admin-select"
            style={{ flex: 1 }}
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
          />
          <ActionButton
            variant="secondary"
            size="sm"
            onClick={() => showToast('Test ping dispatched to webhook URL')}
          >
            Send Test Alert
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
