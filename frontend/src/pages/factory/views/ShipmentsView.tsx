import { useState } from 'react';
import { Truck, Package, Clock, MapPin } from 'lucide-react';

interface ShipmentItem {
  id: string;
  product: string;
  dest: string;
  units: number;
  carrier: string;
  eta: string;
  status: string;
}

const statusBadge: Record<string, string> = {
  'In Transit':  'fd-badge fd-badge-blue',
  'Delivered':   'fd-badge fd-badge-green',
  'Processing':  'fd-badge fd-badge-amber',
  'Delayed':     'fd-badge fd-badge-red',
};

export default function ShipmentsView() {
  const [shipments] = useState<ShipmentItem[]>([]);

  const stats = [
    { label: 'In Transit',   value: shipments.filter(s => s.status === 'In Transit').length.toString(), icon: Truck,   color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
    { label: 'Delivered',    value: shipments.filter(s => s.status === 'Delivered').length.toString(),  icon: Package, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Processing',   value: shipments.filter(s => s.status === 'Processing').length.toString(), icon: Clock,   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
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

      <div className="fd-two-col">
        {/* Shipments Table */}
        <div style={{ flex: 1 }}>
          <div className="fd-section-hd">
            <h2><Truck size={16} color="#06b6d4" /> Active Shipments</h2>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{shipments.length} shipments</span>
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
                {shipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                      No active logistics shipments recorded.
                    </td>
                  </tr>
                ) : (
                  shipments.map(s => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
