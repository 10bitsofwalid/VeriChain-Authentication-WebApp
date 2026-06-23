import React from 'react';

interface OwnershipTimelineProps {
  milestones: { label: string; date?: string }[];
}

export default function OwnershipTimeline({ milestones }: OwnershipTimelineProps) {
  return (
    <section className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
        Ownership Timeline
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {milestones.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{m.label}</span>
            <span>{m.date ?? '—'}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
