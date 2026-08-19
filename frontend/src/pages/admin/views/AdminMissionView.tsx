import { useState, useEffect } from 'react';
import MetricCard from '../../../components/ui/MetricCard';
import ActionButton from '../../../components/ui/ActionButton';
import StatusChip from '../../../components/ui/StatusChip';
import client from '../../../api/client';
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

export default function AdminMissionView() {
  const [logs, setLogs] = useState<MissionLog[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lockdownMode, setLockdownMode] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [liveStats, setLiveStats] = useState<{ totalItems: number; verifiedProducts: number; activeRecalls: number; verifiedPartners: number }>({
    totalItems: 0,
    verifiedProducts: 0,
    activeRecalls: 0,
    verifiedPartners: 0,
  });

  const fetchLogs = async () => {
    try {
      const [auditRes, statsRes] = await Promise.allSettled([
        client.get('/admin/audit-logs'),
        client.get('/products/stats'),
      ]);

      if (auditRes.status === 'fulfilled' && auditRes.value.data?.logs && Array.isArray(auditRes.value.data.logs)) {
        const mapped: MissionLog[] = auditRes.value.data.logs.map((l: any) => ({
          id: l._id,
          timestamp: new Date(l.timestamp || Date.now()).toISOString().replace('T', ' ').substring(0, 19),
          source: l.actor?.name || 'System Gateway',
          event: l.action || 'Audit Event',
          severity: l.action?.toLowerCase().includes('reject') || l.action?.toLowerCase().includes('delete') ? 'warning' : 'normal',
          details: l.details || '',
        }));
        setLogs(mapped);
      } else {
        setLogs([]);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.stats) {
        setLiveStats(statsRes.value.data.stats);
      }
    } catch {
      setLogs([]);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLogs();
    setIsRefreshing(false);
    showNotification('System health and audit telemetry refreshed');
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
          background: 'var(--accent-bg)',
          border: '1px solid var(--accent-border)',
          color: 'var(--text-primary)',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md, 8px)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Mission Banner */}
      <div className="admin-card" style={{ background: 'linear-gradient(135deg, #16233B 0%, #0B0F19 100%)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <ShieldCheck size={26} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                VeriChain Platform Mission & Integrity
              </h2>
            </div>
            <p style={{ color: '#CBD5E1', margin: 0, maxWidth: '780px', fontSize: '0.9rem', lineHeight: '1.5' }}>
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
          label="System Health Status"
          value="Operational"
          trend={`${logs.length} Logged Events`}
          icon={<Activity size={20} color="#10b981" />}
        />
        <MetricCard
          label="Decentralized Ledger Items"
          value={liveStats.totalItems.toString()}
          trend="Live Serialized Units"
          icon={<Zap size={20} color="var(--accent-primary)" />}
        />
        <MetricCard
          label="Verified Products"
          value={liveStats.verifiedProducts.toString()}
          trend={`${liveStats.verifiedPartners} Verified Partners`}
          icon={<Server size={20} color="var(--accent-purple)" />}
        />
        <MetricCard
          label="Fraud & Recall Status"
          value={lockdownMode ? "HIGH (LOCK)" : liveStats.activeRecalls > 0 ? `${liveStats.activeRecalls} Active Recalls` : "SECURE"}
          icon={<AlertTriangle size={20} color={lockdownMode ? "#ef4444" : liveStats.activeRecalls > 0 ? "#f59e0b" : "#10b981"} />}
        />
      </div>

      {/* Mission Control Activity Log */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">
              <SlidersHorizontal size={18} color="var(--accent-primary)" />
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
                <th>Source / Actor</th>
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
                    No telemetry log events recorded.
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
