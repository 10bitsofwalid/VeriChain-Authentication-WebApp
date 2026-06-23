import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface VerificationTimelineProps {
  history: any[]; // expects same shape as VerificationHistoryTimeline
}

export default function VerificationTimeline({ history }: VerificationTimelineProps) {
  const created = history.find((x) => x.action === 'created');
  const firstVerify = history.find((x) => x.action.includes('verify'))?.timestamp;
  const recent = history[history.length - 1];
  const count = history.filter((x) => x.action.includes('verify')).length;

  return (
    <section className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
        Verification Timeline
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <div>Created: {created ? new Date(created.timestamp).toLocaleDateString() : '—'}</div>
        <div>First Verification: {firstVerify ? new Date(firstVerify).toLocaleDateString() : '—'}</div>
        <div>Recent Verification: {recent ? new Date(recent.timestamp).toLocaleDateString() : '—'}</div>
        <div>Verification Count: {count}</div>
      </div>
    </section>
  );
}
