import React, { useEffect, useState } from 'react';
import client from '../api/client';

interface LiveFeedItem {
  id: string;
  productName: string;
  action: string;
  timestamp: string;
}

const TrustCenterFeed: React.FC = () => {
  const [feed, setFeed] = useState<LiveFeedItem[]>([]);

  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await client.get('/items/recently-verified');
        if (res.data?.items && Array.isArray(res.data.items)) {
          const items: LiveFeedItem[] = res.data.items.map((it: any) => ({
            id: it._id,
            productName: it.product?.name || 'Verified Product',
            action: `Verified serial #${it.serialNumber || it._id.slice(-6).toUpperCase()}`,
            timestamp: it.updatedAt || it.createdAt || new Date().toISOString(),
          }));
          setFeed(items);
        }
      } catch {
        setFeed([]);
      }
    }
    loadFeed();
  }, []);

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold mb-4">Live Verification Feed</h2>
      {feed.length === 0 ? (
        <p className="text-gray-400">No recent ledger verifications recorded.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feed.map((event) => (
            <div key={event.id} className="glass-card p-4 animate-fade-in" style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)' }}>
              <p className="font-medium">{event.productName}</p>
              <p className="text-sm text-gray-400">{event.action}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(event.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TrustCenterFeed;
