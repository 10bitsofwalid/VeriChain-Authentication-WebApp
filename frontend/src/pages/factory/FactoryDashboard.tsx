import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  IconPackage as Package,
  IconPackages as Boxes,
  IconTrendingUp as TrendingUp,
  IconTruck as Truck,
  IconUsers as Users,
  IconChartBar as BarChart2,
} from '@tabler/icons-react';
import InventoryView from './views/InventoryView';
import ProductionView from './views/ProductionView';
import AllocationsView from './views/AllocationsView';
import SellerRequestsView from './views/SellerRequestsView';
import ShipmentsView from './views/ShipmentsView';
import AnalyticsView from './views/AnalyticsView';
import AlertBanner from '../../components/ui/AlertBanner';
import { useAuth } from '../../context/AuthContext';
import './FactoryDashboard.css';

const TABS = [
  { id: 'inventory',       label: 'Inventory',       icon: Package },
  { id: 'production',      label: 'Production',      icon: Boxes },
  { id: 'allocations',     label: 'Allocations',     icon: TrendingUp },
  { id: 'seller-requests', label: 'Seller Requests', icon: Users },
  { id: 'shipments',       label: 'Shipments',       icon: Truck },
  { id: 'analytics',       label: 'Analytics',       icon: BarChart2 },
] as const;

type TabId = (typeof TABS)[number]['id'];

const VALID_TABS: TabId[] = ['inventory', 'production', 'allocations', 'seller-requests', 'shipments', 'analytics'];

export default function FactoryDashboard() {
  const { user, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') as TabId;
  const initialTab: TabId = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'inventory';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  useEffect(() => {
    refreshUser?.();
  }, [refreshUser]);

  useEffect(() => {
    const currentTab = searchParams.get('tab') as TabId;
    if (currentTab && VALID_TABS.includes(currentTab) && currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="fd-container">
      {/* Header */}
      <div className="fd-header">
        <div className="fd-header-info">
          <h1>Factory Dashboard</h1>
          <p>Monitor production, manage inventory, and coordinate shipments</p>
        </div>
      </div>

      {user && !(user.verified || user.isVerified) && (
        <AlertBanner
          type="error"
          message={
            <span>
              <strong>Manufacturer Verification Pending:</strong> Your factory account is pending administrator verification. 
              Certain manufacturing batches and dispatch actions may be restricted until verified.
            </span>
          }
          style={{ marginBottom: 'var(--space-md)' }}
        />
      )}

      {/* Tabs Nav */}
      <nav className="fd-tabs-nav" aria-label="Factory Dashboard Sections">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`fd-tab-${tab.id}`}
              className={`fd-tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
              type="button"
              aria-selected={activeTab === tab.id}
            >
              <Icon size={15} aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Tab Panel */}
      <div className="fd-panel" key={activeTab}>
        {activeTab === 'inventory'       && <InventoryView />}
        {activeTab === 'production'      && <ProductionView />}
        {activeTab === 'allocations'     && <AllocationsView />}
        {activeTab === 'seller-requests' && <SellerRequestsView />}
        {activeTab === 'shipments'       && <ShipmentsView />}
        {activeTab === 'analytics'       && <AnalyticsView />}
      </div>
    </div>
  );
}
