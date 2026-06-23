import React from 'react';
import { recallAlerts } from '../mock/recallData';

const RecallAlerts: React.FC = () => (
  <section className="mt-12">
    <h2 className="text-2xl font-semibold mb-4">Recall Alerts</h2>
    <div className="glass-card p-4 overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="border-b border-gray-700">
          <tr>
            <th className="px-2 py-1">Product</th>
            <th className="px-2 py-1">Batch ID</th>
            <th className="px-2 py-1">Reason</th>
            <th className="px-2 py-1">Severity</th>
            <th className="px-2 py-1">Date</th>
            <th className="px-2 py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {recallAlerts.map(alert => (
            <tr key={alert.id} className="border-b border-gray-800">
              <td className="px-2 py-1">{alert.productName}</td>
              <td className="px-2 py-1">{alert.batchId}</td>
              <td className="px-2 py-1">{alert.reason}</td>
              <td className="px-2 py-1">{alert.severity}</td>
              <td className="px-2 py-1">{new Date(alert.date).toLocaleDateString()}</td>
              <td className="px-2 py-1">{alert.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default RecallAlerts;
