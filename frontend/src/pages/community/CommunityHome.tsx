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
          client.get('/items/recalls'),
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
          setRecalledItems(itemsRes.value.data.items.slice(0, 5));
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
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* Hero Banner */}
      <div
        className="glass-card"
        style={{
          padding: 'var(--space-xl)',
          marginBottom: 'var(--space-xl)',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, #16233B 0%, #0B0F19 100%)',
          border: '1px solid var(--border-default)',
          color: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xs)' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={28} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>VeriChain Community Hub</h1>
            <p style={{ margin: '4px 0 0', color: '#CBD5E1', fontSize: '0.92rem' }}>
              Discuss product authenticity, review counterfeit reports, and share security practices with verified members.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main thread list */}
        <main style={{ gridColumn: 'span 2' }}>
          {/* Filters and search row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--space-md)',
              marginBottom: 'var(--space-lg)',
            }}
          >
            <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
              {['all', 'discussion', 'alert', 'guides'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-default)',
                    background: activeCategory === cat ? 'var(--accent-purple)' : 'var(--bg-card)',
                    color: activeCategory === cat ? '#0B0F19' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', minWidth: 240, flex: 1, maxWidth: 360 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search community topics..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {filteredThreads.map(thread => (
              <article
                key={thread.id}
                className="glass-card"
                style={{
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  gap: 'var(--space-md)',
                  alignItems: 'flex-start',
                }}
              >
                {/* Vote button */}
                <button
                  onClick={() => handleUpvote(thread.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 44,
                    height: 52,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    flexShrink: 0,
                  }}
                  aria-label={`Upvote. Current score: ${thread.upvotes}`}
                >
                  <ArrowUp size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{thread.upvotes}</span>
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Category badge */}
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      marginBottom: 'var(--space-xs)',
                      background: thread.category === 'alert' ? 'rgba(239, 68, 68, 0.12)' : thread.category === 'guides' ? 'rgba(22, 35, 59, 0.08)' : 'rgba(16, 185, 129, 0.12)',
                      color: thread.category === 'alert' ? '#EF4444' : thread.category === 'guides' ? '#16233B' : '#059669',
                    }}
                  >
                    {thread.category}
                  </span>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 var(--space-xs) 0', color: 'var(--text-primary)' }}>
                    {thread.title}
                  </h3>

                  <div style={{ display: 'flex', gap: 'var(--space-sm)', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>Posted by <strong style={{ color: 'var(--text-secondary)' }}>{thread.author}</strong> ({thread.role})</span>
                    <span>•</span>
                    <span>{thread.time}</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MessageSquare size={12} /> {thread.replies} replies
                    </span>
                  </div>
                </div>
              </article>
            ))}

            {filteredThreads.length === 0 && (
              <div
                className="glass-card"
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-xl)',
                  color: 'var(--text-muted)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                }}
              >
                No active community discussions found matching your filter.
              </div>
            )}
          </div>
        </main>

        {/* Sidebar Alerts */}
        <aside style={{ gridColumn: 'span 1' }}>
          <div className="glass-card" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)' }}>
            <h3 style={{ margin: '0 0 var(--space-md) 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
              <ShieldAlert size={18} style={{ color: 'var(--color-danger)' }} />
              Active Product Recalls
            </h3>
            {recalledItems.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                No active product recalls reported on the ledger.
              </p>
            ) : (
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {recalledItems.map(item => (
                  <li key={item._id} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-xs)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      BATCH #{item.serialNumber || item._id.slice(-6).toUpperCase()}
                    </span>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.product?.name || 'Recalled Product'}</div>
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
