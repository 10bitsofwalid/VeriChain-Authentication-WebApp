import { useState } from 'react';
import { Boxes, CheckCircle, Clock, Loader } from 'lucide-react';

interface BatchItem {
  id: string;
  product: string;
  line: string;
  completed: number;
  total: number;
  status: string;
  due: string;
}

const statusBadge: Record<string, string> = {
  'Completed':   'fd-badge fd-badge-green',
  'In Progress': 'fd-badge fd-badge-blue',
  'Queued':      'fd-badge fd-badge-gray',
  'On Hold':     'fd-badge fd-badge-amber',
};

export default function ProductionView() {
  const [batches] = useState<BatchItem[]>([]);

  const stats = [
    { label: 'Active Batches',  value: batches.length.toString(), icon: Boxes,        color: 'var(--accent-purple)', bg: 'var(--accent-bg)' },
    { label: 'Completed Today', value: '0',                       icon: CheckCircle,  color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Units Queued',    value: '0',                       icon: Clock,        color: '#F5A623', bg: 'rgba(245, 166, 35, 0.15)' },
  ];

  return (
    <div>
      <div className="fd-stats-grid">
        {stats.map(s => (
          <div className="fd-stat-card" key={s.label}>
            <div className="fd-stat-icon" style={{ background: s.bg }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <p className="fd-stat-label">{s.label}</p>
              <p className="fd-stat-value">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="fd-section-hd">
        <h2><Loader size={16} color="var(--accent-purple)" /> Production Batches</h2>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{batches.length} batches</span>
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
            {batches.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  No active manufacturing batches in progress.
                </td>
              </tr>
            ) : (
              batches.map(b => {
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
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
