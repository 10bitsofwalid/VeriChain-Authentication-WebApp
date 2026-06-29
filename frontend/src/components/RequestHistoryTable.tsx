import React from 'react';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface AllocationRequest {
  id: string;
  productName: string;
  batchId: string;
  factoryName: string;
  factoryId: string;
  requestedQty: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

interface RequestHistoryTableProps {
  allocationRequests: AllocationRequest[];
}

const RequestHistoryTable: React.FC<RequestHistoryTableProps> = ({ allocationRequests }) => {
  if (allocationRequests.length === 0) return null;
  return (
    <div className="table-container glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
      <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'rgba(255,255,255,0.02)' }}>
            <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Factory</th>
            <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Batch / Product</th>
            <th style={{ padding: 'var(--space-md)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Qty</th>
            <th style={{ padding: 'var(--space-md)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Date</th>
            <th style={{ padding: 'var(--space-md)', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {allocationRequests.map((req) => (
            <tr key={req.id} style={{ borderBottom: '1px solid var(--border-default)', transition: 'background 0.2s' }}>
              <td style={{ padding: 'var(--space-md)', fontWeight: 500 }}>{req.factoryName}</td>
              <td style={{ padding: 'var(--space-md)' }}>
                <div>{req.productName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{req.batchId}</div>
              </td>
              <td style={{ padding: 'var(--space-md)', textAlign: 'center', fontWeight: 600 }}>{req.requestedQty}</td>
              <td style={{ padding: 'var(--space-md)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(req.createdAt).toLocaleString()}</td>
              <td style={{ padding: 'var(--space-md)', textAlign: 'right' }}>
                <span
                  className={`badge ${req.status === 'Approved' ? 'badge-success' : req.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', fontWeight: 600 }}
                >
                  {req.status === 'Pending' && <Clock size={12} className="spin" style={{ animation: 'spin 2s linear infinite' }} />}
                  {req.status === 'Approved' && <CheckCircle size={12} />}
                  {req.status === 'Rejected' && <AlertTriangle size={12} />}
                  {req.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestHistoryTable;
