import { NavLink, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tags,
  UserCircle,
  Users,
  X,
  ClipboardList,
  AlertTriangle,
  FileText,
  Bot,
} from 'lucide-react';
import type { User } from '../../context/AuthContext';
import StatusChip from '../ui/StatusChip';
import './layout.css';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export default function Sidebar({ open, onClose, user, onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const navItems = getNavItems(user?.role || 'buyer');

  return (
    <>
      <aside className={`vc-sidebar ${open ? 'vc-sidebar-open' : ''}`} aria-label="Primary navigation" aria-expanded={open}>
        <div className="vc-sidebar-header">
          <button className="vc-brand" onClick={() => navigate('/dashboard')} type="button">
            <span className="vc-brand-mark">
              <ShieldCheck size={22} aria-hidden="true" />
            </span>
            <span>
              <strong>VeriChain</strong>
              <small>Authenticity cloud</small>
            </span>
          </button>
          <button className="vc-sidebar-close" onClick={onClose} type="button" aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <nav className="vc-sidebar-nav">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {navItems.map((item) => (
              <li key={`${item.to}-${item.label}`}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `vc-nav-item ${isActive ? 'vc-nav-active' : ''}`}
                  onClick={onClose}
                >
                  <item.icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="vc-sidebar-trust">
          <span>Platform trust</span>
          <strong>98.7%</strong>
          <div className="vc-trust-meter" aria-hidden="true">
            <span />
          </div>
        </div>

        <div className="vc-sidebar-footer">
          <div className="vc-user-pill">
            <div className="vc-avatar">{user?.name?.charAt(0).toUpperCase() || 'V'}</div>
            <div>
              <strong>{user?.name || 'VeriChain user'}</strong>
              <StatusChip tone="info">{user?.role || 'buyer'}</StatusChip>
            </div>
          </div>
          <button className="vc-logout" onClick={onLogout} type="button" aria-label="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      {open && <button className="vc-sidebar-scrim" onClick={onClose} type="button" aria-label="Close sidebar" />}
    </>
  );
}

function getNavItems(role: string): NavItem[] {
  const common: NavItem[] = [
    { to: '/dashboard/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { to: '/verify', label: 'Verify Product', icon: Search },
    { to: '/dashboard/marketplace', label: 'Categories', icon: Tags },
    { to: '/trust-center', label: 'Trust Center', icon: Shield },
    { to: '/dashboard/ai', label: 'AI Center', icon: Bot },
    { to: '/dashboard/community', label: 'Community', icon: Users },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  ];

  const roleSpecific: Record<string, NavItem[]> = {
    factory: [
      { to: '/dashboard/products', label: 'My Products', icon: Package },
      { to: '/dashboard/register-product', label: 'Register Product', icon: ClipboardList },
    ],
    seller: [
      { to: '/dashboard/inventory', label: 'My Products', icon: Store },
      { to: '/seller/sourcing', label: 'Seller Sourcing', icon: ClipboardList },
    ],
    buyer: [
      { to: '/dashboard/my-items', label: 'My Products', icon: Package },
      { to: '/dashboard/complaints', label: 'Complaints', icon: AlertTriangle },
    ],
    moderator: [
      { to: '/dashboard/product-verification', label: 'Verification Queue', icon: Shield },
      { to: '/dashboard/complaints-moderator', label: 'Reports', icon: AlertTriangle },
      { to: '/dashboard/fake-listings', label: 'Approvals', icon: FileText },
    ],
    admin: [
      { to: '/dashboard/users', label: 'Users', icon: Users },
      { to: '/dashboard/products-admin', label: 'Products', icon: Package },
      { to: '/dashboard/invite', label: 'Invitations', icon: FileText },
      { to: '/dashboard/audit-logs', label: 'Audit Logs', icon: FileText },
    ],
  };

  const utility: NavItem[] = [
    { to: '/dashboard', label: 'Notifications', icon: Bell },
    { to: '/dashboard', label: 'Profile', icon: UserCircle },
    { to: '/dashboard', label: 'Settings', icon: Settings },
  ];

  return [...common, ...(roleSpecific[role] || []), ...utility];
}
