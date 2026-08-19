import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  ShoppingCart,
  Heart,
  History,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  BarChart2,
  Boxes,
  Truck,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import type { User } from '../../context/AuthContext';
import StatusChip from '../ui/StatusChip';
import logoSvg from '../../assets/logo.svg';
import './layout.css';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  user: User | null;
  onLogout: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  end?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export default function Sidebar({
  open,
  onClose,
  collapsed = false,
  onToggleCollapse,
  user,
  onLogout,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const navSections = getNavSections(user?.role || 'buyer');

  const isItemActive = (to: string, end?: boolean) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    const [targetPath, targetSearch] = to.split('?');

    if (targetSearch) {
      if (currentPath !== targetPath) return false;
      const targetKey = targetSearch.split('=')[0];
      if (targetKey === 'category') {
        return currentSearch.includes('category=');
      }
      return currentSearch.includes(targetSearch);
    }

    if (currentPath !== targetPath) {
      return !end && currentPath.startsWith(targetPath + '/');
    }

    if (currentSearch && (currentSearch.includes('category=') || currentSearch.includes('tab='))) {
      return false;
    }

    return true;
  };

  return (
    <>
      <aside
        className={`vc-sidebar ${open ? 'vc-sidebar-open' : ''} ${collapsed ? 'vc-sidebar-collapsed' : ''}`}
        aria-label="Primary navigation"
        aria-expanded={open}
      >
        {/* Sidebar Header with Brand Logo & Toggle Button */}
        <div className="vc-sidebar-header">
          <button className="vc-brand" onClick={() => navigate('/dashboard')} type="button" title="VeriChain Cloud">
            <span className="vc-brand-mark" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
              <img
                src={logoSvg}
                alt="VeriChain"
                width={collapsed ? 36 : 42}
                height={collapsed ? 36 : 42}
                style={{ width: collapsed ? 36 : 42, height: collapsed ? 36 : 42, borderRadius: '50%', objectFit: 'contain' }}
              />
            </span>
            {!collapsed && (
              <span className="vc-brand-text">
                <strong>VeriChain</strong>
                <small>Authenticity Cloud</small>
              </span>
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {onToggleCollapse && (
              <button
                className="vc-sidebar-toggle-btn"
                onClick={onToggleCollapse}
                type="button"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            )}
            <button className="vc-sidebar-close" onClick={onClose} type="button" aria-label="Close sidebar">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="vc-sidebar-nav">
          {navSections.map((section, sIdx) => (
            <div key={section.title || `section-${sIdx}`} className="vc-nav-group">
              {section.title && !collapsed && (
                <div className="vc-nav-section-title">{section.title}</div>
              )}
              {collapsed && section.title && <div className="vc-nav-divider" />}
              <ul className="vc-nav-list">
                {section.items.map((item) => {
                  const active = isItemActive(item.to, item.end);
                  return (
                    <li key={`${item.to}-${item.label}`}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={`vc-nav-item ${active ? 'vc-nav-active' : ''}`}
                        onClick={onClose}
                        title={collapsed ? item.label : undefined}
                      >
                        <item.icon size={18} className="vc-nav-icon" aria-hidden="true" />
                        {!collapsed && <span className="vc-nav-label">{item.label}</span>}
                        {item.badge !== undefined && (
                          <span className={`vc-nav-badge ${collapsed ? 'badge-dot' : ''}`}>
                            {collapsed ? '' : item.badge}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Network & Ledger Status Card */}
        <div className="vc-sidebar-trust">
          {!collapsed ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Ledger Network</span>
                <span className="vc-trust-badge">Active</span>
              </div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--accent-purple)' }}>VRC-721 Consensus</strong>
              <div className="vc-trust-meter" aria-hidden="true">
                <span style={{ width: '100%' }} />
              </div>
            </>
          ) : (
            <div className="vc-trust-compact" title="Ledger Network: Active (Consensus 100%)">
              <ShieldCheck size={18} color="#10B981" />
              <small style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10B981' }}>Live</small>
            </div>
          )}
        </div>

        {/* User Footer Profile Pill */}
        <div className="vc-sidebar-footer">
          <div className="vc-user-pill">
            <div className="vc-avatar">{user?.name?.charAt(0).toUpperCase() || 'V'}</div>
            {!collapsed && (
              <div className="vc-user-info">
                <strong>{user?.name || 'VeriChain User'}</strong>
                <StatusChip tone="info">{user?.role || 'buyer'}</StatusChip>
              </div>
            )}
          </div>
          <button className="vc-logout" onClick={onLogout} type="button" aria-label="Logout" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {open && <button className="vc-sidebar-scrim" onClick={onClose} type="button" aria-label="Close sidebar" />}
    </>
  );
}

function getNavSections(role: string): NavSection[] {
  const platformSection: NavSection = {
    title: 'PLATFORM',
    items: [
      { to: '/dashboard/marketplace', label: 'Marketplace', icon: ShoppingBag },
      { to: '/verify', label: 'Verify Product', icon: Search },
      { to: '/dashboard/marketplace?category=all', label: 'Categories', icon: Tags },
      { to: '/trust-center', label: 'Trust Center', icon: Shield },
      { to: '/dashboard/recalls', label: 'Recall Management', icon: AlertTriangle },
      { to: '/dashboard/order-management', label: 'Order Management', icon: ClipboardList },
      { to: '/dashboard/ai', label: 'AI Center', icon: Bot },
      { to: '/dashboard/community', label: 'Community', icon: Users },
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  };

  const buyerSection: NavSection = {
    title: 'BUYER EXPERIENCE',
    items: [
      { to: '/buyer/cart', label: 'Cart', icon: ShoppingCart },
      { to: '/buyer/checkout', label: 'Checkout', icon: CreditCard },
      { to: '/buyer/orders', label: 'Orders', icon: Package },
      { to: '/buyer/wishlist', label: 'Wishlist', icon: Heart },
      { to: '/buyer/purchase-history', label: 'Purchase History', icon: History },
      { to: '/dashboard/my-items', label: 'My Products', icon: Package },
      { to: '/dashboard/complaints', label: 'Complaints', icon: AlertTriangle },
    ],
  };

  const roleSpecificSections: Record<string, NavSection> = {
    factory: {
      title: 'FACTORY WORKSPACE',
      items: [
        { to: '/factory', label: 'Factory Dashboard', icon: LayoutDashboard, end: true },
        { to: '/factory?tab=inventory', label: 'Inventory', icon: Boxes },
        { to: '/factory?tab=production', label: 'Production', icon: TrendingUp },
        { to: '/factory?tab=shipments', label: 'Shipments', icon: Truck },
        { to: '/factory?tab=analytics', label: 'Analytics', icon: BarChart2 },
        { to: '/dashboard/register-product', label: 'Register Product', icon: ClipboardList },
      ],
    },
    seller: {
      title: 'SELLER WORKSPACE',
      items: [
        { to: '/dashboard/inventory?tab=analytics', label: 'Analytics', icon: LayoutDashboard },
        { to: '/dashboard/inventory?tab=listings', label: 'Marketplace Listings', icon: Store },
        { to: '/dashboard/inventory?tab=inquiries', label: 'Buyer Inquiries', icon: MessageSquare },
        { to: '/dashboard/inventory?tab=products', label: 'Products Catalog', icon: Tags },
        { to: '/dashboard/inventory?tab=inventory', label: 'Inventory', icon: Boxes },
        { to: '/dashboard/inventory?tab=orders', label: 'Orders', icon: ShoppingBag },
        { to: '/dashboard/inventory?tab=customers', label: 'Customers', icon: Users },
        { to: '/seller/sourcing', label: 'Seller Sourcing', icon: ClipboardList },
      ],
    },
    moderator: {
      title: 'MODERATION WORKSPACE',
      items: [
        { to: '/dashboard/product-verification', label: 'Verification Queue', icon: Shield },
        { to: '/dashboard/complaints-moderator', label: 'Reports', icon: AlertTriangle },
        { to: '/dashboard/fake-listings', label: 'Approvals', icon: FileText },
      ],
    },
    admin: {
      title: 'ADMIN WORKSPACE',
      items: [
        { to: '/dashboard/admin?tab=mission', label: 'Mission', icon: Shield },
        { to: '/dashboard/admin?tab=users', label: 'Users', icon: Users },
        { to: '/dashboard/admin?tab=complaints', label: 'Complaints', icon: AlertTriangle },
        { to: '/dashboard/admin?tab=moderation', label: 'Moderation', icon: ShieldCheck },
        { to: '/dashboard/admin?tab=reports', label: 'Reports', icon: FileText },
        { to: '/dashboard/admin?tab=statistics', label: 'Statistics', icon: BarChart2 },
        { to: '/dashboard/admin?tab=settings', label: 'Settings', icon: Settings },
        { to: '/dashboard/audit-logs', label: 'Audit Logs', icon: FileText },
      ],
    },
  };

  const getSettingsRoute = (r: string) => {
    switch (r) {
      case 'seller': return '/dashboard/inventory?tab=analytics';
      case 'factory': return '/factory';
      case 'admin': return '/dashboard/admin?tab=settings';
      case 'moderator': return '/dashboard/product-verification';
      case 'buyer':
      default:
        return '/buyer/profile';
    }
  };

  const accountSection: NavSection = {
    title: 'ACCOUNT',
    items: [
      { to: '/trust-center', label: 'Notifications', icon: Bell },
      { to: '/buyer/profile', label: 'Profile', icon: UserCircle },
      { to: getSettingsRoute(role), label: 'Settings', icon: Settings },
    ],
  };

  const roleSection = roleSpecificSections[role] || (role === 'buyer' ? buyerSection : undefined);

  if (role === 'buyer') {
    return [platformSection, buyerSection, accountSection];
  }

  return roleSection
    ? [platformSection, roleSection, accountSection]
    : [platformSection, accountSection];
}
