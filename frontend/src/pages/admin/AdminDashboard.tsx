import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminMissionView from './views/AdminMissionView';
import AdminUsersView from './views/AdminUsersView';
import AdminComplaintsView from './views/AdminComplaintsView';
import AdminModerationView from './views/AdminModerationView';
import AdminReportsView from './views/AdminReportsView';
import AdminStatisticsView from './views/AdminStatisticsView';
import AdminSettingsView from './views/AdminSettingsView';
import client from '../../api/client';
import './AdminDashboard.css';

import {
  ShieldCheck,
  Target,
  Users,
  AlertTriangle,
  ShieldAlert,
  FileText,
  BarChart2,
  Settings,
  Sparkles,
} from 'lucide-react';

export type AdminTab =
  | 'mission'
  | 'users'
  | 'complaints'
  | 'moderation'
  | 'reports'
  | 'statistics'
  | 'settings';

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab State with URL query param sync (?tab=users, etc.)
  const initialTab = (searchParams.get('tab') as AdminTab) || 'mission';
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [badgeCounts, setBadgeCounts] = useState<{ complaints: number; moderation: number }>({ complaints: 0, moderation: 0 });

  useEffect(() => {
    const currentTab = searchParams.get('tab') as AdminTab;
    if (currentTab && currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams, activeTab]);

  useEffect(() => {
    async function loadBadges() {
      try {
        const [dashRes, compRes] = await Promise.allSettled([
          client.get('/admin/dashboard'),
          client.get('/complaints'),
        ]);

        let moderation = 0;
        let complaints = 0;

        if (dashRes.status === 'fulfilled' && dashRes.value.data?.dashboard) {
          moderation = dashRes.value.data.dashboard.pendingVerifications || 0;
        }

        if (compRes.status === 'fulfilled' && Array.isArray(compRes.value.data?.complaints)) {
          complaints = compRes.value.data.complaints.filter((c: any) => c.status !== 'resolved').length;
        }

        setBadgeCounts({ complaints, moderation });
      } catch {
        // Keep zero
      }
    }
    loadBadges();
  }, []);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const navItems = [
    { id: 'mission' as AdminTab, label: 'Mission', icon: Target },
    { id: 'users' as AdminTab, label: 'Users', icon: Users },
    { id: 'complaints' as AdminTab, label: 'Complaints', icon: AlertTriangle, badge: badgeCounts.complaints > 0 ? badgeCounts.complaints.toString() : undefined },
    { id: 'moderation' as AdminTab, label: 'Moderation', icon: ShieldAlert, badge: badgeCounts.moderation > 0 ? badgeCounts.moderation.toString() : undefined },
    { id: 'reports' as AdminTab, label: 'Reports', icon: FileText },
    { id: 'statistics' as AdminTab, label: 'Statistics', icon: BarChart2 },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="admin-dashboard-container">
      {/* Admin Header Banner */}
      <div className="admin-header-banner">
        <div className="admin-header-title">
          <div className="admin-header-icon">
            <ShieldCheck size={28} />
          </div>
          <div className="admin-header-text">
            <h1>Admin Operations Center</h1>
            <p>VeriChain Global Authenticity Control & Governance Portal</p>
          </div>
        </div>

        <div className="admin-header-badges">
          <div className="admin-status-pill online">
            <span className="admin-pulse-dot" />
            <span>Consensus Cluster Active</span>
          </div>
          <div className="admin-status-pill" style={{ background: 'var(--accent-bg)', color: 'var(--accent-purple)', borderColor: 'var(--accent-border)' }}>
            <Sparkles size={14} />
            <span>AI Moderation V2.4</span>
          </div>
        </div>
      </div>

      {/* Admin Tabs Navigation */}
      <nav className="admin-tabs-nav" aria-label="Admin Sections Navigation">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`admin-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleTabChange(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="admin-tab-badge">{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      {/* Main View Display */}
      <main className="admin-main-content">
        {activeTab === 'mission' && <AdminMissionView />}
        {activeTab === 'users' && <AdminUsersView />}
        {activeTab === 'complaints' && <AdminComplaintsView />}
        {activeTab === 'moderation' && <AdminModerationView />}
        {activeTab === 'reports' && <AdminReportsView />}
        {activeTab === 'statistics' && <AdminStatisticsView />}
        {activeTab === 'settings' && <AdminSettingsView />}
      </main>
    </div>
  );
}
