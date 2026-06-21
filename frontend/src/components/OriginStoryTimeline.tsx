import { MapPin, User, Cpu } from 'lucide-react';

interface JourneyStep {
  location: string;
  action: string;
  actor: {
    _id: string;
    name: string;
    role: string;
  } | string;
  timestamp: string;
  txHash: string;
}

interface OriginStoryTimelineProps {
  journey: JourneyStep[];
}

export default function OriginStoryTimeline({ journey }: OriginStoryTimelineProps) {
  if (!journey || journey.length === 0) {
    return (
      <section className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Asset Journey</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No journey steps recorded.</p>
      </section>
    );
  }

  return (
    <section className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>Asset Custody Journey</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', position: 'relative', paddingLeft: '24px' }}>
        {/* Vertical line connecting steps */}
        <div 
          style={{
            position: 'absolute',
            left: '8px',
            top: '8px',
            bottom: '8px',
            width: '2px',
            background: 'linear-gradient(to bottom, var(--accent-cyan), var(--border-default))'
          }}
        />

        {journey.map((step, idx) => {
          const formattedDate = new Date(step.timestamp).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
          });

          const actorName = typeof step.actor === 'object' ? step.actor?.name : 'Platform Actor';
          const actorRole = typeof step.actor === 'object' ? step.actor?.role : 'system';

          return (
            <div key={idx} style={{ position: 'relative' }}>
              {/* Point on timeline */}
              <div 
                style={{
                  position: 'absolute',
                  left: '-22px',
                  top: '4px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'var(--accent-cyan)',
                  border: '3px solid #ffffff',
                  boxShadow: '0 0 0 3px rgba(0, 88, 188, 0.2)'
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {step.action.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formattedDate}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="var(--text-muted)" /> {step.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} color="var(--text-muted)" /> {actorName} ({actorRole})
                  </span>
                </div>

                {step.txHash && (
                  <div style={{ marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Cpu size={10} color="var(--text-muted)" />
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                      Tx: {step.txHash.slice(0, 20)}...
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
