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
          <ActionButton variant="primary" size="sm" onClick={() => navigate('/verify')}>
            <Zap size={15} />
            Quick Verify
          </ActionButton>
          <ActionButton variant="ghost" size="icon" aria-label="Messages">
            <MessageCircle size={18} />
          </ActionButton>
          <ActionButton variant="ghost" size="icon" aria-label="Notifications">
            <Bell size={18} />
          </ActionButton>
          <CartIcon />
          <div className="vc-topbar-profile" aria-label="Current user">
            <div className="vc-avatar vc-avatar-sm">{user?.name?.charAt(0).toUpperCase() || 'V'}</div>
            <div>
              <strong>{user?.name || 'VeriChain'}</strong>
              <StatusChip tone="success">
                <ShieldCheck size={12} />
                {user?.role || 'buyer'}
              </StatusChip>
            </div>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
