import { Boxes, CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';

const BATCHES = [
  { id: 'BTH-0091', product: 'AirMax Pro Sneaker',   total: 500, completed: 420, status: 'In Progress', due: '2026-07-28', line: 'Line 2' },
  { id: 'BTH-0092', product: 'Heritage Leather Bag', total: 200, completed: 200, status: 'Completed',   due: '2026-07-22', line: 'Line 1' },
  { id: 'BTH-0093', product: 'ChromePlus Watch',     total: 150, completed: 30,  status: 'In Progress', due: '2026-08-01', line: 'Line 3' },
  { id: 'BTH-0094', product: 'NebulaX Backpack',     total: 300, completed: 0,   status: 'Queued',      due: '2026-08-05', line: 'Line 1' },
  { id: 'BTH-0095', product: 'AlphaCore Hoodie',     total: 600, completed: 600, status: 'Completed',   due: '2026-07-20', line: 'Line 4' },
  { id: 'BTH-0096', product: 'StealthPod Earbuds',   total: 250, completed: 110, status: 'In Progress', due: '2026-07-30', line: 'Line 2' },
  { id: 'BTH-0097', product: 'PrimeRun Shorts',      total: 400, completed: 0,   status: 'Queued',      due: '2026-08-10', line: 'Line 3' },
  { id: 'BTH-0098', product: 'UltraFit Cap',         total: 350, completed: 350, status: 'Completed',   due: '2026-07-18', line: 'Line 1' },
];

const STATS = [
  { label: 'Active Batches',  value: '8',   icon: Boxes,        color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', trend: '3 lines running' },
  { label: 'Completed Today', value: '3',   icon: CheckCircle,  color: '#10b981', bg: 'rgba(16,185,129,0.12)', trend: '+1 vs yesterday'  },
  { label: 'Units Queued',    value: '700', icon: Clock,        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', trend: '2 batches'        },
  { label: 'Defect Rate',     value: '0.3%',icon: AlertCircle,  color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', trend: '↓ 0.1% this wk'   },
];

const statusBadge: Record<string, string> = {
  'Completed':   'fd-badge fd-badge-green',
  'In Progress': 'fd-badge fd-badge-blue',
  'Queued':      'fd-badge fd-badge-gray',
  'On Hold':     'fd-badge fd-badge-amber',
};

export default function ProductionView() {
  return (
    <div>
      <div className="fd-stats-grid">
        {STATS.map(s => (
          <div className="fd-stat-card" key={s.label}>
            <div className="fd-stat-icon" style={{ background: s.bg }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <p className="fd-stat-label">{s.label}</p>
              <p className="fd-stat-value">{s.value}</p>
              <span className="fd-stat-trend">{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="fd-section-hd">
        <h2><Loader size={16} color="#8b5cf6" /> Production Batches</h2>
      </div>

      <div className="fd-table-wrap">
        <table className="fd-table">
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Product</th>
              <th>Line</th>
              <th>Progress</th>
              <th>Units</th>
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {BATCHES.map(b => {
              const pct = Math.round((b.completed / b.total) * 100);
              return (
                <tr key={b.id}>
                  <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>{b.id}</td>
                  <td>{b.product}</td>
                  <td><span className="fd-badge fd-badge-purple">{b.line}</span></td>
                  <td style={{ minWidth: 160 }}>
                    <div className="fd-progress-wrap">
                      <div className="fd-progress-track">
                        <div className="fd-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="fd-progress-pct">{pct}%</span>
                    </div>
                  </td>
                  <td>{b.completed} / {b.total}</td>
                  <td><span className={statusBadge[b.status] ?? 'fd-badge fd-badge-gray'}>{b.status}</span></td>
                  <td>{b.due}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
