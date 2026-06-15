import { useEffect, useState } from 'react';
import client from '../../api/client';
import {
  FileText,
  Clock,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface AuditLogEntry {
  _id: string;
  action: string;
  actor: { _id: string; name: string; role: string; email: string } | null;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async (pageNumber: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await client.get(`/admin/audit-logs?page=${pageNumber}&limit=20`);
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      setError('Failed to retrieve system logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && page < pagination.pages) {
      setPage(prev => prev + 1);
    }
  };

  const actionBadge = (action: string) => {
    if (action.includes('REGISTERED') || action.includes('GENERATED')) {
      return 'badge-info';
    }
    if (action.includes('VERIFIED') || action.includes('APPROVED')) {
      return 'badge-success';
    }
    if (action.includes('RECALLED') || action.includes('REJECTED') || action.includes('COUNTERFEIT')) {
      return 'badge-danger';
    }
    if (action.includes('COMPLAINT') || action.includes('DISPUTE')) {
      return 'badge-warning';
    }
    return 'badge-neutral';
  };

  if (loading && logs.length === 0) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Audit Trails</h1>
        <p>System-wide activity ledger tracking manufacturing, transfers, certifications, and disputes</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="empty-state glass-card">
          <FileText size={48} />
          <h3>No Audit Records</h3>
          <p>Activity log is currently empty.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Target Type</th>
                  <th>Event details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id}>
                    <td>
                      <span className={`badge ${actionBadge(log.action)}`} style={{ fontSize: '11px' }}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {log.actor ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{log.actor.name}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.actor.role}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>System / Guest</span>
                      )}
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontSize: '13px' }}>
                        {log.targetType}
                      </span>
                    </td>
                    <td style={{ maxWidth: '350px', wordBreak: 'break-word', color: 'var(--text-secondary)' }}>
                      {log.details}
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color="var(--text-muted)" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.pages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-glass)',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
              marginTop: 'var(--space-sm)'
            }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Showing page <strong style={{ color: 'var(--text-primary)' }}>{page}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{pagination.pages}</strong> ({pagination.total} total logs)
              </span>
              <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handlePrevPage}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleNextPage}
                  disabled={page === pagination.pages || loading}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
