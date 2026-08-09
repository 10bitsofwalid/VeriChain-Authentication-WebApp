import React, { useEffect, useState } from 'react';
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
            .filter((it: any) => it.status === 'recalled' || res.config?.url?.includes('recalls'))
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
      <h2 className="text-2xl font-semibold mb-4">Recall Alerts</h2>
      <div className="glass-card p-4 overflow-x-auto">
        {alerts.length === 0 ? (
          <p className="text-gray-400 py-4 text-center">No active product recalls reported on the ledger.</p>
        ) : (
          <table className="min-w-full text-left">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="px-2 py-1">Product</th>
                <th className="px-2 py-1">Batch / Serial</th>
                <th className="px-2 py-1">Reason</th>
                <th className="px-2 py-1">Severity</th>
                <th className="px-2 py-1">Date</th>
                <th className="px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(alert => (
                <tr key={alert.id} className="border-b border-gray-800">
                  <td className="px-2 py-1">{alert.productName}</td>
                  <td className="px-2 py-1 font-mono text-sm">{alert.batchId}</td>
                  <td className="px-2 py-1">{alert.reason}</td>
                  <td className="px-2 py-1 text-red-400">{alert.severity}</td>
                  <td className="px-2 py-1">{new Date(alert.date).toLocaleDateString()}</td>
                  <td className="px-2 py-1">{alert.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default RecallAlerts;
