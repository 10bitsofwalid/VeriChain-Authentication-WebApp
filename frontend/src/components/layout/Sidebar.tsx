import { useState } from 'react';
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
} from 'lucide-react';
import type { User } from '../../context/AuthContext';
import StatusChip from '../ui/StatusChip';
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
  const navSections = getNavSections(user?.role || 'buyer');

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
            <span className="vc-brand-mark">
              <ShieldCheck size={22} aria-hidden="true" />
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
                {section.items.map((item) => (
                  <li key={`${item.to}-${item.label}`}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) => `vc-nav-item ${isActive ? 'vc-nav-active' : ''}`}
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
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Platform Trust Meter Card */}
        <div className="vc-sidebar-trust">
          {!collapsed ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Platform Trust</span>
                <span className="vc-trust-badge">Verified</span>
              </div>
              <strong>98.7%</strong>
              <div className="vc-trust-meter" aria-hidden="true">
                <span style={{ width: '98.7%' }} />
              </div>
            </>
          ) : (
            <div className="vc-trust-compact" title="Platform Trust: 98.7%">
              <ShieldCheck size={18} color="var(--accent-primary)" />
              <small style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>98%</small>
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
      { to: '/dashboard/marketplace', label: 'Categories', icon: Tags },
      { to: '/trust-center', label: 'Trust Center', icon: Shield },
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
        { to: '/dashboard/inventory?tab=products', label: 'Products', icon: Tags },
        { to: '/dashboard/inventory?tab=inventory', label: 'Inventory', icon: Store },
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
        { to: '/dashboard/users', label: 'Users', icon: Users },
        { to: '/dashboard/products-admin', label: 'Products', icon: Package },
        { to: '/dashboard/invite', label: 'Invitations', icon: FileText },
        { to: '/dashboard/audit-logs', label: 'Audit Logs', icon: FileText },
      ],
    },
  };

  const accountSection: NavSection = {
    title: 'ACCOUNT',
    items: [
      { to: '/dashboard', label: 'Notifications', icon: Bell, badge: '5' },
      { to: '/buyer/profile', label: 'Profile', icon: UserCircle },
      { to: '/dashboard', label: 'Settings', icon: Settings },
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
