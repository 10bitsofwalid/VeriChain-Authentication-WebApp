import { useState } from 'react';
import ActionButton from '../../../components/ui/ActionButton';
import StatusChip from '../../../components/ui/StatusChip';
import {
  FileText,
  Download,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  category: 'Audit' | 'Compliance' | 'Analytics' | 'Security';
  frequency: 'Realtime' | 'Daily' | 'Weekly' | 'Monthly';
  lastGenerated: string;
  fileSize: string;
  recordsCount: number;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  { id: 'rep-01', name: 'Master System Audit Log Export', category: 'Audit', frequency: 'Daily', lastGenerated: '2026-07-23 06:00', fileSize: '4.2 MB', recordsCount: 12450 },
  { id: 'rep-02', name: 'Authenticity Verification & Scan Heatmap', category: 'Analytics', frequency: 'Weekly', lastGenerated: '2026-07-21 00:00', fileSize: '1.8 MB', recordsCount: 5320 },
  { id: 'rep-03', name: 'Factory Production & NFC Tag Compliance', category: 'Compliance', frequency: 'Monthly', lastGenerated: '2026-07-01 00:00', fileSize: '8.9 MB', recordsCount: 42100 },
  { id: 'rep-04', name: 'Anti-Counterfeit Threat & Incident Report', category: 'Security', frequency: 'Realtime', lastGenerated: '2026-07-23 14:00', fileSize: '980 KB', recordsCount: 89 },
  { id: 'rep-05', name: 'Seller Dispute & Complaint Resolution Summary', category: 'Audit', frequency: 'Weekly', lastGenerated: '2026-07-20 00:00', fileSize: '1.2 MB', recordsCount: 430 },
];

export default function AdminReportsView() {
  const reports = REPORT_TEMPLATES;
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState('30d');
  const [autoEmailEnabled, setAutoEmailEnabled] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownload = (report: ReportTemplate) => {
    setDownloadingId(report.id);
    setTimeout(() => {
      setDownloadingId(null);
      showToast(`Exported "${report.name}" in ${selectedFormat.toUpperCase()} format successfully!`);
    }, 1000);
  };

  const handleGenerateNew = () => {
    showToast(`Triggered on-demand compliance report generation for range: ${dateRange}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg, 20px)' }}>
      {toastMessage && (
        <div style={{
          background: 'rgba(6, 182, 212, 0.15)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          color: '#38bdf8',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md, 8px)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Generator Controls */}
      <div className="admin-card">
        <div className="admin-card-header" style={{ marginBottom: 16 }}>
          <div>
            <h3 className="admin-card-title">
              <FileText size={20} color="#06b6d4" />
              Audit & Compliance Report Generator
            </h3>
            <p className="admin-card-subtitle">Export official cryptographic audit trails, platform telemetry, and compliance metrics</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="admin-select"
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="ytd">Year to Date (2026)</option>
            </select>

            <select
              className="admin-select"
              value={selectedFormat}
              onChange={e => setSelectedFormat(e.target.value as 'csv' | 'json' | 'pdf')}
            >
              <option value="csv">CSV Spreadsheet</option>
              <option value="json">JSON Ledger Data</option>
              <option value="pdf">PDF Official Report</option>
            </select>

            <ActionButton variant="primary" size="sm" onClick={handleGenerateNew}>
              <Download size={15} />
              Generate Custom Export
            </ActionButton>
          </div>
        </div>

        {/* Scheduled Reports Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(30, 41, 59, 0.5)',
          padding: '12px 16px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={18} color="#94a3b8" />
            <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
              Automated Scheduled Digest: <strong>Weekly Executive PDF to Admins</strong>
            </span>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setAutoEmailEnabled(!autoEmailEnabled);
              showToast(`Automated digest ${!autoEmailEnabled ? 'ENABLED' : 'DISABLED'}`);
            }}
            style={{
              padding: '4px 12px',
              fontSize: '0.8rem',
              color: autoEmailEnabled ? '#34d399' : '#94a3b8',
              border: autoEmailEnabled ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {autoEmailEnabled ? 'Active (Every Mon 08:00)' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Available Reports Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h4 className="admin-card-title" style={{ fontSize: '1rem' }}>Pre-Configured System Reports</h4>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Target Format: <strong>{selectedFormat.toUpperCase()}</strong></span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Report Title</th>
                <th>Category</th>
                <th>Frequency</th>
                <th>Last Generated</th>
                <th>Dataset Size</th>
                <th>Records</th>
                <th style={{ textAlign: 'right' }}>Download Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(rep => (
                <tr key={rep.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{rep.name}</div>
                  </td>
                  <td>
                    <StatusChip tone={rep.category === 'Security' ? 'danger' : rep.category === 'Compliance' ? 'warning' : rep.category === 'Audit' ? 'info' : 'success'}>
                      {rep.category.toUpperCase()}
                    </StatusChip>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{rep.frequency}</td>
                  <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{rep.lastGenerated}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#cbd5e1' }}>{rep.fileSize}</td>
                  <td style={{ color: '#cbd5e1', fontWeight: 500 }}>{rep.recordsCount.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <ActionButton
                        variant="primary"
                        size="sm"
                        disabled={downloadingId === rep.id}
                        onClick={() => handleDownload(rep)}
                      >
                        <Download size={14} /> Download .{selectedFormat}
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
