import { useState, useMemo } from 'react';
import MetricCard from '../../components/ui/MetricCard';
import ActionButton from '../../components/ui/ActionButton';
import StatusChip from '../../components/ui/StatusChip';
import PageContainer from '../../components/layout/PageContainer';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Plus,
  Send,
  CheckCircle2,
  List,
  FileText,
  Boxes,
  Clock,
  Bell,
  History as HistoryIcon,
  X,
  Tag,
} from 'lucide-react';

import type {
  RecallItem,
  AffectedProductUnit,
  RecallTimelineEvent,
  RecallNotificationDispatch,
  RecallAuditRecord,
  RecallSeverity,
  RecallStatus,
  QuarantineState,
} from '../../types/recallManagement';

import {
  MOCK_RECALLS,
  MOCK_AFFECTED_UNITS,
  MOCK_TIMELINE_EVENTS,
  MOCK_NOTIFICATIONS,
  MOCK_AUDIT_HISTORY,
} from '../../mock/recallManagementData';

import './RecallManagement.css';

type TabType = 'list' | 'details' | 'products' | 'timeline' | 'notifications' | 'history';

export default function RecallManagementView() {
  // State
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [recalls, setRecalls] = useState<RecallItem[]>(MOCK_RECALLS);
  const [units, setUnits] = useState<AffectedProductUnit[]>(MOCK_AFFECTED_UNITS);
  const [timelineEvents] = useState<RecallTimelineEvent[]>(MOCK_TIMELINE_EVENTS);
  const [notifications, setNotifications] = useState<RecallNotificationDispatch[]>(MOCK_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<RecallAuditRecord[]>(MOCK_AUDIT_HISTORY);

  const [selectedRecallId, setSelectedRecallId] = useState<string>('rec-001');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal state
  const [showNewRecallModal, setShowNewRecallModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null);

  // New Recall Form state
  const [newRecallTitle, setNewRecallTitle] = useState('');
  const [newRecallProduct, setNewRecallProduct] = useState('');
  const [newRecallBatch, setNewRecallBatch] = useState('');
  const [newRecallSeverity, setNewRecallSeverity] = useState<RecallSeverity>('High');
  const [newRecallReason, setNewRecallReason] = useState('');

  // Selected Recall Object
  const selectedRecall = useMemo(() => {
    return recalls.find((r) => r.id === selectedRecallId) || recalls[0];
  }, [recalls, selectedRecallId]);

  // Derived metrics
  const activeCount = useMemo(() => recalls.filter((r) => r.status === 'Active' || r.status === 'In Progress').length, [recalls]);
  const criticalCount = useMemo(() => recalls.filter((r) => r.severity === 'Critical').length, [recalls]);
  const totalAffected = useMemo(() => recalls.reduce((sum, r) => sum + r.affectedUnitsCount, 0), [recalls]);
  const totalQuarantined = useMemo(() => recalls.reduce((sum, r) => sum + r.quarantinedCount, 0), [recalls]);
  const quarantineRate = totalAffected > 0 ? ((totalQuarantined / totalAffected) * 100).toFixed(1) : '0';

  // Filtered Recalls
  const filteredRecalls = useMemo(() => {
    return recalls.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.recallCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.batchId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || r.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [recalls, searchQuery, severityFilter, statusFilter]);

  // Filtered Units for selected recall
  const filteredUnits = useMemo(() => {
    return units.filter((u) => u.recallId === selectedRecall.id);
  }, [units, selectedRecall]);

  // Filtered Timeline for selected recall
  const filteredTimeline = useMemo(() => {
    return timelineEvents.filter((t) => t.recallId === selectedRecall.id);
  }, [timelineEvents, selectedRecall]);

  // Filtered Notifications for selected recall
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => n.recallId === selectedRecall.id);
  }, [notifications, selectedRecall]);

  // Filtered History for selected recall
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((a) => a.recallId === selectedRecall.id);
  }, [auditLogs, selectedRecall]);

  // Handlers
  const triggerNotification = (msg: string) => {
    setNotificationSuccess(msg);
    setTimeout(() => setNotificationSuccess(null), 3500);
  };

  const handleToggleUnitQuarantine = (unitId: string) => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id === unitId) {
          const nextState: QuarantineState =
            u.quarantineState === 'Quarantined' ? 'Pending Sweep' : 'Quarantined';
          return {
            ...u,
            quarantineState: nextState,
            lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19),
          };
        }
        return u;
      })
    );
    triggerNotification(`Unit quarantine state updated for serial unit #${unitId}`);
  };

  const handleUpdateStatus = (newStatus: RecallStatus) => {
    setRecalls((prev) =>
      prev.map((r) => {
        if (r.id === selectedRecall.id) {
          return {
            ...r,
            status: newStatus,
            resolvedDate: newStatus === 'Resolved' ? new Date().toISOString().replace('T', ' ').substring(0, 19) : r.resolvedDate,
          };
        }
        return r;
      })
    );

    // Add Audit Log
    const newLog: RecallAuditRecord = {
      id: `aud-${Date.now()}`,
      recallId: selectedRecall.id,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: `Status Updated to ${newStatus}`,
      actor: 'Compliance Manager',
      role: 'Platform Admin',
      previousState: selectedRecall.status,
      newState: newStatus,
      notes: `Manual status transition recorded for ${selectedRecall.recallCode}`,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    triggerNotification(`Recall ${selectedRecall.recallCode} status updated to ${newStatus}`);
  };

  const handleCreateRecall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecallTitle || !newRecallProduct) return;

    const newId = `rec-${Date.now()}`;
    const code = `REC-2026-${Math.floor(100 + Math.random() * 900)}`;

    const item: RecallItem = {
      id: newId,
      recallCode: code,
      title: newRecallTitle,
      productName: newRecallProduct,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      batchId: newRecallBatch || 'B-INIT',
      severity: newRecallSeverity,
      status: 'Active',
      reason: newRecallReason || 'Safety inspection anomaly detected.',
      rootCause: 'Investigation under progress by QA team.',
      riskLevel: 'Class II - Precautionary isolation',
      affectedUnitsCount: 500,
      quarantinedCount: 0,
      quarantineDirectives: 'Isolate batch from main sales distribution channels.',
      initiatedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      owner: 'Current Admin',
      regulatoryNotified: true,
    };

    setRecalls((prev) => [item, ...prev]);
    setSelectedRecallId(newId);
    setShowNewRecallModal(false);
    setNewRecallTitle('');
    setNewRecallProduct('');
    setNewRecallBatch('');
    setNewRecallReason('');
    triggerNotification(`New Product Recall ${code} successfully initiated`);
  };

  const handleDispatchNotification = () => {
    const newDispatch: RecallNotificationDispatch = {
      id: `notif-${Date.now()}`,
      recallId: selectedRecall.id,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      channel: 'Push Notification',
      targetGroup: 'End Customers',
      totalRecipients: selectedRecall.affectedUnitsCount,
      deliveryRate: '99.2%',
      status: 'Sent',
      messageTemplate: `URGENT ALERT: Safety recall initiated for ${selectedRecall.productName} (Batch ${selectedRecall.batchId}). Please inspect product serial.`,
    };

    setNotifications((prev) => [newDispatch, ...prev]);
    setShowDispatchModal(false);
    triggerNotification(`Emergency Alert Broadcast dispatched to ${selectedRecall.affectedUnitsCount} end-users`);
  };

  const getToneFromSeverity = (sev: RecallSeverity) => {
    switch (sev) {
      case 'Critical':
        return 'danger';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'info';
      case 'Low':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const getToneFromStatus = (st: RecallStatus) => {
    switch (st) {
      case 'Active':
      case 'In Progress':
        return 'warning';
      case 'Quarantined':
        return 'danger';
      case 'Resolved':
      case 'Closed':
        return 'success';
      case 'Draft':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  return (
    <PageContainer showBreadcrumb={false}>
      <div className="recall-management-container">
        {/* Toast Alert */}
        {notificationSuccess && (
          <div
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: '#38bdf8',
              padding: '12px 18px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.2)',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{notificationSuccess}</span>
          </div>
        )}

        {/* Mission & Overview Header */}
        <div className="recall-header-card">
          <div className="recall-header-top">
            <div className="recall-header-title">
              <div className="recall-header-icon">
                <ShieldAlert size={26} />
              </div>
              <div>
                <h1>Recall Management & Product Integrity Control</h1>
                <p className="recall-header-desc">
                  End-to-end product recall governance: quarantine compromised batches, track serial unit locations,
                  dispatch emergency consumer alerts, and maintain immutable cryptographic audit records.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <ActionButton
                variant="primary"
                size="sm"
                onClick={() => setShowNewRecallModal(true)}
              >
                <Plus size={16} />
                Initiate New Recall
              </ActionButton>
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => setShowDispatchModal(true)}
              >
                <Send size={16} />
                Broadcast Alert
              </ActionButton>
            </div>
          </div>
        </div>

        {/* Metrics Grid Banner */}
        <div className="recall-metrics-grid">
          <MetricCard
            label="Active Recalls"
            value={`${activeCount} / ${recalls.length}`}
            icon={<AlertTriangle size={20} color="#f59e0b" />}
          />
          <MetricCard
            label="Critical Severity Risk"
            value={criticalCount.toString()}
            icon={<ShieldAlert size={20} color="#ef4444" />}
          />
          <MetricCard
            label="Affected Units Total"
            value={totalAffected.toLocaleString()}
            icon={<Boxes size={20} color="#06b6d4" />}
          />
          <MetricCard
            label="Quarantine Segregation Rate"
            value={`${quarantineRate}%`}
            icon={<CheckCircle2 size={20} color="#10b981" />}
          />
        </div>

        {/* Active Focus Bar */}
        <div className="recall-focus-bar">
          <div className="recall-focus-left">
            <span className="recall-focus-label">ACTIVE RECALL FOCUS:</span>
            <select
              className="recall-select"
              value={selectedRecall.id}
              onChange={(e) => setSelectedRecallId(e.target.value)}
            >
              {recalls.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.recallCode} - {r.productName} ({r.severity})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <StatusChip tone={getToneFromSeverity(selectedRecall.severity)}>
              SEVERITY: {selectedRecall.severity.toUpperCase()}
            </StatusChip>
            <StatusChip tone={getToneFromStatus(selectedRecall.status)}>
              STATUS: {selectedRecall.status.toUpperCase()}
            </StatusChip>
          </div>
        </div>

        {/* Sub-view Nav Tabs */}
        <div className="recall-tabs-bar">
          <button
            className={`recall-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <List size={16} />
            Recall List
            <span className="recall-tab-badge">{recalls.length}</span>
          </button>

          <button
            className={`recall-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <FileText size={16} />
            Recall Details
          </button>

          <button
            className={`recall-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Boxes size={16} />
            Affected Products
            <span className="recall-tab-badge">{filteredUnits.length}</span>
          </button>

          <button
            className={`recall-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            <Clock size={16} />
            Timeline
            <span className="recall-tab-badge">{filteredTimeline.length}</span>
          </button>

          <button
            className={`recall-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={16} />
            Notifications
            <span className="recall-tab-badge">{filteredNotifications.length}</span>
          </button>

          <button
            className={`recall-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <HistoryIcon size={16} />
            History Log
            <span className="recall-tab-badge">{filteredAuditLogs.length}</span>
          </button>
        </div>

        {/* TAB CONTENT PANELS */}

        {/* TAB 1: RECALL LIST */}
        {activeTab === 'list' && (
          <div className="recall-card">
            <div className="recall-card-header">
              <div>
                <h3 className="recall-card-title">
                  <List size={18} color="#06b6d4" />
                  Active & Archived Product Recalls
                </h3>
                <p className="recall-card-subtitle">Filter by severity level, code, batch, or resolution state</p>
              </div>

              <div className="recall-controls-group">
                <div className="recall-search-input">
                  <Search size={15} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Search code, product, batch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  className="recall-filter-select"
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <option value="all">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                <select
                  className="recall-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Draft">Draft</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="recall-table-wrapper">
              <table className="recall-table">
                <thead>
                  <tr>
                    <th>Recall Code</th>
                    <th>Product & Batch</th>
                    <th>Severity</th>
                    <th>Initiated Date</th>
                    <th>Quarantined / Total Units</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecalls.map((r) => (
                    <tr
                      key={r.id}
                      style={{
                        background: r.id === selectedRecall.id ? 'rgba(6, 182, 212, 0.06)' : undefined,
                      }}
                    >
                      <td>
                        <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{r.recallCode}</strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{r.productName}</div>
                        <small style={{ color: '#94a3b8' }}>Batch: {r.batchId} | SKU: {r.sku}</small>
                      </td>
                      <td>
                        <StatusChip tone={getToneFromSeverity(r.severity)}>
                          {r.severity}
                        </StatusChip>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{r.initiatedDate}</td>
                      <td>
                        <strong>{r.quarantinedCount}</strong> / {r.affectedUnitsCount}
                      </td>
                      <td>
                        <StatusChip tone={getToneFromStatus(r.status)}>
                          {r.status}
                        </StatusChip>
                      </td>
                      <td>
                        <ActionButton
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedRecallId(r.id);
                            setActiveTab('details');
                          }}
                        >
                          Inspect Details
                        </ActionButton>
                      </td>
                    </tr>
                  ))}
                  {filteredRecalls.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                        No product recalls found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: RECALL DETAILS */}
        {activeTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="recall-card">
              <div className="recall-card-header">
                <div>
                  <h3 className="recall-card-title">
                    <FileText size={18} color="#06b6d4" />
                    Recall Specification & Risk Assessment — {selectedRecall.recallCode}
                  </h3>
                  <p className="recall-card-subtitle">{selectedRecall.title}</p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  {selectedRecall.status !== 'Resolved' && (
                    <ActionButton variant="primary" size="sm" onClick={() => handleUpdateStatus('Resolved')}>
                      Mark Resolved
                    </ActionButton>
                  )}
                  {selectedRecall.status === 'Active' && (
                    <ActionButton variant="danger" size="sm" onClick={() => handleUpdateStatus('Quarantined')}>
                      Enforce Quarantined Lock
                    </ActionButton>
                  )}
                </div>
              </div>

              <div className="detail-info-grid" style={{ marginBottom: 20 }}>
                <div className="detail-info-card">
                  <div className="detail-info-label">Product Name</div>
                  <div className="detail-info-value">{selectedRecall.productName}</div>
                </div>
                <div className="detail-info-card">
                  <div className="detail-info-label">Batch ID / SKU</div>
                  <div className="detail-info-value" style={{ fontFamily: 'monospace' }}>
                    {selectedRecall.batchId} ({selectedRecall.sku})
                  </div>
                </div>
                <div className="detail-info-card">
                  <div className="detail-info-label">Initiated By</div>
                  <div className="detail-info-value">{selectedRecall.owner}</div>
                </div>
                <div className="detail-info-card">
                  <div className="detail-info-label">Regulatory Authority Alert</div>
                  <div className="detail-info-value" style={{ color: selectedRecall.regulatoryNotified ? '#10b981' : '#f59e0b' }}>
                    {selectedRecall.regulatoryNotified ? 'CONFIRMED DISPATCH' : 'PENDING NOTIFICATION'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="detail-info-card" style={{ borderLeft: '3px solid #ef4444' }}>
                  <div className="detail-info-label" style={{ color: '#ef4444' }}>Reason for Recall</div>
                  <p style={{ color: '#f8fafc', margin: '4px 0 0 0', lineHeight: 1.5 }}>{selectedRecall.reason}</p>
                </div>

                <div className="detail-info-card" style={{ borderLeft: '3px solid #f59e0b' }}>
                  <div className="detail-info-label" style={{ color: '#f59e0b' }}>Root Cause Analysis</div>
                  <p style={{ color: '#f8fafc', margin: '4px 0 0 0', lineHeight: 1.5 }}>{selectedRecall.rootCause}</p>
                </div>

                <div className="detail-info-card" style={{ borderLeft: '3px solid #06b6d4' }}>
                  <div className="detail-info-label" style={{ color: '#06b6d4' }}>Health & Risk Assessment Level</div>
                  <p style={{ color: '#f8fafc', margin: '4px 0 0 0', fontWeight: 600 }}>{selectedRecall.riskLevel}</p>
                </div>

                <div className="detail-info-card" style={{ background: 'rgba(15, 23, 42, 0.8)' }}>
                  <div className="detail-info-label">Quarantine & Handling Directives</div>
                  <p style={{ color: '#e2e8f0', margin: '4px 0 0 0', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {selectedRecall.quarantineDirectives}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AFFECTED PRODUCTS */}
        {activeTab === 'products' && (
          <div className="recall-card">
            <div className="recall-card-header">
              <div>
                <h3 className="recall-card-title">
                  <Boxes size={18} color="#06b6d4" />
                  Affected Item Units & Serial Distribution — {selectedRecall.batchId}
                </h3>
                <p className="recall-card-subtitle">
                  Individual cryptographic serial unit tracking and live warehouse/transit quarantine states
                </p>
              </div>
            </div>

            <div className="recall-table-wrapper">
              <table className="recall-table">
                <thead>
                  <tr>
                    <th>Serial Number</th>
                    <th>Location</th>
                    <th>Distribution Channel</th>
                    <th>Customer Notified</th>
                    <th>Quarantine State</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnits.map((unit) => (
                    <tr key={unit.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#38bdf8' }}>
                        {unit.serialNumber}
                      </td>
                      <td>{unit.location}</td>
                      <td>
                        <span className="recall-tab-badge">{unit.distributionStatus}</span>
                      </td>
                      <td>
                        <StatusChip tone={unit.customerNotified ? 'success' : 'warning'}>
                          {unit.customerNotified ? 'YES' : 'NO'}
                        </StatusChip>
                      </td>
                      <td>
                        <StatusChip tone={unit.quarantineState === 'Quarantined' ? 'danger' : unit.quarantineState === 'Returned' ? 'success' : 'warning'}>
                          {unit.quarantineState.toUpperCase()}
                        </StatusChip>
                      </td>
                      <td>
                        <ActionButton
                          variant={unit.quarantineState === 'Quarantined' ? 'secondary' : 'danger'}
                          size="sm"
                          onClick={() => handleToggleUnitQuarantine(unit.id)}
                        >
                          {unit.quarantineState === 'Quarantined' ? 'Release Hold' : 'Quarantine Unit'}
                        </ActionButton>
                      </td>
                    </tr>
                  ))}
                  {filteredUnits.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                        No affected serial units registered for this recall.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="recall-card">
            <div className="recall-card-header">
              <div>
                <h3 className="recall-card-title">
                  <Clock size={18} color="#06b6d4" />
                  Recall Resolution Progress & Event Timeline
                </h3>
                <p className="recall-card-subtitle">
                  Chronological milestone tracking from initial sample detection to final audit closing
                </p>
              </div>
            </div>

            <div className="timeline-container">
              {filteredTimeline.map((step) => (
                <div key={step.id} className={`timeline-step ${step.status}`}>
                  <div className="timeline-marker">
                    {step.status === 'completed' ? (
                      <CheckCircle2 size={14} />
                    ) : step.status === 'in_progress' ? (
                      <Clock size={14} />
                    ) : (
                      <Tag size={14} />
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem', fontWeight: 600 }}>
                        {step.title}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: '#06b6d4', fontWeight: 600 }}>
                        Stage: {step.stage} | Performed by: {step.performedBy}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8' }}>
                      {step.timestamp}
                    </span>
                  </div>

                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                    {step.description}
                  </p>
                </div>
              ))}

              {filteredTimeline.length === 0 && (
                <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                  No timeline milestone events recorded yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="recall-card">
            <div className="recall-card-header">
              <div>
                <h3 className="recall-card-title">
                  <Bell size={18} color="#06b6d4" />
                  Emergency Notification Broadcasts & Alerts
                </h3>
                <p className="recall-card-subtitle">
                  Multi-channel alert log for buyers, authorized distributors, and regulatory webhooks
                </p>
              </div>
              <ActionButton variant="primary" size="sm" onClick={() => setShowDispatchModal(true)}>
                <Send size={15} />
                Dispatch New Alert
              </ActionButton>
            </div>

            <div className="recall-table-wrapper">
              <table className="recall-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Channel</th>
                    <th>Target Group</th>
                    <th>Recipients</th>
                    <th>Delivery Rate</th>
                    <th>Status</th>
                    <th>Message Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.map((n) => (
                    <tr key={n.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8' }}>
                        {n.timestamp}
                      </td>
                      <td style={{ fontWeight: 600, color: '#f8fafc' }}>{n.channel}</td>
                      <td>
                        <span className="recall-tab-badge">{n.targetGroup}</span>
                      </td>
                      <td>{n.totalRecipients}</td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>{n.deliveryRate}</td>
                      <td>
                        <StatusChip tone={n.status === 'Sent' ? 'success' : 'warning'}>
                          {n.status}
                        </StatusChip>
                      </td>
                      <td style={{ maxWidth: 300 }}>
                        <div className="notif-preview-box">{n.messageTemplate}</div>
                      </td>
                    </tr>
                  ))}
                  {filteredNotifications.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                        No notification dispatches logged for this recall.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: HISTORY */}
        {activeTab === 'history' && (
          <div className="recall-card">
            <div className="recall-card-header">
              <div>
                <h3 className="recall-card-title">
                  <HistoryIcon size={18} color="#06b6d4" />
                  Audit Trail & Historical Resolution Logs
                </h3>
                <p className="recall-card-subtitle">
                  Immutable record of compliance actions, operator notes, and cryptographic state transitions
                </p>
              </div>
            </div>

            <div className="recall-table-wrapper">
              <table className="recall-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Actor / Operator</th>
                    <th>Role</th>
                    <th>State Change</th>
                    <th>Audit Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLogs.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8' }}>
                        {a.timestamp}
                      </td>
                      <td style={{ fontWeight: 600, color: '#38bdf8' }}>{a.action}</td>
                      <td style={{ color: '#f8fafc' }}>{a.actor}</td>
                      <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{a.role}</td>
                      <td>
                        {a.newState ? (
                          <span style={{ fontSize: '0.8rem' }}>
                            <span style={{ textDecoration: 'line-through', color: '#64748b', marginRight: 4 }}>
                              {a.previousState || 'None'}
                            </span>
                            <strong style={{ color: '#10b981' }}>→ {a.newState}</strong>
                          </span>
                        ) : (
                          <span style={{ color: '#64748b' }}>N/A</span>
                        )}
                      </td>
                      <td style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{a.notes}</td>
                    </tr>
                  ))}
                  {filteredAuditLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                        No audit records logged for this recall.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL 1: INITIATE NEW RECALL */}
        {showNewRecallModal && (
          <div className="recall-modal-backdrop" onClick={() => setShowNewRecallModal(false)}>
            <div className="recall-modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert size={20} color="#ef4444" />
                  Initiate New Product Recall Order
                </h3>
                <button
                  onClick={() => setShowNewRecallModal(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateRecall} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Recall Title / Directive
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PureSoap Batch B-1024 Chemical Contamination"
                    className="recall-search-input"
                    style={{ width: '100%', padding: '8px 12px' }}
                    value={newRecallTitle}
                    onChange={(e) => setNewRecallTitle(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PureSoap Organic 200g"
                      className="recall-search-input"
                      style={{ width: '100%', padding: '8px 12px' }}
                      value={newRecallProduct}
                      onChange={(e) => setNewRecallProduct(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                      Batch ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. B-1024"
                      className="recall-search-input"
                      style={{ width: '100%', padding: '8px 12px' }}
                      value={newRecallBatch}
                      onChange={(e) => setNewRecallBatch(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Severity Level
                  </label>
                  <select
                    className="recall-filter-select"
                    style={{ width: '100%' }}
                    value={newRecallSeverity}
                    onChange={(e) => setNewRecallSeverity(e.target.value as RecallSeverity)}
                  >
                    <option value="Critical">Critical (Class I)</option>
                    <option value="High">High (Class II)</option>
                    <option value="Medium">Medium (Class III)</option>
                    <option value="Low">Low (Precautionary)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Reason for Recall & Anomaly Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe detected defect, laboratory result, or quality anomaly..."
                    className="recall-search-input"
                    style={{ width: '100%', padding: '8px 12px', resize: 'vertical' }}
                    value={newRecallReason}
                    onChange={(e) => setNewRecallReason(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <ActionButton variant="secondary" size="sm" type="button" onClick={() => setShowNewRecallModal(false)}>
                    Cancel
                  </ActionButton>
                  <ActionButton variant="danger" size="sm" type="submit">
                    Initiate Recall Order
                  </ActionButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: DISPATCH BROADCAST ALERT */}
        {showDispatchModal && (
          <div className="recall-modal-backdrop" onClick={() => setShowDispatchModal(false)}>
            <div className="recall-modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Send size={20} color="#06b6d4" />
                  Broadcast Multi-Channel Emergency Alert
                </h3>
                <button
                  onClick={() => setShowDispatchModal(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 14, borderRadius: 8 }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Target Recall Order:</div>
                <strong style={{ color: '#38bdf8' }}>{selectedRecall.recallCode} - {selectedRecall.productName}</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Audience Channel
                  </label>
                  <select className="recall-filter-select" style={{ width: '100%' }}>
                    <option>Push Notification + Mobile App Alert</option>
                    <option>Email Notification to Retailers & Hubs</option>
                    <option>Regulatory Compliance API Webhook</option>
                    <option>All Channels Simultaneous Broadcast</option>
                  </select>
                </div>

                <div className="notif-preview-box">
                  <strong>Template Preview:</strong>
                  <p style={{ margin: '6px 0 0 0' }}>
                    URGENT RECALL ALERT: Safety order initiated for {selectedRecall.productName} (Batch {selectedRecall.batchId}).
                    Please halt use immediately. Contact support for return instructions.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <ActionButton variant="secondary" size="sm" onClick={() => setShowDispatchModal(false)}>
                  Cancel
                </ActionButton>
                <ActionButton variant="primary" size="sm" onClick={handleDispatchNotification}>
                  Dispatch Immediate Broadcast
                </ActionButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
