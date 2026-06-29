import React from 'react';
import { Clock, Heart, ShoppingCart, CheckCircle, XCircle, Archive } from 'lucide-react';

/**
 * Activity entry interface (flexible for various activity types)
 */
interface ActivityEntry {
  id: string;
  type: 'save_factory' | 'reserve_product' | 'request_submitted' | 'request_approved' | 'request_rejected';
  timestamp: string; // ISO string
  // Payload varies by type
  payload: Record<string, any>;
}

interface ActivityTimelineProps {
  activityLog: ActivityEntry[];
}

/**
 * Card‑style timeline component that displays activity entries with subtle shadows
 * and hover effects. Timestamp is displayed in full date‑time format.
 */
const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activityLog }) => {
  // Sort entries newest first
  const sorted = [...activityLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const renderIcon = (type: ActivityEntry['type']) => {
    switch (type) {
      case 'save_factory':
        return <Heart size={20} />;
      case 'reserve_product':
        return <Archive size={20} />;
      case 'request_submitted':
        return <ShoppingCart size={20} />;
      case 'request_approved':
        return <CheckCircle size={20} color="var(--accent-success)" />;
      case 'request_rejected':
        return <XCircle size={20} color="var(--accent-danger)" />;
      default:
        return <Clock size={20} />;
    }
  };

  const renderMessage = (entry: ActivityEntry) => {
    const { type, payload } = entry;
    switch (type) {
      case 'save_factory':
        return payload.saved
          ? `Saved supplier "${payload.factoryName}" to favorites.`
          : `Removed supplier "${payload.factoryName}" from favorites.`;
      case 'reserve_product':
        return payload.reserved
          ? `Reserved product "${payload.productName}" (Batch ${payload.batchId}).`
          : `Cancelled reservation for "${payload.productName}".`;
      case 'request_submitted':
        return `Requested ${payload.qty} units of "${payload.productName}" from ${payload.factoryName}.`;
      case 'request_approved':
        return `Allocation request for "${payload.productName}" approved.`;
      case 'request_rejected':
        return `Allocation request for "${payload.productName}" rejected.`;
      default:
        return '';
    }
  };

  return (
    <section className="activity-timeline" style={{ marginTop: 'var(--space-2xl)' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
        Activity Timeline
      </h2>
      <div className="timeline-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {sorted.map((entry) => (
          <div
            key={entry.id}
            className="glass-card activity-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              padding: 'var(--space-md)',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-default)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ color: 'var(--accent-cyan)' }}>{renderIcon(entry.type)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{renderMessage(entry)}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {new Date(entry.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <div className="glass-card" style={{ padding: 'var(--space-md)', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No recent activity.
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivityTimeline;
