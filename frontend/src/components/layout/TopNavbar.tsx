import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconBell as Bell,
  IconMenu as Menu,
  IconMessageCircle as MessageCircle,
  IconShieldCheck as ShieldCheck,
  IconBolt as Zap,
  IconSearch as Search,
  IconX as X,
} from '@tabler/icons-react';
import type { User } from '../../context/AuthContext';
import CartIcon from '../CartIcon';
import ActionButton from '../ui/ActionButton';
import StatusChip from '../ui/StatusChip';
import SearchBar from './SearchBar';
import SearchOverlay from './SearchOverlay';
import './layout.css';

interface TopNavbarProps {
  user: User | null;
  onMenuClick: () => void;
}

export default function TopNavbar({ user, onMenuClick }: TopNavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Ledger Consensus Live',
      detail: 'Node cluster running at 100% agreement. VRC-721 token minted.',
      time: 'Just now',
      unread: true,
    },
    {
      id: 'n2',
      title: 'Catalog Security Update',
      detail: 'Zero counterfeit alerts recorded in the past 24 hours.',
      time: '1h ago',
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const handleMessagesClick = () => {
    if (user?.role === 'seller') {
      navigate('/dashboard/inventory?tab=inquiries');
    } else if (user?.role === 'factory') {
      navigate('/factory?tab=seller-requests');
    } else if (user?.role === 'admin') {
      navigate('/dashboard/admin?tab=complaints');
    } else if (user?.role === 'moderator') {
      navigate('/dashboard/complaints-moderator');
    } else {
      navigate('/dashboard/complaints');
    }
  };

  const handleProfileClick = () => {
    if (user?.role === 'buyer') {
      navigate('/buyer/profile');
    } else if (user?.role === 'seller') {
      navigate('/dashboard/inventory?tab=analytics');
    } else if (user?.role === 'factory') {
      navigate('/factory');
    } else if (user?.role === 'admin') {
      navigate('/dashboard/admin?tab=settings');
    } else if (user?.role === 'moderator') {
      navigate('/dashboard/product-verification');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <>
      <header className="vc-topbar">
        <div className="vc-topbar-left">
          <ActionButton variant="secondary" size="icon" className="vc-menu-button" onClick={onMenuClick} aria-label="Open sidebar" aria-haspopup="true">
            <Menu size={18} />
          </ActionButton>
          <SearchBar onFocus={() => setSearchOpen(true)} />
          <button
            type="button"
            className="vc-sidebar-toggle-top vc-mobile-search-btn"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            title="Search (Ctrl+K)"
          >
            <Search size={16} />
          </button>
        </div>

        <div className="vc-topbar-actions">
          <ActionButton variant="primary" size="sm" onClick={() => navigate('/verify')} className="vc-quick-verify-btn">
            <Zap size={15} />
            <span>Quick Verify</span>
          </ActionButton>

          <ActionButton
            variant="ghost"
            size="icon"
            aria-label="Messages"
            className="vc-icon-btn"
            onClick={handleMessagesClick}
            title={user?.role === 'seller' ? 'Buyer Inquiries' : 'Disputes & Inquiries'}
          >
            <MessageCircle size={18} />
          </ActionButton>

          <div style={{ position: 'relative' }} ref={notifRef}>
            <ActionButton
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="vc-icon-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="vc-action-badge">{unreadCount}</span>}
            </ActionButton>

            {notificationsOpen && (
              <div
                className="glass-card animate-fade-in-up"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  width: 320,
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: 'var(--space-md)',
                  zIndex: 200,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>System Notifications</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-purple, #F59E0B)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '2px 4px',
                        }}
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                      No new notifications
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => toggleRead(n.id)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-md)',
                          background: n.unread ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-secondary)',
                          borderLeft: n.unread ? '3px solid #F59E0B' : '3px solid transparent',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</span>
                          <small style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</small>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '3px 0 0', lineHeight: 1.3 }}>
                          {n.detail}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-sm)', fontSize: '0.8rem' }}
                  onClick={() => { setNotificationsOpen(false); navigate('/trust-center'); }}
                >
                  View Trust Center Feed
                </button>
              </div>
            )}
          </div>

          <CartIcon />

          <div
            className="vc-topbar-profile"
            aria-label="Current user"
            onClick={handleProfileClick}
            style={{ cursor: 'pointer' }}
          >
            <div className="vc-avatar vc-avatar-sm">{user?.name?.charAt(0).toUpperCase() || 'V'}</div>
            <span className="vc-topbar-username">{user?.name || 'VeriChain'}</span>
            <StatusChip tone="success">
              <ShieldCheck size={11} />
              <span>{user?.role || 'buyer'}</span>
            </StatusChip>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
