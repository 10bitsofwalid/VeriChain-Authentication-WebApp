import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, MessageCircle, ShieldCheck, Zap } from 'lucide-react';
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
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="vc-topbar">
        <div className="vc-topbar-left">
          <ActionButton variant="secondary" size="icon" className="vc-menu-button" onClick={onMenuClick} aria-label="Open sidebar" aria-haspopup="true">
            <Menu size={18} />
          </ActionButton>
          <SearchBar onFocus={() => setSearchOpen(true)} />
        </div>

        <div className="vc-topbar-actions">
          <ActionButton variant="primary" size="sm" onClick={() => navigate('/verify')} className="vc-quick-verify-btn">
            <Zap size={15} />
            <span>Quick Verify</span>
          </ActionButton>

          <ActionButton variant="ghost" size="icon" aria-label="Messages" className="vc-icon-btn">
            <MessageCircle size={18} />
          </ActionButton>

          <ActionButton variant="ghost" size="icon" aria-label="Notifications" className="vc-icon-btn">
            <Bell size={18} />
          </ActionButton>

          <CartIcon />

          <div className="vc-topbar-profile" aria-label="Current user">
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
