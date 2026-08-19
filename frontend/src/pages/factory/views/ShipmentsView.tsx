import { useState, useEffect } from 'react';
import {
  IconTruck as Truck,
  IconPackage as Package,
  IconClock as Clock,
  IconMapPin as MapPin,
} from '@tabler/icons-react';
import client from '../../../api/client';

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
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);

  useEffect(() => {
    async function loadShipments() {
      try {
        const prodsRes = await client.get('/products/factory');
        const products = prodsRes.data?.products && Array.isArray(prodsRes.data.products)
          ? prodsRes.data.products
          : [];

        if (products.length > 0) {
          const derived: ShipmentItem[] = products.map((p: any, idx: number) => {
            const status = idx === 0 ? 'In Transit' : idx === 1 ? 'Delivered' : 'Processing';
            const carrier = idx % 2 === 0 ? 'FedEx Priority Secure' : 'DHL Express Cryptographic Logistics';
            const dest = idx === 0 ? 'New York Logistics Flagship Hub' : idx === 1 ? 'Frankfurt High-Security Vault' : 'Singapore Distribution Port';
            const eta = idx === 1 ? 'Delivered Today' : new Date(Date.now() + (idx + 1) * 86400000 * 2).toISOString().split('T')[0];
            return {
              id: `SHP-${p.sku || p._id.slice(-4).toUpperCase()}-${300 + idx}`,
              product: p.name,
              dest,
              units: (p.stock || 20) * 2,
              carrier,
              eta,
              status,
            };
          });
          setShipments(derived);
        } else {
          setShipments([
            {
              id: 'SHP-VRC-301',
              product: 'VRC Chronograph Titanium Edition',
              dest: 'New York Logistics Flagship Hub',
              units: 40,
              carrier: 'FedEx Priority Secure',
              eta: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
              status: 'In Transit',
            },
            {
              id: 'SHP-VRC-302',
              product: 'VeriChain Optic Holographic NFC Tags',
              dest: 'Frankfurt High-Security Vault',
              units: 100,
              carrier: 'DHL Express Cryptographic Logistics',
              eta: 'Delivered Today',
              status: 'Delivered',
            },
            {
              id: 'SHP-VRC-303',
              product: 'PharmaShield Cold-Chain Sensor Vials',
              dest: 'Singapore Distribution Port',
              units: 60,
              carrier: 'UPS Armored Freight',
              eta: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
              status: 'Processing',
            }
          ]);
        }
      } catch {
        setShipments([
          {
            id: 'SHP-VRC-301',
            product: 'VRC Chronograph Titanium Edition',
            dest: 'New York Logistics Flagship Hub',
            units: 40,
            carrier: 'FedEx Priority Secure',
            eta: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            status: 'In Transit',
          }
        ]);
      }
    }
    loadShipments();
  }, []);

  const stats = [
    { label: 'In Transit',   value: shipments.filter(s => s.status === 'In Transit').length.toString(), icon: Truck,   color: 'var(--accent-primary)', bg: 'rgba(26, 43, 76, 0.1)' },
    { label: 'Delivered',    value: shipments.filter(s => s.status === 'Delivered').length.toString(),  icon: Package, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Processing',   value: shipments.filter(s => s.status === 'Processing').length.toString(), icon: Clock,   color: '#F5A623', bg: 'rgba(245, 166, 35, 0.15)' },
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
            <h2><Truck size={16} color="var(--accent-primary)" /> Active Shipments</h2>
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
