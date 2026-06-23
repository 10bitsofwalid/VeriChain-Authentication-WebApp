export interface RecallAlert {
  id: string;
  productName: string;
  batchId: string;
  reason: string;
  severity: 'Low' | 'Medium' | 'High';
  date: string; // ISO
  status: 'Active' | 'Resolved';
}

export const recallAlerts: RecallAlert[] = [
  {
    id: 'r1',
    productName: 'PureSoap',
    batchId: 'B-1024',
    reason: 'Contamination detected',
    severity: 'High',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Active',
  },
  {
    id: 'r2',
    productName: 'EcoBottle',
    batchId: 'E-2048',
    reason: 'Labeling error',
    severity: 'Medium',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Resolved',
  },
];
