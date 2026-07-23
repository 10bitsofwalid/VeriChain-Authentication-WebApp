export type RecallSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type RecallStatus = 'Draft' | 'Active' | 'Quarantined' | 'In Progress' | 'Resolved' | 'Closed';

export interface RecallItem {
  id: string;
  recallCode: string;
  title: string;
  productName: string;
  sku: string;
  batchId: string;
  severity: RecallSeverity;
  status: RecallStatus;
  reason: string;
  rootCause: string;
  riskLevel: string;
  affectedUnitsCount: number;
  quarantinedCount: number;
  quarantineDirectives: string;
  initiatedDate: string;
  resolvedDate?: string;
  owner: string;
  regulatoryNotified: boolean;
}

export type DistributionStatus = 'In Warehouse' | 'In Transit' | 'Retailer Inventory' | 'Sold to Customer';
export type QuarantineState = 'Quarantined' | 'Pending Sweep' | 'Returned' | 'Destroyed';

export interface AffectedProductUnit {
  id: string;
  recallId: string;
  serialNumber: string;
  batchId: string;
  location: string;
  distributionStatus: DistributionStatus;
  customerNotified: boolean;
  quarantineState: QuarantineState;
  lastUpdated: string;
}

export type TimelineStage = 'Initiated' | 'Batch Isolated' | 'Alerts Broadcasted' | 'Inventory Swept' | 'Resolution Signoff' | 'Closed';

export interface RecallTimelineEvent {
  id: string;
  recallId: string;
  timestamp: string;
  stage: TimelineStage;
  title: string;
  description: string;
  performedBy: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export type NotificationChannel = 'Email' | 'SMS' | 'Push Notification' | 'Web Banner' | 'API Webhook';
export type NotificationTargetGroup = 'End Customers' | 'Authorized Retailers' | 'Logistics Hubs' | 'Regulatory Agency';

export interface RecallNotificationDispatch {
  id: string;
  recallId: string;
  timestamp: string;
  channel: NotificationChannel;
  targetGroup: NotificationTargetGroup;
  totalRecipients: number;
  deliveryRate: string;
  status: 'Sent' | 'Scheduled' | 'Failed';
  messageTemplate: string;
}

export interface RecallAuditRecord {
  id: string;
  recallId: string;
  timestamp: string;
  action: string;
  actor: string;
  role: string;
  previousState?: string;
  newState?: string;
  notes: string;
}
