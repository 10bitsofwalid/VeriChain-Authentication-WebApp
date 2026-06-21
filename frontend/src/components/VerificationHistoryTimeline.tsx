import { ShieldCheck } from 'lucide-react';

interface VerificationStep {
  location: string;
  action: string;
  actor: any;
  timestamp: string;
  txHash: string;
}

interface VerificationHistoryTimelineProps {
  history: VerificationStep[];
}

export default function VerificationHistoryTimeline({ history }: VerificationHistoryTimelineProps) {
  // Let's filter verification/manufacture actions
  const auditEvents = history.filter(
    (step) => 
      step.action === 'manufactured' || 
      step.action.includes('verify') || 
      step.action.includes('status_changed')
  );

  if (auditEvents.length === 0) {
    return null;
  }

  return (
    <section className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Verification Audit History</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {auditEvents.map((event, idx) => {
          const actorName = typeof event.actor === 'object' ? event.actor?.name : 'Auditor';
          const formattedDate = new Date(event.timestamp).toLocaleDateString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
          });

          return (
            <div 
              key={idx} 
              style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 'var(--space-sm)',
                padding: 'var(--space-sm)',
                background: 'rgba(0, 88, 188, 0.02)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <ShieldCheck size={18} color="var(--color-success)" style={{ marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {event.action.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formattedDate}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Locality audit checkpoint passed at <strong>{event.location}</strong>. Witnessed by {actorName}.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
