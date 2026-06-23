import React from 'react';
import { verificationFeed, FeedEvent } from '../mock/verificationFeed';

const TrustCenterFeed: React.FC = () => {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold mb-4">Live Verification Feed</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {verificationFeed.map((event: FeedEvent) => (
          <div key={event.id} className="glass-card p-4 animate-fade-in" style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)' }}>
            <p className="font-medium">{event.productName}</p>
            <p className="text-sm text-gray-400">{event.action}</p>
            <p className="text-xs text-gray-500 mt-1">{new Date(event.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustCenterFeed;
