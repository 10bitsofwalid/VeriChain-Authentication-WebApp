import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Search,
  Shield,
  Users,
  FileText,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  ClipboardList,
} from 'lucide-react';
import { useState } from 'react';
import './Layout.css';
// Import the new CartIcon component
import CartIcon from './CartIcon';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = getNavItems(user?.role || 'buyer');

  return (
    <div className="app-layout">
      {/* Mobile toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => navigate('/dashboard')}>
            <Shield size={24} />
            <span className="logo-text">VeriChain</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <CartIcon />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

interface NavItem {
  to: string;
  label: string;
  icon: any;
  end?: boolean;
}

function getNavItems(role: string): NavItem[] {
  const common: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/dashboard/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { to: '/verify', label: 'Verify Item', icon: Search },
  ];

  const roleSpecific: Record<string, NavItem[]> = {
    factory: [
      { to: '/dashboard/products', label: 'My Products', icon: Package },
      { to: '/dashboard/register-product', label: 'Register Product', icon: ClipboardList },
    ],
    seller: [
      { to: '/dashboard/inventory', label: 'Inventory', icon: ShoppingBag },
    ],
    buyer: [
      { to: '/dashboard/my-items', label: 'My Items', icon: Package },
      { to: '/dashboard/complaints', label: 'Complaints', icon: AlertTriangle },
    ],
    moderator: [
      { to: '/dashboard/product-verification', label: 'Verification Queue', icon: Shield },
      { to: '/dashboard/complaints-moderator', label: 'Complaint Queue', icon: AlertTriangle },
      { to: '/dashboard/fake-listings', label: 'Fake Listings', icon: AlertTriangle },
    ],
    admin: [
      { to: '/dashboard/users', label: 'Users', icon: Users },
      { to: '/dashboard/products-admin', label: 'Products', icon: Package },
      { to: '/dashboard/complaints', label: 'Complaints', icon: AlertTriangle },
      { to: '/dashboard/invite', label: 'Invite Users', icon: FileText },
      { to: '/dashboard/audit-logs', label: 'Audit Logs', icon: FileText },
    ],
  };

  return [...common, ...(roleSpecific[role] || [])];
}
