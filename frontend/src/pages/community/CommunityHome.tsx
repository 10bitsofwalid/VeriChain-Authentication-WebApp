import { useState } from 'react';
import { MessageSquare, Users, ShieldAlert, Award, ArrowUp, Search } from 'lucide-react';

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
  
  const [threads, setThreads] = useState<Thread[]>([
    {
      id: '1',
      title: 'How to detect duplicate serial stamps on high-end electronics',
      category: 'guides',
      author: 'Erich Schwarz',
      role: 'moderator',
      replies: 18,
      upvotes: 42,
      time: '2 hours ago'
    },
    {
      id: '2',
      title: 'Urgent: Flagged batch of SKU-HEADPHONE-B from unverified reseller',
      category: 'alert',
      author: 'Alice Johnson',
      role: 'buyer',
      replies: 29,
      upvotes: 112,
      time: '1 day ago'
    },
    {
      id: '3',
      title: 'VeriSphere integration with private EVM subnets discussed',
      category: 'discussion',
      author: 'DevLead Factory',
      role: 'factory',
      replies: 8,
      upvotes: 21,
      time: '3 days ago'
    },
    {
      id: '4',
      title: 'Best practices for storing product digital twin QR certificates',
      category: 'guides',
      author: 'VeriChain Support',
      role: 'admin',
      replies: 5,
      upvotes: 19,
      time: '4 days ago'
    }
  ]);

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
                No threads found matching your filters.
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
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <li style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-xs)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--vc-color-danger-text)', fontWeight: 'bold' }}>RECALL #4092</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Leather Boots Batch E-92</div>
              </li>
              <li>
                <span style={{ fontSize: '0.75rem', color: 'var(--vc-color-danger-text)', fontWeight: 'bold' }}>RECALL #4091</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Wearable Smartwatch Gen‑2</div>
              </li>
            </ul>
          </div>

          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <h3 style={{ margin: '0 0 var(--space-md) 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: 'var(--vc-color-primary)' }} />
              Top Contributors
            </h3>
            <ol style={{ paddingLeft: 'var(--space-md)', margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', fontSize: '0.85rem' }}>
              <li>
                <strong>FactoryCorp_HQ</strong> <span style={{ color: 'var(--vc-color-text-muted)' }}>(524 XP)</span>
              </li>
              <li>
                <strong>SecurityBuyer99</strong> <span style={{ color: 'var(--vc-color-text-muted)' }}>(312 XP)</span>
              </li>
              <li>
                <strong>Alice_Verified</strong> <span style={{ color: 'var(--vc-color-text-muted)' }}>(198 XP)</span>
              </li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
