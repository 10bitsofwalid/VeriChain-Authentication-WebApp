import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IconMessage as MessageSquare,
  IconUsers as Users,
  IconShieldExclamation as ShieldAlert,
  IconArrowUp as ArrowUp,
  IconSearch as Search,
  IconPlus as Plus,
  IconSend as Send,
} from '@tabler/icons-react';
import client from '../../api/client';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';

interface ThreadReply {
  id: string;
  author: string;
  role: string;
  time: string;
  text: string;
}

interface Thread {
  id: string;
  title: string;
  category: 'discussion' | 'alert' | 'guides';
  author: string;
  role: string;
  content: string;
  replies: number;
  upvotes: number;
  time: string;
  repliesList?: ThreadReply[];
}

const DEFAULT_SEEDED_THREADS: Thread[] = [
  {
    id: 'seed-guide-1',
    title: 'Comprehensive Guide: Verifying Holographic NFC & Cryptographic Signatures',
    category: 'guides',
    author: 'VeriChain Protocol Team',
    role: 'moderator',
    content: 'When evaluating luxury items or serialized electronics, always inspect the holographic QR tag for continuous cryptographic mint hashes. Scans on the VeriChain mainnet will verify block depth and manufacturer signature integrity instantly.',
    replies: 3,
    upvotes: 24,
    time: 'Aug 18, 2026',
    repliesList: [
      { id: 'r1', author: 'Elena Rostova', role: 'buyer', time: 'Aug 18, 2026', text: 'This guide helped me identify an untrusted third-party resale batch immediately.' },
      { id: 'r2', author: 'Marcus Vance', role: 'seller', time: 'Aug 19, 2026', text: 'We include this direct verification checklist with all dispatched orders.' }
    ]
  },
  {
    id: 'seed-disc-1',
    title: 'Best Practices for Batch Custody Handover in High-Value Distribution',
    category: 'discussion',
    author: 'Geneva Horology Logistics',
    role: 'factory',
    content: 'What are the recommended procedures for updating tracking status when third-party couriers use sub-contractors? We require multisig sign-off before marking custody as in-transit.',
    replies: 2,
    upvotes: 15,
    time: 'Aug 17, 2026',
    repliesList: [
      { id: 'r3', author: 'Apex Supply Systems', role: 'seller', time: 'Aug 18, 2026', text: 'We enforce automated carrier API sync on our dispatch hubs to maintain continuous custody logs.' }
    ]
  },
  {
    id: 'seed-guide-2',
    title: 'Spotting Counterfeit Packaging Patterns: Micro-print and Texture Analysis',
    category: 'guides',
    author: 'Quality Assurance Lab',
    role: 'admin',
    content: 'Counterfeiters frequently miss the micro-engraved serial patterns on security labels. Cross-reference the optical texture against the high-resolution reference images in your VeriChain product verification panel.',
    replies: 1,
    upvotes: 19,
    time: 'Aug 16, 2026',
    repliesList: [
      { id: 'r4', author: 'Sarah Jenkins', role: 'buyer', time: 'Aug 17, 2026', text: 'Super helpful details on the label seal inspection.' }
    ]
  }
];

export default function CommunityHome() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [recalledItems, setRecalledItems] = useState<any[]>([]);

  // Discussion Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'discussion' | 'alert' | 'guides'>('discussion');
  const [newContent, setNewContent] = useState('');

  // Selected thread view
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    async function loadCommunityData() {
      try {
        const [complaintsRes, itemsRes] = await Promise.allSettled([
          client.get('/complaints'),
          client.get('/items/recalls'),
        ]);

        const threadList: Thread[] = [...DEFAULT_SEEDED_THREADS];

        if (complaintsRes.status === 'fulfilled' && complaintsRes.value.data?.complaints) {
          complaintsRes.value.data.complaints.forEach((c: any) => {
            threadList.push({
              id: c._id,
              title: `Reported Discrepancy: ${c.reason || 'Verification Audit'}`,
              category: 'alert',
              author: c.buyer?.name || 'Verified Buyer',
              role: 'buyer',
              content: c.details || c.description || 'Discrepancy reported regarding item authenticity or custody log during verification scan.',
              replies: 1,
              upvotes: 4,
              time: new Date(c.createdAt || Date.now()).toLocaleDateString(),
              repliesList: [
                {
                  id: `reply-${c._id}`,
                  author: 'VeriChain Moderator',
                  role: 'moderator',
                  time: 'Recently',
                  text: 'Case registered with chain escrow authority. Ledger evidence is being examined.'
                }
              ]
            });
          });
        }

        if (itemsRes.status === 'fulfilled' && Array.isArray(itemsRes.value.data?.items)) {
          setRecalledItems(itemsRes.value.data.items.slice(0, 5));
        }

        setThreads(threadList);
      } catch {
        setThreads(DEFAULT_SEEDED_THREADS);
        setRecalledItems([]);
      }
    }
    loadCommunityData();
  }, []);

  const handleUpvote = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setThreads(prev => prev.map(t => t.id === id ? { ...t, upvotes: t.upvotes + 1 } : t));
    if (selectedThread && selectedThread.id === id) {
      setSelectedThread(prev => prev ? { ...prev, upvotes: prev.upvotes + 1 } : null);
    }
  };

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newThread: Thread = {
      id: `thread-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      author: user?.name || 'Verified Member',
      role: user?.role || 'buyer',
      content: newContent.trim(),
      replies: 0,
      upvotes: 1,
      time: 'Just now',
      repliesList: []
    };

    setThreads([newThread, ...threads]);
    setNewTitle('');
    setNewContent('');
    setShowCreateModal(false);
    setSelectedThread(newThread);
  };

  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedThread) return;

    const newReply: ThreadReply = {
      id: `rep-${Date.now()}`,
      author: user?.name || 'Verified Member',
      role: user?.role || 'buyer',
      time: 'Just now',
      text: replyText.trim()
    };

    const updatedReplies = [...(selectedThread.repliesList || []), newReply];
    const updatedThread = {
      ...selectedThread,
      replies: selectedThread.replies + 1,
      repliesList: updatedReplies
    };

    setSelectedThread(updatedThread);
    setThreads(prev => prev.map(t => t.id === selectedThread.id ? updatedThread : t));
    setReplyText('');
  };

  const filteredThreads = threads.filter(t => {
    const matchesCat = activeCategory === 'all' || t.category === activeCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.content.toLowerCase().includes(searchQuery.toLowerCase());
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
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

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 700 }}
        >
          <Plus size={16} /> Start Discussion
        </button>
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
                onClick={() => setSelectedThread(thread)}
                style={{
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  gap: 'var(--space-md)',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                {/* Vote button */}
                <button
                  onClick={(e) => handleUpvote(thread.id, e)}
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

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 var(--space-xs) 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {thread.content}
                  </p>

                  <div style={{ display: 'flex', gap: 'var(--space-sm)', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span>Posted by <strong style={{ color: 'var(--text-secondary)' }}>{thread.author}</strong> ({thread.role})</span>
                    <span>•</span>
                    <span>{thread.time}</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MessageSquare size={12} /> {thread.replies} {thread.replies === 1 ? 'reply' : 'replies'}
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
                    <Link
                      to={`/verify?serial=${encodeURIComponent(item.serialNumber || item._id)}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <span style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 800, fontFamily: 'var(--font-mono)', display: 'block' }}>
                        BATCH #{item.serialNumber || item._id.slice(-6).toUpperCase()} →
                      </span>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.product?.name || 'Recalled Product'}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* CREATE THREAD MODAL */}
      {showCreateModal && (
        <Modal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Start Community Discussion"
          maxWidth="540px"
        >
          <form onSubmit={handleCreateThread} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                Topic Category
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['discussion', 'alert', 'guides'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCategory(cat)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: newCategory === cat ? '1px solid var(--accent-purple)' : '1px solid var(--border-default)',
                      background: newCategory === cat ? 'var(--accent-purple)' : 'var(--bg-secondary)',
                      color: newCategory === cat ? '#0B0F19' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      textTransform: 'capitalize',
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                Discussion Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Custody transfer best practices for serialized jewelry"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                Details & Context
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe your inquiry, report details, or verification insights..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 'var(--space-sm)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Publish Topic
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* THREAD DETAILS & REPLIES MODAL */}
      {selectedThread && (
        <Modal
          open={!!selectedThread}
          onClose={() => setSelectedThread(null)}
          title={selectedThread.title}
          maxWidth="680px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  background: selectedThread.category === 'alert' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: selectedThread.category === 'alert' ? '#EF4444' : '#059669',
                }}
              >
                {selectedThread.category}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Posted by <strong style={{ color: 'var(--text-primary)' }}>{selectedThread.author}</strong> ({selectedThread.role}) • {selectedThread.time}
              </span>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, background: 'var(--bg-secondary)', padding: 'var(--space-md)', borderRadius: '8px' }}>
              {selectedThread.content}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleUpvote(selectedThread.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <ArrowUp size={14} /> Upvote ({selectedThread.upvotes})
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <MessageSquare size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                {selectedThread.repliesList?.length || 0} Replies
              </span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: 'var(--space-xs) 0' }} />

            {/* Replies List */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Responses & Community Insight
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', maxHeight: 240, overflowY: 'auto' }}>
              {(selectedThread.repliesList && selectedThread.repliesList.length > 0) ? (
                selectedThread.repliesList.map(rep => (
                  <div
                    key={rep.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{rep.author} <small style={{ color: 'var(--text-muted)' }}>({rep.role})</small></strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rep.time}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{rep.text}</p>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '8px 0' }}>
                  No responses yet. Be the first to add verified insight!
                </p>
              )}
            </div>

            {/* Reply Box */}
            <form onSubmit={handlePostReply} style={{ display: 'flex', gap: '8px', marginTop: 'var(--space-xs)' }}>
              <input
                type="text"
                required
                placeholder="Write a verified community reply..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Send size={13} /> Reply
              </button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
