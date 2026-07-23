import { useState } from 'react';
import { Package, Boxes, TrendingUp, Truck, Users, BarChart2 } from 'lucide-react';
import InventoryView from './views/InventoryView';
import ProductionView from './views/ProductionView';
import AllocationsView from './views/AllocationsView';
import SellerRequestsView from './views/SellerRequestsView';
import ShipmentsView from './views/ShipmentsView';
import AnalyticsView from './views/AnalyticsView';
import './FactoryDashboard.css';

const TABS = [
  { id: 'inventory',       label: 'Inventory',       icon: Package,    badge: 142 },
  { id: 'production',      label: 'Production',      icon: Boxes,      badge: 8   },
  { id: 'allocations',     label: 'Allocations',     icon: TrendingUp, badge: 24  },
  { id: 'seller-requests', label: 'Seller Requests', icon: Users,      badge: 5   },
  { id: 'shipments',       label: 'Shipments',       icon: Truck,      badge: 11  },
  { id: 'analytics',       label: 'Analytics',       icon: BarChart2,  badge: undefined },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function FactoryDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('inventory');

  return (
    <div className="fd-container">
      {/* Header */}
      <div className="fd-header">
        <div className="fd-header-info">
          <h1>Factory Dashboard</h1>
          <p>Monitor production, manage inventory, and coordinate shipments</p>
        </div>
      </div>

      {/* Tabs Nav */}
      <nav className="fd-tabs-nav" aria-label="Factory Dashboard Sections">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`fd-tab-${tab.id}`}
              className={`fd-tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              aria-selected={activeTab === tab.id}
            >
              <Icon size={15} aria-hidden="true" />
              {tab.label}
              {tab.badge !== undefined && (
                <span className="fd-tab-badge">{tab.badge}</span>
              )}
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
