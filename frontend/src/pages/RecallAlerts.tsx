import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import client from '../api/client';

interface RecalledItem {
  id: string;
  productName: string;
  batchId: string;
  reason: string;
  severity: string;
  date: string;
  status: string;
}

const RecallAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<RecalledItem[]>([]);

  useEffect(() => {
    async function loadRecalls() {
      try {
        const res = await client.get('/items/recalls').catch(async () => {
          return await client.get('/items/marketplace');
        });
        if (res.data?.items && Array.isArray(res.data.items)) {
          const recalled = res.data.items
            .filter((it: any) => it.status === 'recalled')
            .map((it: any) => ({
              id: it._id,
              productName: it.product?.name || 'Recalled Product',
              batchId: it.serialNumber || it._id.slice(-6).toUpperCase(),
              reason: (it.journey && it.journey.find((j: any) => j.action === 'recalled')?.location) || 'Quality assurance protocol triggered',
              severity: 'High',
              date: it.updatedAt || it.createdAt || new Date().toISOString(),
              status: 'Active Recall',
            }));
          setAlerts(recalled);
        }
      } catch {
        setAlerts([]);
      }
    }
    loadRecalls();
  }, []);

  return (
    <section className="mt-12">
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <h2 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Recall & Safety Alerts
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Real-time safety disclosures and cryptographic recall notifications broadcast to network holders.
        </p>
      </div>

      <div
        className="glass-card"
        style={{
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          background: 'var(--bg-card)',
        }}
      >
        {alerts.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                No Active Product Recalls on Ledger
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                All registered product batches across verified factories maintain compliant certification with zero active safety advisories.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="min-w-full text-left" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px' }}>Product</th>
                  <th style={{ padding: '8px' }}>Batch / Serial</th>
                  <th style={{ padding: '8px' }}>Reason</th>
                  <th style={{ padding: '8px' }}>Severity</th>
                  <th style={{ padding: '8px' }}>Date</th>
                  <th style={{ padding: '8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{alert.productName}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)' }}>{alert.batchId}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{alert.reason}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', padding: '2px 8px', borderRadius: '999px', fontWeight: 700, fontSize: '0.75rem' }}>
                        {alert.severity}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>{new Date(alert.date).toLocaleDateString()}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#EF4444', fontWeight: 600 }}>
                        <AlertTriangle size={13} /> {alert.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecallAlerts;
