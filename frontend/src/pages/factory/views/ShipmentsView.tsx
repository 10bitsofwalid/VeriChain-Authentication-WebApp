import { Truck, Package, CheckCircle, Clock, MapPin } from 'lucide-react';

const SHIPMENTS = [
  { id: 'SHP-8801', product: 'AirMax Pro Sneaker',   dest: 'NovaTrend, NYC',          units: 120, status: 'In Transit',  eta: '2026-07-25', carrier: 'FedEx' },
  { id: 'SHP-8802', product: 'Heritage Leather Bag', dest: 'StyleVault, London',       units: 60,  status: 'Delivered',   eta: '2026-07-21', carrier: 'DHL'   },
  { id: 'SHP-8803', product: 'ChromePlus Watch',     dest: 'PeakGear, Paris',          units: 40,  status: 'Processing',  eta: '2026-07-29', carrier: 'UPS'   },
  { id: 'SHP-8804', product: 'NebulaX Backpack',     dest: 'UrbanEdge, Toronto',       units: 95,  status: 'In Transit',  eta: '2026-07-26', carrier: 'FedEx' },
  { id: 'SHP-8805', product: 'AlphaCore Hoodie',     dest: 'LuxeLine, Berlin',         units: 200, status: 'Delivered',   eta: '2026-07-20', carrier: 'DHL'   },
  { id: 'SHP-8806', product: 'PrimeRun Shorts',      dest: 'SportZone, Dubai',         units: 150, status: 'Processing',  eta: '2026-08-02', carrier: 'Aramex'},
  { id: 'SHP-8807', product: 'StealthPod Earbuds',   dest: 'TechDen, Singapore',       units: 74,  status: 'In Transit',  eta: '2026-07-28', carrier: 'DHL'   },
  { id: 'SHP-8808', product: 'UltraFit Cap',         dest: 'CapZone, Sydney',          units: 350, status: 'Delivered',   eta: '2026-07-18', carrier: 'UPS'   },
];

const STATS = [
  { label: 'In Transit',   value: '11', icon: Truck,        color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  trend: '4 arriving today'  },
  { label: 'Delivered',    value: '38', icon: CheckCircle,  color: '#10b981', bg: 'rgba(16,185,129,0.12)', trend: 'This month'        },
  { label: 'Processing',   value: '5',  icon: Clock,        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', trend: 'Awaiting dispatch' },
  { label: 'Total Units',  value: '1,089', icon: Package,   color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', trend: 'Across all routes' },
];

const TIMELINE = [
  { label: 'AirMax Pro — FedEx pickup',     time: '2026-07-23 08:12', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)'  },
  { label: 'StealthPod — Cleared customs',  time: '2026-07-23 06:40', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  { label: 'AlphaCore Hoodie — Delivered',  time: '2026-07-22 17:55', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { label: 'ChromePlus Watch — Processing', time: '2026-07-22 14:30', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { label: 'UltraFit Cap — Delivered',      time: '2026-07-21 11:10', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
];

const statusBadge: Record<string, string> = {
  'In Transit':  'fd-badge fd-badge-blue',
  'Delivered':   'fd-badge fd-badge-green',
  'Processing':  'fd-badge fd-badge-amber',
  'Delayed':     'fd-badge fd-badge-red',
};

export default function ShipmentsView() {
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

      <div className="fd-two-col">
        {/* Shipments Table */}
        <div>
          <div className="fd-section-hd">
            <h2><Truck size={16} color="#06b6d4" /> Active Shipments</h2>
          </div>
          <div className="fd-table-wrap">
            <table className="fd-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Destination</th>
                  <th>Units</th>
                  <th>Carrier</th>
                  <th>ETA</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {SHIPMENTS.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>{s.id}</td>
                    <td>{s.product}</td>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      {s.dest}
                    </td>
                    <td style={{ fontWeight: 700 }}>{s.units}</td>
                    <td>{s.carrier}</td>
                    <td>{s.eta}</td>
                    <td><span className={statusBadge[s.status] ?? 'fd-badge fd-badge-gray'}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Timeline */}
        <div>
          <div className="fd-section-hd">
            <h2><Clock size={16} color="#f59e0b" /> Recent Activity</h2>
          </div>
          <div className="fd-card">
            <div className="fd-timeline">
              {TIMELINE.map((t, i) => (
                <div className="fd-timeline-item" key={i}>
                  <div className="fd-timeline-dot" style={{ background: t.bg }}>
                    <Truck size={14} color={t.color} />
                  </div>
                  <div className="fd-timeline-body">
                    <strong>{t.label}</strong>
                    <span>{t.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
