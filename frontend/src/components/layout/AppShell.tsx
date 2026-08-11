import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import './layout.css';

export default function AppShell() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Sync fresh verification status on route navigation
  useEffect(() => {
    refreshUser();
  }, [location.pathname, refreshUser]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`vc-app-shell ${collapsed ? 'vc-shell-collapsed' : ''}`}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        user={user}
        onLogout={handleLogout}
      />
      <div className="vc-shell-body">
        <TopNavbar user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="vc-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
