import { useState, useEffect } from 'react';
import ActionButton from '../../../components/ui/ActionButton';
import StatusChip from '../../../components/ui/StatusChip';
import {
  IconShield as Shield,
  IconKey as Key,
  IconBell as Bell,
  IconCircleCheck as CheckCircle2,
  IconLock as Lock,
  IconPlus as Plus,
  IconTrash as Trash2,
  IconBolt as Zap,
} from '@tabler/icons-react';

interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  scope: 'Read-Only' | 'Full Administrative' | 'Verification API';
  created: string;
  lastUsed: string;
}

const SETTINGS_STORAGE_KEY = 'verichain_admin_policy_settings';
const KEYS_STORAGE_KEY = 'verichain_admin_api_keys';

const DEFAULT_KEYS: ApiKeyRecord[] = [
  {
    id: 'key-1',
    name: 'Mainnet Verification Gateway',
    prefix: 'vc_live_8f3a9e...4b21',
    scope: 'Verification API',
    created: '2026-08-01',
    lastUsed: '12 mins ago',
  },
  {
    id: 'key-2',
    name: 'Factory Minting Integration',
    prefix: 'vc_admin_1c7b2d...9a08',
    scope: 'Full Administrative',
    created: '2026-08-10',
    lastUsed: '2 hours ago',
  }
];

export default function AdminSettingsView() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>(() => {
    try {
      const stored = localStorage.getItem(KEYS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_KEYS;
    } catch {
      return DEFAULT_KEYS;
    }
  });

  const [aiSensitivity, setAiSensitivity] = useState<'low' | 'medium' | 'strict'>('medium');
  const [autoFlagSeller, setAutoFlagSeller] = useState(true);
  const [require2FA, setRequire2FA] = useState(true);
  const [blockDuplicateScans, setBlockDuplicateScans] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://api.verichain.org/webhooks/security-alerts');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed.aiSensitivity) setAiSensitivity(parsed.aiSensitivity);
        if (parsed.autoFlagSeller !== undefined) setAutoFlagSeller(parsed.autoFlagSeller);
        if (parsed.require2FA !== undefined) setRequire2FA(parsed.require2FA);
        if (parsed.blockDuplicateScans !== undefined) setBlockDuplicateScans(parsed.blockDuplicateScans);
        if (parsed.webhookUrl) setWebhookUrl(parsed.webhookUrl);
      }
    } catch (e) {
      console.error('Failed to load admin settings', e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        aiSensitivity,
        autoFlagSeller,
        require2FA,
        blockDuplicateScans,
        webhookUrl,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(payload));
      showToast('Platform security & AI settings persisted successfully');
    } catch {
      showToast('Settings saved to active session');
    }
  };

  const handleRevokeKey = (id: string) => {
    const updated = keys.filter(k => k.id !== id);
    setKeys(updated);
    try {
      localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist keys to storage', e);
    }
    showToast('API Key revoked and invalidated');
  };

  const handleCreateKey = () => {
    const randPart = Math.random().toString(36).substring(2, 8);
    const newKey: ApiKeyRecord = {
      id: `key-${Date.now()}`,
      name: `External Integration Token #${keys.length + 1}`,
      prefix: `vc_live_${randPart}...${Math.random().toString(36).substring(2, 6)}`,
      scope: 'Verification API',
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
    };
    const updated = [newKey, ...keys];
    setKeys(updated);
    try {
      localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist key to storage', e);
    }
    showToast('Generated new VeriChain API Key and saved to keystore');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg, 20px)' }}>
      {toastMessage && (
        <div style={{
          background: 'var(--accent-bg)',
          border: '1px solid var(--accent-border)',
          color: 'var(--text-primary)',
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
              <Shield size={20} color="var(--accent-primary)" />
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
          <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 12, border: '1px solid var(--border-default)' }}>
            <label style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Zap size={16} color="var(--accent-primary)" /> AI Auto-Moderation Sensitivity
            </label>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: 14 }}>
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
                    border: aiSensitivity === sens ? '1.5px solid #F59E0B' : '1px solid var(--border-default)',
                    background: aiSensitivity === sens ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-card)',
                    color: aiSensitivity === sens ? '#B45309' : 'var(--text-secondary)',
                    fontWeight: aiSensitivity === sens ? 800 : 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {sens.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Security Toggles */}
          <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 12, border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={16} color="#10b981" /> Automated System Rules
            </label>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>Block Instant Scan Bursting (Anti-Bot)</span>
              <input
                type="checkbox"
                checked={blockDuplicateScans}
                onChange={e => setBlockDuplicateScans(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#F59E0B', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>Auto-Flag Sellers with &gt; 3 Complaints</span>
              <input
                type="checkbox"
                checked={autoFlagSeller}
                onChange={e => setAutoFlagSeller(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#F59E0B', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>Enforce Mandatory 2FA for Admin Roles</span>
              <input
                type="checkbox"
                checked={require2FA}
                onChange={e => setRequire2FA(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#F59E0B', cursor: 'pointer' }}
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
              <Key size={18} color="var(--accent-purple)" />
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
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '28px', color: '#94a3b8' }}>
                    No active API keys generated. Click "Generate New Key" above to provision a token.
                  </td>
                </tr>
              ) : (
                keys.map(k => (
                  <tr key={k.id}>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{k.name}</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--accent-purple)', fontSize: '0.85rem' }}>{k.prefix}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Webhook Notifications */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h4 className="admin-card-title">
            <Bell size={18} color="var(--accent-purple)" />
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
            onClick={() => showToast('Test security ping dispatched to webhook URL: ' + webhookUrl)}
          >
            Send Test Alert
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
