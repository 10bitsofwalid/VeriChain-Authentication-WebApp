import { useState, useMemo, useEffect } from 'react';
import MetricCard from '../../components/ui/MetricCard';
import ActionButton from '../../components/ui/ActionButton';
import StatusChip from '../../components/ui/StatusChip';
import PageContainer from '../../components/layout/PageContainer';
import client from '../../api/client';
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

import './RecallManagement.css';

type TabType = 'list' | 'details' | 'products' | 'timeline' | 'notifications' | 'history';

export default function RecallManagementView() {
  // State
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [recalls, setRecalls] = useState<RecallItem[]>([]);
  const [units, setUnits] = useState<AffectedProductUnit[]>([]);
  const [timelineEvents] = useState<RecallTimelineEvent[]>([]);
  const [notifications, setNotifications] = useState<RecallNotificationDispatch[]>([]);
  const [auditLogs, setAuditLogs] = useState<RecallAuditRecord[]>([]);

  const [selectedRecallId, setSelectedRecallId] = useState<string>('');
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

  useEffect(() => {
    async function loadLiveRecalls() {
      try {
        const res = await client.get('/items/recalls').catch(async () => {
          return await client.get('/items/marketplace');
        });
        if (res.data?.items && Array.isArray(res.data.items)) {
          const mappedRecalls: RecallItem[] = res.data.items
            .filter((it: any) => it.status === 'recalled' || res.config?.url?.includes('recalls'))
            .map((it: any, idx: number) => ({
              id: it._id,
              recallCode: `REC-${new Date().getFullYear()}-${100 + idx}`,
              title: `Recall Protocol: ${it.product?.name || 'Recalled Batch'}`,
              productName: it.product?.name || 'Recalled Product',
              sku: it.product?.sku || 'SKU-RECALL',
              batchId: it.serialNumber || it._id.slice(-6).toUpperCase(),
              severity: 'High' as RecallSeverity,
              status: 'Active' as RecallStatus,
              reason: (it.journey && it.journey.find((j: any) => j.action === 'recalled')?.location) || 'Quality assurance quarantine protocol triggered.',
              rootCause: 'Investigation by compliance and QA team.',
              riskLevel: 'Precautionary isolation',
              affectedUnitsCount: 1,
              quarantinedCount: 1,
              quarantineDirectives: 'Isolate batch from main sales distribution channels.',
              initiatedDate: it.updatedAt ? new Date(it.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              owner: 'Quality Officer',
              regulatoryNotified: true,
            }));
          setRecalls(mappedRecalls);
          if (mappedRecalls.length > 0) {
            setSelectedRecallId(mappedRecalls[0].id);
          }
        }
      } catch {
        setRecalls([]);
      }
    }
    loadLiveRecalls();
  }, []);

  // Selected Recall Object
  const selectedRecall = useMemo(() => {
    if (recalls.length === 0) return null;
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
    if (!selectedRecall) return [];
    return units.filter((u) => u.recallId === selectedRecall.id);
  }, [units, selectedRecall]);

  // Filtered Timeline for selected recall
  const filteredTimeline = useMemo(() => {
    if (!selectedRecall) return [];
    return timelineEvents.filter((t) => t.recallId === selectedRecall.id);
  }, [timelineEvents, selectedRecall]);

  // Filtered Notifications for selected recall
  const filteredNotifications = useMemo(() => {
    if (!selectedRecall) return [];
    return notifications.filter((n) => n.recallId === selectedRecall.id);
  }, [notifications, selectedRecall]);

  // Filtered History for selected recall
  const filteredAuditLogs = useMemo(() => {
    if (!selectedRecall) return [];
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
    if (!selectedRecall) return;
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
    const code = `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

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
      riskLevel: 'Precautionary isolation',
      affectedUnitsCount: 1,
      quarantinedCount: 0,
      quarantineDirectives: 'Isolate batch from main sales distribution channels.',
      initiatedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      owner: 'Quality Officer',
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
    if (!selectedRecall) return;
    const newDispatch: RecallNotificationDispatch = {
      id: `notif-${Date.now()}`,
      recallId: selectedRecall.id,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      channel: 'Push Notification',
      targetGroup: 'End Customers',
      totalRecipients: selectedRecall.affectedUnitsCount,
      deliveryRate: '100%',
      status: 'Sent',
      messageTemplate: `URGENT ALERT: Safety recall initiated for ${selectedRecall.productName} (Batch ${selectedRecall.batchId}). Please inspect product serial.`,
    };

    setNotifications((prev) => [newDispatch, ...prev]);
    setShowDispatchModal(false);
    triggerNotification(`Emergency Alert Broadcast dispatched for ${selectedRecall.productName}`);
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
              background: 'var(--accent-bg)',
              border: '1px solid var(--accent-border)',
              color: 'var(--text-primary)',
              padding: '12px 18px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: 'var(--shadow-sm)',
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
              {selectedRecall && (
                <ActionButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDispatchModal(true)}
                >
                  <Send size={16} />
                  Broadcast Alert
                </ActionButton>
              )}
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
            icon={<Boxes size={20} color="var(--accent-purple)" />}
          />
          <MetricCard
            label="Quarantine Segregation Rate"
            value={`${quarantineRate}%`}
            icon={<CheckCircle2 size={20} color="#10b981" />}
          />
        </div>

        {/* Active Focus Bar */}
        {selectedRecall && (
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
        )}

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
                  <List size={18} color="var(--accent-purple)" />
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
                        background: r.id === selectedRecall?.id ? 'var(--accent-bg)' : undefined,
                      }}
                    >
                      <td>
                        <strong style={{ color: 'var(--accent-purple)', fontFamily: 'monospace' }}>{r.recallCode}</strong>
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
                        No product recalls reported. Click "Initiate New Recall" to open a safety action.
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
            {!selectedRecall ? (
              <div className="recall-card" style={{ textAlign: 'center', padding: 36, color: '#94a3b8' }}>
                No recall selected. Please initiate or select a recall from the list.
              </div>
            ) : (
              <div className="recall-card">
                <div className="recall-card-header">
                  <div>
                    <h3 className="recall-card-title">
                      <FileText size={18} color="var(--accent-purple)" />
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

                  <div className="detail-info-card" style={{ borderLeft: '3px solid var(--accent-purple)' }}>
                    <div className="detail-info-label" style={{ color: 'var(--accent-purple)' }}>Health & Risk Assessment Level</div>
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
            )}
          </div>
        )}

        {/* TAB 3: AFFECTED PRODUCTS */}
        {activeTab === 'products' && (
          <div className="recall-card">
            <div className="recall-card-header">
              <div>
                <h3 className="recall-card-title">
                  <Boxes size={18} color="var(--accent-purple)" />
                  Affected Item Units & Serial Distribution {selectedRecall ? `— ${selectedRecall.batchId}` : ''}
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
                  {filteredUnits.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--accent-purple)', fontWeight: 600 }}>{u.serialNumber}</td>
                      <td>{u.location}</td>
                      <td>{u.distributionStatus}</td>
                      <td>
                        <StatusChip tone={u.customerNotified ? 'success' : 'warning'}>
                          {u.customerNotified ? 'NOTIFIED' : 'PENDING'}
                        </StatusChip>
                      </td>
                      <td>
                        <StatusChip tone={u.quarantineState === 'Quarantined' ? 'danger' : 'neutral'}>
                          {u.quarantineState}
                        </StatusChip>
                      </td>
                      <td>
                        <ActionButton
                          variant={u.quarantineState === 'Quarantined' ? 'secondary' : 'danger'}
                          size="sm"
                          onClick={() => handleToggleUnitQuarantine(u.id)}
                        >
                          {u.quarantineState === 'Quarantined' ? 'Release Lock' : 'Quarantine Unit'}
                        </ActionButton>
                      </td>
                    </tr>
                  ))}
                  {filteredUnits.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                        No serialized units logged under this recall batch.
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
                  <Clock size={18} color="var(--accent-purple)" />
                  Recall Milestones & Custody Timeline {selectedRecall ? `— ${selectedRecall.recallCode}` : ''}
                </h3>
                <p className="recall-card-subtitle">Chronological ledger of incident discoveries, inspections, and resolutions</p>
              </div>
            </div>

            <div className="recall-timeline">
              {filteredTimeline.map((t) => (
                <div key={t.id} className="timeline-entry">
                  <div className="timeline-dot" />
                  <div className="timeline-header-info">
                    <span className="timeline-title-text">{t.title}</span>
                    <span className="timeline-timestamp">{t.timestamp}</span>
                  </div>
                  <p className="timeline-desc">{t.description}</p>
                  <div className="timeline-meta-bar">
                    <span>Recorded By: <strong>{t.performedBy}</strong> ({t.stage})</span>
                  </div>
                </div>
              ))}
              {filteredTimeline.length === 0 && (
                <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                  No milestone events recorded for this recall yet.
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
                  <Bell size={18} color="var(--accent-purple)" />
                  Broadcasts & Regulatory Notifications
                </h3>
                <p className="recall-card-subtitle">Dispatch logs sent to retailers, logistics hubs, and verified owners</p>
              </div>
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
                    <th>Template Excerpt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.map((n) => (
                    <tr key={n.id}>
                      <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{n.timestamp}</td>
                      <td>
                        <Tag size={13} style={{ display: 'inline', marginRight: 4 }} />
                        {n.channel}
                      </td>
                      <td>{n.targetGroup}</td>
                      <td><strong>{n.totalRecipients.toLocaleString()}</strong></td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>{n.deliveryRate}</td>
                      <td>
                        <StatusChip tone="success">{n.status}</StatusChip>
                      </td>
                      <td style={{ fontSize: '0.82rem', maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {n.messageTemplate}
                      </td>
                    </tr>
                  ))}
                  {filteredNotifications.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                        No broadcast alerts dispatched for this recall yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: HISTORY AUDIT LOG */}
        {activeTab === 'history' && (
          <div className="recall-card">
            <div className="recall-card-header">
              <div>
                <h3 className="recall-card-title">
                  <HistoryIcon size={18} color="var(--accent-purple)" />
                  Compliance Audit Trail
                </h3>
                <p className="recall-card-subtitle">Immutable system and operator log of all quarantine modifications</p>
              </div>
            </div>

            <div className="recall-table-wrapper">
              <table className="recall-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Operator</th>
                    <th>Role</th>
                    <th>Previous State</th>
                    <th>New State</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLogs.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'monospace' }}>{a.timestamp}</td>
                      <td style={{ fontWeight: 600, color: '#f8fafc' }}>{a.action}</td>
                      <td>{a.actor}</td>
                      <td style={{ color: '#94a3b8' }}>{a.role}</td>
                      <td>
                        <span style={{ color: '#94a3b8' }}>{a.previousState || '—'}</span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--accent-purple)' }}>{a.newState || '—'}</strong>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{a.notes}</td>
                    </tr>
                  ))}
                  {filteredAuditLogs.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                        No compliance audit modifications recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: Initiate New Recall */}
        {showNewRecallModal && (
          <div className="recall-modal-backdrop">
            <div className="recall-modal">
              <div className="recall-modal-header">
                <h3>Initiate Product Recall Event</h3>
                <button
                  onClick={() => setShowNewRecallModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateRecall}>
                <div className="recall-modal-body">
                  <div className="recall-form-group">
                    <label>Recall Directive Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Voluntary Battery Isolation Protocol"
                      value={newRecallTitle}
                      onChange={(e) => setNewRecallTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="recall-form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      placeholder="e.g. AeroChron Titanium S1"
                      value={newRecallProduct}
                      onChange={(e) => setNewRecallProduct(e.target.value)}
                      required
                    />
                  </div>

                  <div className="recall-form-group">
                    <label>Affected Batch ID</label>
                    <input
                      type="text"
                      placeholder="e.g. BATCH-2026-X9"
                      value={newRecallBatch}
                      onChange={(e) => setNewRecallBatch(e.target.value)}
                      required
                    />
                  </div>

                  <div className="recall-form-group">
                    <label>Severity Level</label>
                    <select
                      value={newRecallSeverity}
                      onChange={(e) => setNewRecallSeverity(e.target.value as RecallSeverity)}
                    >
                      <option value="Critical">Critical - Immediate Health Hazard</option>
                      <option value="High">High - Performance Failure</option>
                      <option value="Medium">Medium - Packaging / Label Discrepancy</option>
                      <option value="Low">Low - Precautionary Advisory</option>
                    </select>
                  </div>

                  <div className="recall-form-group">
                    <label>Reason & Preliminary Root Cause</label>
                    <textarea
                      rows={3}
                      placeholder="Describe the failure mode or inspection anomaly..."
                      value={newRecallReason}
                      onChange={(e) => setNewRecallReason(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="recall-modal-footer">
                  <ActionButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowNewRecallModal(false)}
                    type="button"
                  >
                    Cancel
                  </ActionButton>
                  <ActionButton variant="primary" size="sm" type="submit">
                    Publish Recall Order
                  </ActionButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Emergency Dispatch Broadcast */}
        {showDispatchModal && selectedRecall && (
          <div className="recall-modal-backdrop">
            <div className="recall-modal">
              <div className="recall-modal-header">
                <h3>Dispatch Emergency Consumer Notice</h3>
                <button
                  onClick={() => setShowDispatchModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="recall-modal-body">
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  This will broadcast cryptographic safety push notifications & emails to all registered owners of batch{' '}
                  <strong style={{ color: 'var(--accent-purple)' }}>{selectedRecall.batchId}</strong> ({selectedRecall.productName}).
                </p>
                <div className="detail-info-card" style={{ marginTop: 14 }}>
                  <div className="detail-info-label">Broadcast Template</div>
                  <p style={{ fontSize: '0.85rem', color: '#f8fafc', margin: '4px 0 0 0' }}>
                    URGENT: Safety recall issued for {selectedRecall.productName} ({selectedRecall.recallCode}). Please check your device serial against the VeriChain trust ledger.
                  </p>
                </div>
              </div>
              <div className="recall-modal-footer">
                <ActionButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDispatchModal(false)}
                >
                  Cancel
                </ActionButton>
                <ActionButton variant="danger" size="sm" onClick={handleDispatchNotification}>
                  <Send size={15} />
                  Execute Broadcast
                </ActionButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
