import { useState } from 'react';
import MetricCard from '../../../components/ui/MetricCard';
import ActionButton from '../../../components/ui/ActionButton';
import StatusChip from '../../../components/ui/StatusChip';
import {
  ShieldCheck,
  Server,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  Lock,
  Search,
} from 'lucide-react';

interface MissionLog {
  id: string;
  timestamp: string;
  source: string;
  event: string;
  severity: 'normal' | 'warning' | 'critical';
  details: string;
}

const INITIAL_LOGS: MissionLog[] = [
  { id: 'log-101', timestamp: '2026-07-23 14:52:10', source: 'Node-EU-Central', event: 'Block Verification Complete', severity: 'normal', details: 'Batch #88241 consensus achieved in 12ms' },
  { id: 'log-102', timestamp: '2026-07-23 14:48:33', source: 'AI-Fraud-Sentinel', event: 'Suspicious Serial Flagged', severity: 'warning', details: 'Multiple scan attempts for SKU-7729 from duplicate IPs' },
  { id: 'log-103', timestamp: '2026-07-23 14:35:01', source: 'Auth-Gateway', event: 'Factory Certificate Renewed', severity: 'normal', details: 'LuxeCraft Inc. security keys re-indexed' },
  { id: 'log-104', timestamp: '2026-07-23 14:12:45', source: 'DB-Sync-Engine', event: 'Replication Latency Spike', severity: 'warning', details: 'Secondary replica lag reached 140ms' },
  { id: 'log-105', timestamp: '2026-07-23 13:59:19', source: 'Admin-Audit', event: 'Role Escalation Request', severity: 'critical', details: 'Unverified seller requested factory role access' },
];

export default function AdminMissionView() {
  const [logs, setLogs] = useState<MissionLog[]>(INITIAL_LOGS);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lockdownMode, setLockdownMode] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newLog: MissionLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        source: 'Admin-Health-Check',
        event: 'Manual System Heartbeat',
        severity: 'normal',
        details: 'System diagnostic verified all cluster nodes operational',
      };
      setLogs(prev => [newLog, ...prev]);
      setIsRefreshing(false);
      showNotification('System health re-verified successfully');
    }, 600);
  };

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const toggleLockdown = () => {
    const nextState = !lockdownMode;
    setLockdownMode(nextState);
    showNotification(nextState ? 'EMERGENCY LOCKDOWN ACTIVATED: New registration paused' : 'System Lockdown Disengaged');
  };

  const filteredLogs = logs.filter(l => {
    const matchesSeverity = filterSeverity === 'all' || l.severity === filterSeverity;
    const matchesQuery = searchQuery === '' || 
      l.event.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesQuery;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl, 24px)' }}>
      {/* Toast Notification */}
      {actionSuccess && (
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
          boxShadow: '0 4px 14px rgba(6, 182, 212, 0.2)',
        }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Mission Banner */}
      <div className="admin-card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <ShieldCheck size={26} color="#06b6d4" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                VeriChain Platform Mission & Integrity
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary, #94a3b8)', margin: 0, maxWidth: '780px', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Safeguarding global product authenticity via cryptographic item tracking, anti-counterfeit proofing, and factory-to-consumer trust monitoring.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <ActionButton 
              variant={lockdownMode ? "danger" : "secondary"} 
              size="sm"
              onClick={toggleLockdown}
            >
              <Lock size={15} />
              {lockdownMode ? "Disable Lockdown" : "Emergency Lockdown"}
            </ActionButton>
            <ActionButton 
              variant="primary" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
              Diagnostics
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Mission Metrics Grid */}
      <div className="admin-grid-4">
        <MetricCard
          label="System Health Rate"
          value="99.98%"
          icon={<Activity size={20} color="#10b981" />}
        />
        <MetricCard
          label="Verification Latency"
          value="18 ms"
          icon={<Zap size={20} color="#06b6d4" />}
        />
        <MetricCard
          label="Active Blockchain Nodes"
          value="24 / 24"
          icon={<Server size={20} color="#8b5cf6" />}
        />
        <MetricCard
          label="Fraud Threat Level"
          value={lockdownMode ? "HIGH (LOCK)" : "LOW (SAFE)"}
          icon={<AlertTriangle size={20} color={lockdownMode ? "#ef4444" : "#f59e0b"} />}
        />
      </div>

      {/* Mission Control Activity Log */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">
              <SlidersHorizontal size={18} color="#06b6d4" />
              Mission Real-Time Control & Telemetry Log
            </h3>
            <p className="admin-card-subtitle">Live security signals, blockchain consensus events, and system alerts</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="admin-search-input">
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="admin-select"
              value={filterSeverity}
              onChange={e => setFilterSeverity(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="normal">Normal</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Source Node</th>
                <th>Event</th>
                <th>Severity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8' }}>
                    {log.timestamp}
                  </td>
                  <td style={{ fontWeight: 600, color: '#f8fafc' }}>
                    {log.source}
                  </td>
                  <td>{log.event}</td>
                  <td>
                    <StatusChip tone={log.severity === 'critical' ? 'danger' : log.severity === 'warning' ? 'warning' : 'success'}>
                      {log.severity.toUpperCase()}
                    </StatusChip>
                  </td>
                  <td style={{ color: '#94a3b8' }}>{log.details}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No telemetry log events matching filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
