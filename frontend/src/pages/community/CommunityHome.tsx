import { useState, useEffect } from 'react';
import { MessageSquare, Users, ShieldAlert, ArrowUp, Search } from 'lucide-react';
import client from '../../api/client';

interface Thread {
  id: string;
  title: string;
  category: 'discussion' | 'alert' | 'guides';
  author: string;
  role: string;
  replies: number;
  upvotes: number;
  time: string;
}

export default function CommunityHome() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [recalledItems, setRecalledItems] = useState<any[]>([]);

  useEffect(() => {
    async function loadCommunityData() {
      try {
        const [complaintsRes, itemsRes] = await Promise.allSettled([
          client.get('/complaints'),
          client.get('/items/marketplace'),
        ]);

        const threadList: Thread[] = [];

        if (complaintsRes.status === 'fulfilled' && complaintsRes.value.data?.complaints) {
          complaintsRes.value.data.complaints.forEach((c: any) => {
            threadList.push({
              id: c._id,
              title: `Reported Discrepancy: ${c.reason || 'Verification Audit'}`,
              category: 'alert',
              author: c.buyer?.name || 'Verified Buyer',
              role: 'buyer',
              replies: 1,
              upvotes: 2,
              time: new Date(c.createdAt || Date.now()).toLocaleDateString(),
            });
          });
        }

        if (itemsRes.status === 'fulfilled' && Array.isArray(itemsRes.value.data?.items)) {
          const recalled = itemsRes.value.data.items.filter((it: any) => it.status === 'recalled');
          setRecalledItems(recalled.slice(0, 3));
        }

        setThreads(threadList);
      } catch {
        setThreads([]);
        setRecalledItems([]);
      }
    }
    loadCommunityData();
  }, []);

  const handleUpvote = (id: string) => {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, upvotes: t.upvotes + 1 } : t));
  };

  const filteredThreads = threads.filter(t => {
    const matchesCat = activeCategory === 'all' || t.category === activeCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ maxWidth: 'var(--vc-layout-max)', margin: '0 auto', padding: 'var(--space-lg)' }}>
      {/* Hero Banner */}
      <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
          <Users size={36} style={{ color: 'var(--vc-color-success)' }} />
          <h1 style={{ margin: 0, color: 'var(--vc-color-text-primary)' }}>VeriChain Community</h1>
        </div>
        <p style={{ color: 'var(--vc-color-text-secondary)', fontSize: '1.1rem', margin: 0 }}>
          Discuss authenticity, report counterfeit listings, and share security practices with verified buyers and manufacturers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--space-xl)' }}>
        {/* Main thread list */}
        <main>
          {/* Filters and search row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
              {['all', 'discussion', 'alert', 'guides'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: 'var(--space-xs) var(--space-md)',
                    borderRadius: 'var(--vc-radius-full)',
                    border: '1px solid var(--border-default)',
                    background: activeCategory === cat ? 'var(--vc-color-primary)' : 'var(--vc-color-surface)',
                    color: activeCategory === cat ? 'var(--vc-color-text-inverse)' : 'var(--vc-color-text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    textTransform: 'capitalize'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: 'var(--space-sm)', color: 'var(--vc-color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search community posts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-xs) var(--space-sm) var(--space-xs) 2.25rem',
                  borderRadius: 'var(--vc-radius-md)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--vc-color-surface)',
                  color: 'var(--vc-color-text-primary)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {filteredThreads.map(thread => (
              <article key={thread.id} className="glass-card" style={{ padding: 'var(--space-md)', display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start', transition: 'transform 0.2s' }}>
                {/* Vote button */}
                <button
                  onClick={() => handleUpvote(thread.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '42px',
                    height: '48px',
                    borderRadius: 'var(--vc-radius-sm)',
                    background: 'var(--vc-color-surface-muted)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    color: 'var(--vc-color-text-primary)'
                  }}
                  aria-label={`Upvote. Current score: ${thread.upvotes}`}
                >
                  <ArrowUp size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{thread.upvotes}</span>
                </button>

                <div style={{ flex: 1 }}>
                  {/* Category badge */}
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 'var(--vc-radius-full)',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    marginBottom: 'var(--space-xs)',
                    background: thread.category === 'alert' ? 'var(--vc-color-danger-bg)' : thread.category === 'guides' ? 'var(--vc-color-info-bg)' : 'var(--vc-color-success-bg)',
                    color: thread.category === 'alert' ? 'var(--vc-color-danger-text)' : thread.category === 'guides' ? 'var(--vc-color-info-text)' : 'var(--vc-color-success-text)'
                  }}>
                    {thread.category}
                  </span>

                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 var(--space-xs) 0', color: 'var(--vc-color-text-primary)' }}>
                    {thread.title}
                  </h3>

                  <div style={{ display: 'flex', gap: 'var(--space-md)', fontSize: '0.8rem', color: 'var(--vc-color-text-muted)' }}>
                    <span>Posted by <strong>{thread.author}</strong> ({thread.role})</span>
                    <span>•</span>
                    <span>{thread.time}</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MessageSquare size={12} /> {thread.replies} replies
                    </span>
                  </div>
                </div>
              </article>
            ))}

            {filteredThreads.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--vc-color-text-muted)' }}>
                No active community discussions reported.
              </div>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside>
          <div className="glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ margin: '0 0 var(--space-md) 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} style={{ color: 'var(--vc-color-danger)' }} />
              Active Recalls
            </h3>
            {recalledItems.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--vc-color-text-muted)', margin: 0 }}>
                No active product recalls reported.
              </p>
            ) : (
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {recalledItems.map(item => (
                  <li key={item._id} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-xs)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--vc-color-danger-text)', fontWeight: 'bold' }}>
                      BATCH {item.serialNumber || item._id.slice(-6)}
                    </span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.product?.name || 'Recalled Product'}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
