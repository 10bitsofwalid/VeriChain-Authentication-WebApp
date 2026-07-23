import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageLoader from '../../components/ui/PageLoader';
import AlertBanner from '../../components/ui/AlertBanner';
import Modal from '../../components/ui/Modal';
import MetricCard from '../../components/ui/MetricCard';
import { itemStatusBadge } from '../../utils/badges';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastProvider';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Tag,
  Share2,
  Settings,
  Users,
  DollarSign,
  Plus,
  Search,
  Info,
  Calendar,
  MapPin,
  X,
  ShieldCheck,
} from 'lucide-react';
import './SellerDashboard.css';

// ============================================================
// Types Definition
// ============================================================
interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'listed' | 'draft' | 'out_of_stock';
  imageUrl: string;
  authenticityRating: number;
  verifiedCount: number;
  description: string;
}

interface LocationHistory {
  date: string;
  status: string;
  location: string;
  description: string;
}

interface InventoryItem {
  _id: string;
  serialNumber: string;
  productId: string;
  productName: string;
  category: string;
  status: 'manufactured' | 'in_transit' | 'listed' | 'sold' | 'recalled';
  createdAt: string;
  location: string;
  locationHistory: LocationHistory[];
}

interface OrderItem {
  name: string;
  sku: string;
  qty: number;
  price: number;
  serialNumber: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  trackingNumber?: string;
  shippingCarrier?: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  purchasesCount: number;
  totalSpent: number;
  registrationDate: string;
  trustLevel: number;
  verificationChecks: number;
}

// ============================================================
// Mock Data definitions
// ============================================================
const INITIAL_PRODUCTS: Product[] = [
  {
    _id: 'prod-1',
    name: 'Aether Luxe Handbag',
    sku: 'AE-HB-0921',
    category: 'Luxury Goods',
    price: 1850,
    stock: 14,
    status: 'listed',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=300',
    authenticityRating: 99.8,
    verifiedCount: 42,
    description: 'Italian leather luxury handbag featuring smart tag verification and unique blockchain certificate.',
  },
  {
    _id: 'prod-2',
    name: 'Chronos Diver Watch X1',
    sku: 'CH-WD-7741',
    category: 'Watches',
    price: 3200,
    stock: 8,
    status: 'listed',
    imageUrl: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=300',
    authenticityRating: 99.9,
    verifiedCount: 31,
    description: 'Precision mechanical watch with sapphire glass, 200m depth resistance, and secure chip in crown.',
  },
  {
    _id: 'prod-3',
    name: 'Apex Elite Sneakers (Red)',
    sku: 'AP-SK-2290',
    category: 'Apparel & Shoes',
    price: 280,
    stock: 0,
    status: 'out_of_stock',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300',
    authenticityRating: 98.6,
    verifiedCount: 154,
    description: 'Limited edition high-performance athletic footwear with embedded NFC serial chip for resale validation.',
  },
  {
    _id: 'prod-4',
    name: 'Luminescent Serum Glow',
    sku: 'LM-SR-5510',
    category: 'Cosmetics',
    price: 95,
    stock: 45,
    status: 'listed',
    imageUrl: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=80&w=300',
    authenticityRating: 99.4,
    verifiedCount: 78,
    description: 'Bio-active facial serum with anti-aging peptides. Tamper-evident scan code verification.',
  },
  {
    _id: 'prod-5',
    name: 'Elysian Diamond Ring 18K',
    sku: 'EL-RG-8803',
    category: 'Jewelry',
    price: 4500,
    stock: 3,
    status: 'draft',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=300',
    authenticityRating: 100.0,
    verifiedCount: 0,
    description: 'Flawless 0.5ct diamond set in an 18K white gold band with laser-inscribed blockchain registry ID.',
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    _id: 'inv-1',
    serialNumber: 'VC-LUX-2026-0001',
    productId: 'prod-1',
    productName: 'Aether Luxe Handbag',
    category: 'Luxury Goods',
    status: 'listed',
    createdAt: '2026-06-15T09:30:00Z',
    location: 'Central Storage Hub, NY',
    locationHistory: [
      { date: '2026-06-15T09:30:00Z', status: 'manufactured', location: 'Milano Artisan Labs', description: 'Item created and tagged with digital signature.' },
      { date: '2026-06-18T14:20:00Z', status: 'in_transit', location: 'Transit Hub Rome', description: 'Shipped to main seller inventory.' },
      { date: '2026-06-20T11:00:00Z', status: 'listed', location: 'Central Storage Hub, NY', description: 'Received in stock. Listed for sale on VeriChain.' }
    ]
  },
  {
    _id: 'inv-2',
    serialNumber: 'VC-LUX-2026-0002',
    productId: 'prod-1',
    productName: 'Aether Luxe Handbag',
    category: 'Luxury Goods',
    status: 'sold',
    createdAt: '2026-06-15T09:32:00Z',
    location: 'Brooklyn, NY (Customer)',
    locationHistory: [
      { date: '2026-06-15T09:32:00Z', status: 'manufactured', location: 'Milano Artisan Labs', description: 'Item registered on blockchain.' },
      { date: '2026-06-22T08:00:00Z', status: 'listed', location: 'Central Storage Hub, NY', description: 'Listed on Marketplace.' },
      { date: '2026-07-02T16:45:00Z', status: 'sold', location: 'Brooklyn, NY (Customer)', description: 'Delivered to buyer Alice Smith. Authenticity verified by customer.' }
    ]
  },
  {
    _id: 'inv-3',
    serialNumber: 'VC-WCH-2026-4482',
    productId: 'prod-2',
    productName: 'Chronos Diver Watch X1',
    category: 'Watches',
    status: 'listed',
    createdAt: '2026-07-01T10:15:00Z',
    location: 'Central Storage Hub, NY',
    locationHistory: [
      { date: '2026-07-01T10:15:00Z', status: 'manufactured', location: 'Geneva Time Facility', description: 'Cryptographic crown microchip initialized.' },
      { date: '2026-07-05T15:30:00Z', status: 'listed', location: 'Central Storage Hub, NY', description: 'Received and verified by Seller.' }
    ]
  },
  {
    _id: 'inv-4',
    serialNumber: 'VC-SNK-2026-8910',
    productId: 'prod-3',
    productName: 'Apex Elite Sneakers (Red)',
    category: 'Apparel & Shoes',
    status: 'in_transit',
    createdAt: '2026-07-10T12:00:00Z',
    location: 'US Customs, LA Port',
    locationHistory: [
      { date: '2026-07-10T12:00:00Z', status: 'manufactured', location: 'Factory Line 4 - Tokyo', description: 'NFC chip sewn into collar.' },
      { date: '2026-07-15T19:00:00Z', status: 'in_transit', location: 'US Customs, LA Port', description: 'Ocean freight arrival. In transit to seller warehouse.' }
    ]
  },
  {
    _id: 'inv-5',
    serialNumber: 'VC-COS-2026-3023',
    productId: 'prod-4',
    productName: 'Luminescent Serum Glow',
    category: 'Cosmetics',
    status: 'recalled',
    createdAt: '2026-05-20T08:00:00Z',
    location: 'Quarantine Depot, NJ',
    locationHistory: [
      { date: '2026-05-20T08:00:00Z', status: 'manufactured', location: 'CosmoLab France', description: 'Batch verified and packaged.' },
      { date: '2026-05-25T10:00:00Z', status: 'listed', location: 'Central Storage Hub, NY', description: 'Listed on storefront.' },
      { date: '2026-07-18T14:00:00Z', status: 'recalled', location: 'Quarantine Depot, NJ', description: 'Withdrawn due to batch packaging defect. Cryptographic code marked Recalled.' }
    ]
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    _id: 'ord-1001',
    orderNumber: 'VC-ORD-2026-8849',
    buyerName: 'John Doe',
    buyerEmail: 'john.doe@example.com',
    date: '2026-07-22T10:45:00Z',
    total: 375,
    status: 'pending',
    items: [
      { name: 'Luminescent Serum Glow', sku: 'LM-SR-5510', qty: 2, price: 95, serialNumber: 'VC-COS-2026-9041' },
      { name: 'Apex Elite Sneakers (Red)', sku: 'AP-SK-2290', qty: 1, price: 280, serialNumber: 'VC-SNK-2026-5592' }
    ]
  },
  {
    _id: 'ord-1002',
    orderNumber: 'VC-ORD-2026-8850',
    buyerName: 'Alice Smith',
    buyerEmail: 'alice.s@example.com',
    date: '2026-07-21T14:30:00Z',
    total: 1850,
    status: 'shipped',
    trackingNumber: '1Z999AA10123456784',
    shippingCarrier: 'UPS',
    items: [
      { name: 'Aether Luxe Handbag', sku: 'AE-HB-0921', qty: 1, price: 1850, serialNumber: 'VC-LUX-2026-0002' }
    ]
  },
  {
    _id: 'ord-1003',
    orderNumber: 'VC-ORD-2026-8851',
    buyerName: 'Bob Johnson',
    buyerEmail: 'bob.j@example.com',
    date: '2026-07-19T09:15:00Z',
    total: 3200,
    status: 'delivered',
    trackingNumber: 'DH774819200',
    shippingCarrier: 'DHL Express',
    items: [
      { name: 'Chronos Diver Watch X1', sku: 'CH-WD-7741', qty: 1, price: 3200, serialNumber: 'VC-WCH-2026-8192' }
    ]
  },
  {
    _id: 'ord-1004',
    orderNumber: 'VC-ORD-2026-8852',
    buyerName: 'Charlie Brown',
    buyerEmail: 'charlie.b@example.com',
    date: '2026-07-23T11:00:00Z',
    total: 95,
    status: 'processing',
    items: [
      { name: 'Luminescent Serum Glow', sku: 'LM-SR-5510', qty: 1, price: 95, serialNumber: 'VC-COS-2026-3049' }
    ]
  }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    _id: 'cust-1',
    name: 'Alice Smith',
    email: 'alice.s@example.com',
    purchasesCount: 4,
    totalSpent: 4200,
    registrationDate: '2026-02-12',
    trustLevel: 99.5,
    verificationChecks: 12
  },
  {
    _id: 'cust-2',
    name: 'Bob Johnson',
    email: 'bob.j@example.com',
    purchasesCount: 2,
    totalSpent: 3480,
    registrationDate: '2026-03-24',
    trustLevel: 100.0,
    verificationChecks: 6
  },
  {
    _id: 'cust-3',
    name: 'John Doe',
    email: 'john.doe@example.com',
    purchasesCount: 5,
    totalSpent: 1250,
    registrationDate: '2026-01-05',
    trustLevel: 98.2,
    verificationChecks: 18
  },
  {
    _id: 'cust-4',
    name: 'Sarah Connor',
    email: 's.connor@sky.net',
    purchasesCount: 1,
    totalSpent: 1850,
    registrationDate: '2026-05-18',
    trustLevel: 99.9,
    verificationChecks: 4
  }
];

export default function SellerDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'analytics';

  const [loading, setLoading] = useState(true);

  // Stateful databases for demo updates
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers] = useState<Customer[]>(INITIAL_CUSTOMERS);

  // Selected entities for dialogs/drawers
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals visibility
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showFulfillModal, setShowFulfillModal] = useState(false);

  // Search & Filter terms
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryStatus, setInventoryStatus] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('');

  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Luxury Goods',
    sku: '',
    price: 0,
    stock: 10,
    imageUrl: '',
    description: ''
  });

  const [statusVal, setStatusVal] = useState('in_transit');
  const [statusLocation, setStatusLocation] = useState('');
  const [statusDesc, setStatusDesc] = useState('');

  const [transferToUserId, setTransferToUserId] = useState('');
  const [transferLocation, setTransferLocation] = useState('');

  const [orderStatusVal, setOrderStatusVal] = useState<'shipped' | 'delivered'>('shipped');
  const [trackingNum, setTrackingNum] = useState('');
  const [carrier, setCarrier] = useState('FedEx');

  // Simulated Initial Load
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  // ============================================================
  // Handlers for in-memory updates
  // ============================================================

  // 1. Products: Add Product
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku || newProduct.price <= 0) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    const created: Product = {
      _id: `prod-${Date.now()}`,
      name: newProduct.name,
      sku: newProduct.sku,
      category: newProduct.category,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      status: Number(newProduct.stock) > 0 ? 'listed' : 'out_of_stock',
      imageUrl: newProduct.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=300',
      authenticityRating: 100.0,
      verifiedCount: 0,
      description: newProduct.description || 'No description provided.'
    };

    setProducts(prev => [created, ...prev]);
    setShowAddProductModal(false);
    addToast(`Product "${created.name}" registered in catalog.`, 'success');

    // Reset Form
    setNewProduct({
      name: '',
      category: 'Luxury Goods',
      sku: '',
      price: 0,
      stock: 10,
      imageUrl: '',
      description: ''
    });
  };

  // 2. Inventory: Update Status
  const handleUpdateItemStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const timestamp = new Date().toISOString();
    const updatedHistory: LocationHistory = {
      date: timestamp,
      status: statusVal,
      location: statusLocation || 'Seller Warehouse',
      description: statusDesc || `Status updated to ${statusVal.replace('_', ' ')}.`
    };

    setInventory(prev => prev.map(item => {
      if (item._id === selectedItem._id) {
        return {
          ...item,
          status: statusVal as InventoryItem['status'],
          location: statusLocation || item.location,
          locationHistory: [...item.locationHistory, updatedHistory]
        };
      }
      return item;
    }));

    setShowStatusModal(false);
    addToast(`Item ${selectedItem.serialNumber} status updated to ${statusVal.replace('_', ' ')}.`, 'success');
    setSelectedItem(null);
  };

  // 3. Inventory: Transfer Ownership
  const handleTransferOwnership = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !transferToUserId) return;

    const timestamp = new Date().toISOString();
    const updatedHistory: LocationHistory = {
      date: timestamp,
      status: 'sold',
      location: transferLocation || 'Buyer Possession',
      description: `Ownership transferred to Account ID: ${transferToUserId}.`
    };

    setInventory(prev => prev.map(item => {
      if (item._id === selectedItem._id) {
        return {
          ...item,
          status: 'sold',
          location: transferLocation || 'Buyer Destination',
          locationHistory: [...item.locationHistory, updatedHistory]
        };
      }
      return item;
    }));

    setShowTransferModal(false);
    addToast(`Ownership of ${selectedItem.serialNumber} transferred.`, 'success');
    setSelectedItem(null);
  };

  // 4. Orders: Fulfill & Add Tracking
  const handleFulfillOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setOrders(prev => prev.map(order => {
      if (order._id === selectedOrder._id) {
        return {
          ...order,
          status: orderStatusVal,
          trackingNumber: trackingNum || 'VC-TRK-' + Math.floor(Math.random()*1000000),
          shippingCarrier: carrier
        };
      }
      return order;
    }));

    setShowFulfillModal(false);
    addToast(`Order ${selectedOrder.orderNumber} updated to ${orderStatusVal}.`, 'success');
    setSelectedOrder(null);
  };

  if (loading) {
    return <PageLoader />;
  }

  // ============================================================
  // Filters & Analytics Calculation
  // ============================================================
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategory === '' || p.category === productCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.serialNumber.toLowerCase().includes(inventorySearch.toLowerCase()) || item.productName.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesStatus = inventoryStatus === '' || item.status === inventoryStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) || o.buyerName.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatus === '' || o.status === orderStatus;
    return matchesSearch && matchesStatus;
  });

  // Analytics tab metrics
  const activeListings = products.filter(p => p.status === 'listed').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const totalRevenue = orders.filter(o => o.status === 'delivered' || o.status === 'shipped').reduce((sum, o) => sum + o.total, 0);
  const averageAuthenticity = products.reduce((sum, p) => sum + p.authenticityRating, 0) / products.length;

  return (
    <div className="seller-dashboard-container">
      {/* Upper header summary */}
      <div className="page-header">
        <h1>Seller Control Center</h1>
        <p>Manage products catalog, monitor real-time trackable inventory, process orders, and review customer trust metrics.</p>
      </div>

      {user && !user.verified && (
        <AlertBanner
          type="error"
          message={
            <span>
              <strong>Seller Verification Pending:</strong> Your store is pending administrator verification. 
              Certain marketplace operations may be restricted.
            </span>
          }
          style={{ marginBottom: 'var(--space-md)' }}
        />
      )}

      {/* Tabs navigation bar */}
      <div className="seller-tabs-nav">
        <button
          className={`seller-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleTabChange('analytics')}
        >
          <TrendingUp size={16} /> Analytics
        </button>
        <button
          className={`seller-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => handleTabChange('products')}
        >
          <Tag size={16} /> Products Catalog
        </button>
        <button
          className={`seller-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => handleTabChange('inventory')}
        >
          <Package size={16} /> Trackable Inventory
        </button>
        <button
          className={`seller-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => handleTabChange('orders')}
        >
          <ShoppingBag size={16} /> Orders
          {pendingOrdersCount > 0 && <span className="badge badge-warning" style={{ marginLeft: 6 }}>{pendingOrdersCount}</span>}
        </button>
        <button
          className={`seller-tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => handleTabChange('customers')}
        >
          <Users size={16} /> Customers CRM
        </button>
      </div>

      {/* ============================================================
          TAB 1: ANALYTICS
          ============================================================ */}
      {activeTab === 'analytics' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="analytics-grid">
            <MetricCard label="Gross Sales" value={`$${totalRevenue.toLocaleString()}`} icon={<DollarSign size={20} color="var(--accent-cyan)" />} />
            <MetricCard label="Active Listings" value={activeListings} icon={<Tag size={20} color="var(--color-info)" />} />
            <MetricCard label="Pending Fulfillment" value={pendingOrdersCount} icon={<ShoppingBag size={20} color="var(--color-warning)" />} />
            <MetricCard label="Store Authenticity Index" value={`${averageAuthenticity.toFixed(1)}%`} icon={<ShieldCheck size={20} color="var(--accent-cyan)" />} />
          </div>

          <div className="analytics-main-row">
            {/* Sales Chart using SVG */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <h3 className="chart-title">Sales Volume & Authenticity Verifications</h3>
                  <span className="chart-subtitle">Correlation of sales value against blockchain status queries</span>
                </div>
              </div>
              <div className="chart-svg-container">
                <svg viewBox="0 0 500 220" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" className="chart-grid-line" />
                  <line x1="40" y1="70" x2="480" y2="70" className="chart-grid-line" />
                  <line x1="40" y1="120" x2="480" y2="120" className="chart-grid-line" />
                  <line x1="40" y1="170" x2="480" y2="170" className="chart-grid-line" />

                  {/* Shaded Area */}
                  <path d="M 40 170 L 40 130 L 110 110 L 180 150 L 250 80 L 320 60 L 390 120 L 460 40 L 460 170 Z" className="chart-area-path" />

                  {/* Chart Line 1 (Sales) */}
                  <path d="M 40 130 L 110 110 L 180 150 L 250 80 L 320 60 L 390 120 L 460 40" className="chart-line-path" />

                  {/* Verification Dots (Second line indicator) */}
                  <path d="M 40 150 L 110 135 L 180 160 L 250 100 L 320 90 L 390 130 L 460 65" fill="none" stroke="var(--color-info)" strokeWidth="2.5" strokeDasharray="3 3" />

                  {/* Data Points */}
                  <circle cx="40" cy="130" r="5" className="chart-point" />
                  <circle cx="110" cy="110" r="5" className="chart-point" />
                  <circle cx="180" cy="150" r="5" className="chart-point" />
                  <circle cx="250" cy="80" r="5" className="chart-point" />
                  <circle cx="320" cy="60" r="5" className="chart-point" />
                  <circle cx="390" cy="120" r="5" className="chart-point" />
                  <circle cx="460" cy="40" r="5" className="chart-point" />

                  {/* Labels */}
                  <text x="35" y="195" className="chart-axis-text">Mon</text>
                  <text x="105" y="195" className="chart-axis-text">Tue</text>
                  <text x="175" y="195" className="chart-axis-text">Wed</text>
                  <text x="245" y="195" className="chart-axis-text">Thu</text>
                  <text x="315" y="195" className="chart-axis-text">Fri</text>
                  <text x="385" y="195" className="chart-axis-text">Sat</text>
                  <text x="455" y="195" className="chart-axis-text">Sun</text>

                  <text x="15" y="24" className="chart-axis-text">$10k</text>
                  <text x="15" y="74" className="chart-axis-text">$5k</text>
                  <text x="15" y="124" className="chart-axis-text">$2k</text>
                  <text x="15" y="174" className="chart-axis-text">$0</text>
                </svg>
              </div>
            </div>

            {/* Distribution */}
            <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="chart-header">
                <div>
                  <h3 className="chart-title">Category Share</h3>
                  <span className="chart-subtitle">Store product classification</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap', marginTop: 12 }}>
                <svg className="donut-svg">
                  <circle cx="80" cy="80" r="60" className="donut-center" />
                  <circle cx="80" cy="80" r="60" className="donut-segment" stroke="var(--accent-cyan)" strokeWidth="18" strokeDasharray="140 376.8" strokeDashoffset="0" />
                  <circle cx="80" cy="80" r="60" className="donut-segment" stroke="var(--color-info)" strokeWidth="18" strokeDasharray="100 376.8" strokeDashoffset="-140" />
                  <circle cx="80" cy="80" r="60" className="donut-segment" stroke="#f59e0b" strokeWidth="18" strokeDasharray="80 376.8" strokeDashoffset="-240" />
                  <circle cx="80" cy="80" r="60" className="donut-segment" stroke="#10b981" strokeWidth="18" strokeDasharray="56.8 376.8" strokeDashoffset="-320" />
                </svg>
                <div className="donut-legend">
                  <div className="legend-item">
                    <span><span className="legend-color-dot" style={{ backgroundColor: 'var(--accent-cyan)' }} />Luxury Goods</span>
                    <strong>40%</strong>
                  </div>
                  <div className="legend-item">
                    <span><span className="legend-color-dot" style={{ backgroundColor: 'var(--color-info)' }} />Watches</span>
                    <strong>27%</strong>
                  </div>
                  <div className="legend-item">
                    <span><span className="legend-color-dot" style={{ backgroundColor: '#f59e0b' }} />Apparel</span>
                    <strong>20%</strong>
                  </div>
                  <div className="legend-item">
                    <span><span className="legend-color-dot" style={{ backgroundColor: '#10b981' }} />Cosmetics</span>
                    <strong>13%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Blockchain check log */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Real-time Verification Stream</h3>
              <span className="badge badge-success">Live Blockchain Checks</span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Serial Number</th>
                    <th>Product</th>
                    <th>Verifier Location</th>
                    <th>Result</th>
                    <th>Time Checked</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code style={{ color: 'var(--accent-cyan)' }}>VC-LUX-2026-0002</code></td>
                    <td>Aether Luxe Handbag</td>
                    <td>New York, US</td>
                    <td><span className="badge badge-success">✓ Authentic</span></td>
                    <td>2 mins ago</td>
                  </tr>
                  <tr>
                    <td><code style={{ color: 'var(--accent-cyan)' }}>VC-SNK-2026-8910</code></td>
                    <td>Apex Elite Sneakers (Red)</td>
                    <td>Los Angeles, US</td>
                    <td><span className="badge badge-success">✓ Authentic</span></td>
                    <td>45 mins ago</td>
                  </tr>
                  <tr>
                    <td><code style={{ color: 'var(--accent-cyan)' }}>VC-WCH-2026-4482</code></td>
                    <td>Chronos Diver Watch X1</td>
                    <td>Geneva, CH</td>
                    <td><span className="badge badge-success">✓ Authentic</span></td>
                    <td>3 hours ago</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: PRODUCTS
          ============================================================ */}
      {activeTab === 'products' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="seller-control-bar">
            <div className="search-filter-group">
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search catalog by name or SKU..."
                  className="form-input"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                />
              </div>
              <select
                className="form-select"
                style={{ width: '160px' }}
                value={productCategory}
                onChange={e => setProductCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Luxury Goods">Luxury Goods</option>
                <option value="Watches">Watches</option>
                <option value="Apparel & Shoes">Apparel & Shoes</option>
                <option value="Cosmetics">Cosmetics</option>
                <option value="Jewelry">Jewelry</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddProductModal(true)}>
              <Plus size={16} /> Add Product Catalog
            </button>
          </div>

          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product._id} className="seller-product-card">
                <div className="product-image-container">
                  <img src={product.imageUrl} alt={product.name} />
                  <div className="product-authenticity-badge">
                    <ShieldCheck size={13} color="var(--accent-cyan)" />
                    {product.authenticityRating}% Trust
                  </div>
                </div>
                <div className="product-details-body">
                  <span className="product-category-label">{product.category}</span>
                  <h3 className="product-title-text">{product.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="product-sku-code">{product.sku}</span>
                    <span className={`badge ${product.status === 'listed' ? 'badge-success' : product.status === 'out_of_stock' ? 'badge-danger' : 'badge-warning'}`}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="product-stats-row">
                    <span>Stock: <strong>{product.stock} units</strong></span>
                    <span>Verified: <strong>{product.verifiedCount} units</strong></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-sm)' }}>
                    <span className="product-price-tag">${product.price.toLocaleString()}</span>
                    <button className="btn btn-sm btn-secondary" onClick={() => setSelectedProduct(product)}>
                      Manage Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-state glass-card" style={{ padding: 'var(--space-3xl)' }}>
              <Package size={48} />
              <h3>No Products Found</h3>
              <p>Try resetting filters or registering a new item onto the catalog.</p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          TAB 3: TRACKABLE INVENTORY
          ============================================================ */}
      {activeTab === 'inventory' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="seller-control-bar">
            <div className="search-filter-group">
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search serial number or product name..."
                  className="form-input"
                  value={inventorySearch}
                  onChange={e => setInventorySearch(e.target.value)}
                />
              </div>
              <select
                className="form-select"
                style={{ width: '160px' }}
                value={inventoryStatus}
                onChange={e => setInventoryStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="manufactured">Manufactured</option>
                <option value="in_transit">In Transit</option>
                <option value="listed">Listed</option>
                <option value="sold">Sold</option>
                <option value="recalled">Recalled</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Current Location</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => (
                  <tr key={item._id}>
                    <td>
                      <button
                        style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-cyan)', fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => setSelectedItem(item)}
                      >
                        {item.serialNumber}
                      </button>
                    </td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.productName}</td>
                    <td>{item.category}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <MapPin size={12} color="var(--text-muted)" /> {item.location}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${itemStatusBadge(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      {item.status !== 'recalled' && item.status !== 'sold' && (
                        <div style={{ display: 'inline-flex', gap: 'var(--space-xs)' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              setSelectedItem(item);
                              setStatusVal(item.status);
                              setStatusLocation(item.location);
                              setStatusDesc('');
                              setShowStatusModal(true);
                            }}
                          >
                            <Settings size={12} /> Status
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              setSelectedItem(item);
                              setTransferToUserId('');
                              setTransferLocation('');
                              setShowTransferModal(true);
                            }}
                          >
                            <Share2 size={12} /> Transfer
                          </button>
                        </div>
                      )}
                      {(item.status === 'recalled' || item.status === 'sold') && (
                        <button className="btn btn-sm btn-secondary" onClick={() => setSelectedItem(item)}>
                          <Info size={12} /> View Journey
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredInventory.length === 0 && (
              <div className="empty-state glass-card" style={{ padding: 'var(--space-3xl)' }}>
                <Package size={48} />
                <h3>No Inventory Items Found</h3>
                <p>Verify your search query or check with production lines.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 4: ORDERS
          ============================================================ */}
      {activeTab === 'orders' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="seller-control-bar">
            <div className="search-filter-group">
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search orders by Order Number or Customer..."
                  className="form-input"
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                />
              </div>
              <select
                className="form-select"
                style={{ width: '160px' }}
                value={orderStatus}
                onChange={e => setOrderStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="order-cards-grid">
            {filteredOrders.map(order => (
              <div key={order._id} className="order-row-card">
                <div>
                  <span className="order-id-badge">{order.orderNumber}</span>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>
                    <Calendar size={10} style={{ marginRight: 4, display: 'inline' }} />
                    {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div>
                  <span className="order-buyer-name">{order.buyerName}</span>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{order.buyerEmail}</div>
                </div>

                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </span>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                    {order.items.map(i => i.name).join(', ')}
                  </div>
                </div>

                <div>
                  <span style={{ fontWeight: 800 }}>${order.total.toLocaleString()}</span>
                </div>

                <div>
                  <span className={`status-pill ${order.status}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-actions-cell" style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => setSelectedOrder(order)}>
                    Details
                  </button>

                  {(order.status === 'pending' || order.status === 'processing') && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setSelectedOrder(order);
                        setOrderStatusVal('shipped');
                        setTrackingNum('');
                        setShowFulfillModal(true);
                      }}
                    >
                      Ship Order
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="empty-state glass-card" style={{ padding: 'var(--space-3xl)' }}>
                <ShoppingBag size={48} />
                <h3>No Orders Found</h3>
                <p>No transactions fit the search criteria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 5: CUSTOMERS CRM
          ============================================================ */}
      {activeTab === 'customers' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="customers-table-container table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Registered</th>
                  <th>Purchases</th>
                  <th>Total Spent</th>
                  <th>Blockchain Scans</th>
                  <th>Trust Score</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer._id}>
                    <td className="customer-avatar-cell">
                      <div className="customer-mini-avatar">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>{customer.name}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{customer.email}</div>
                      </div>
                    </td>
                    <td>{new Date(customer.registrationDate).toLocaleDateString()}</td>
                    <td>{customer.purchasesCount} orders</td>
                    <td style={{ fontWeight: 700 }}>${customer.totalSpent.toLocaleString()}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <ShieldCheck size={13} color="var(--accent-cyan)" /> {customer.verificationChecks} times
                      </span>
                    </td>
                    <td>
                      <div className="customer-trust-indicator">
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{customer.trustLevel}%</span>
                        <div className="trust-level-meter">
                          <div
                            className="trust-level-fill"
                            style={{
                              width: `${customer.trustLevel}%`,
                              backgroundColor: customer.trustLevel >= 99 ? 'var(--accent-cyan)' : 'var(--color-warning)'
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => addToast(`Customer contact simulation initiated for ${customer.name}`, 'info')}>
                        Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          MODALS & OVERLAYS (STATE DRIVEN)
          ============================================================ */}

      {/* MODAL 1: ADD PRODUCT */}
      <Modal open={showAddProductModal} onClose={() => setShowAddProductModal(false)} title="Register Product to Store Catalog">
        <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="prod-name">Product Name *</label>
            <input
              id="prod-name"
              type="text"
              className="form-input"
              placeholder="e.g. Luminescent Serum"
              value={newProduct.name}
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-sku">SKU Code *</label>
              <input
                id="prod-sku"
                type="text"
                className="form-input"
                placeholder="e.g. LM-SR-5510"
                value={newProduct.sku}
                onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-cat">Category</label>
              <select
                id="prod-cat"
                className="form-select"
                value={newProduct.category}
                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
              >
                <option value="Luxury Goods">Luxury Goods</option>
                <option value="Watches">Watches</option>
                <option value="Apparel & Shoes">Apparel & Shoes</option>
                <option value="Cosmetics">Cosmetics</option>
                <option value="Jewelry">Jewelry</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-price">Retail Price ($) *</label>
              <input
                id="prod-price"
                type="number"
                className="form-input"
                placeholder="e.g. 299"
                value={newProduct.price || ''}
                onChange={e => setNewProduct({ ...newProduct, price: Math.max(0, Number(e.target.value)) })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-stock">Initial Stock Quantity</label>
              <input
                id="prod-stock"
                type="number"
                className="form-input"
                placeholder="e.g. 10"
                value={newProduct.stock}
                onChange={e => setNewProduct({ ...newProduct, stock: Math.max(0, Number(e.target.value)) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prod-img">Image URL</label>
            <input
              id="prod-img"
              type="url"
              className="form-input"
              placeholder="Leave blank for placeholder image"
              value={newProduct.imageUrl}
              onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prod-desc">Product Description</label>
            <textarea
              id="prod-desc"
              rows={3}
              className="form-input"
              placeholder="Provide key details for buyer information"
              value={newProduct.description}
              onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddProductModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Catalog Item
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: INVENTORY CHANGE STATUS */}
      <Modal open={showStatusModal && !!selectedItem} onClose={() => { setShowStatusModal(false); setSelectedItem(null); }} title="Update Item Blockchain Status">
        {selectedItem && (
          <form onSubmit={handleUpdateItemStatus} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'rgba(193, 198, 215, 0.08)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
              Item: <strong>{selectedItem.productName}</strong><br />
              Serial: <code style={{ color: 'var(--accent-cyan)' }}>{selectedItem.serialNumber}</code>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="inv-status">Select New Status</label>
              <select
                id="inv-status"
                className="form-select"
                value={statusVal}
                onChange={e => setStatusVal(e.target.value)}
                required
              >
                <option value="manufactured">Manufactured (In warehouse/facility)</option>
                <option value="in_transit">In Transit (Logistics/shipping stage)</option>
                <option value="listed">Listed (For sale on public catalog)</option>
                <option value="recalled">Recalled (Revoked from circulation)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="inv-loc">Current Location</label>
              <input
                id="inv-loc"
                type="text"
                className="form-input"
                placeholder="e.g. Distribution Center, NY"
                value={statusLocation}
                onChange={e => setStatusLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="inv-desc">Tracking Description / Notes</label>
              <input
                id="inv-desc"
                type="text"
                className="form-input"
                placeholder="e.g. Cleared customs, checked by seller"
                value={statusDesc}
                onChange={e => setStatusDesc(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowStatusModal(false); setSelectedItem(null); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update Ledger Record
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 3: TRANSFER OWNERSHIP */}
      <Modal open={showTransferModal && !!selectedItem} onClose={() => { setShowTransferModal(false); setSelectedItem(null); }} title="Transfer Item Blockchain Ownership">
        {selectedItem && (
          <form onSubmit={handleTransferOwnership} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'rgba(193, 198, 215, 0.08)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
              Item: <strong>{selectedItem.productName}</strong><br />
              Serial: <code style={{ color: 'var(--accent-cyan)' }}>{selectedItem.serialNumber}</code>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tr-user">Recipient Wallet / System Account ID *</label>
              <input
                id="tr-user"
                type="text"
                className="form-input"
                placeholder="Enter buyer email or Account ID"
                value={transferToUserId}
                onChange={e => setTransferToUserId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tr-loc">Handover Location</label>
              <input
                id="tr-loc"
                type="text"
                className="form-input"
                placeholder="e.g. Retail Counter Manhattan"
                value={transferLocation}
                onChange={e => setTransferLocation(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowTransferModal(false); setSelectedItem(null); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={!transferToUserId}>
                Confirm Ownership Transfer
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 4: FULFILL ORDER */}
      <Modal open={showFulfillModal && !!selectedOrder} onClose={() => { setShowFulfillModal(false); setSelectedOrder(null); }} title="Fulfill & Ship Order">
        {selectedOrder && (
          <form onSubmit={handleFulfillOrder} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'rgba(193, 198, 215, 0.08)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
              Order: <strong>{selectedOrder.orderNumber}</strong><br />
              Customer: <span>{selectedOrder.buyerName}</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ord-st-select">Action</label>
              <select
                id="ord-st-select"
                className="form-select"
                value={orderStatusVal}
                onChange={e => setOrderStatusVal(e.target.value as any)}
              >
                <option value="shipped">Mark Shipped (Shipment Dispatched)</option>
                <option value="delivered">Mark Delivered (In-person Handover / Completed)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ord-carrier">Carrier</label>
                <select
                  id="ord-carrier"
                  className="form-select"
                  value={carrier}
                  onChange={e => setCarrier(e.target.value)}
                >
                  <option value="FedEx">FedEx</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="UPS">UPS</option>
                  <option value="USPS">USPS</option>
                  <option value="Local Courier">Local Delivery</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ord-trk">Tracking Code</label>
                <input
                  id="ord-trk"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 1Z999AA10123..."
                  value={trackingNum}
                  onChange={e => setTrackingNum(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowFulfillModal(false); setSelectedOrder(null); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Fulfill Order
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ============================================================
          SLIDEOUT DETAILS DRAWER / SIDE OVERLAYS
          ============================================================ */}

      {/* DRAWER 1: INVENTORY ITEM DETAILS & LIFECYCLE JOURNEY */}
      {selectedItem && !showStatusModal && !showTransferModal && (
        <div className="details-drawer-overlay" onClick={() => setSelectedItem(null)}>
          <div className="details-drawer-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Item Lifecycle</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedItem(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'rgba(193, 198, 215, 0.08)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Serial Number</div>
              <code style={{ fontSize: '15px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{selectedItem.serialNumber}</code>

              <div style={{ marginTop: 'var(--space-sm)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Product Model:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedItem.productName}</div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Blockchain Provenance Record</h3>
              <div className="item-history-timeline">
                {selectedItem.locationHistory.map((step, idx) => (
                  <div key={idx} className="timeline-step completed">
                    <div className="timeline-step-dot" />
                    <div className="timeline-step-header">
                      <span>{step.status.replace('_', ' ').toUpperCase()}</span>
                      <span className="timeline-step-time">
                        {new Date(step.date).toLocaleDateString()} {new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={10} /> {step.location}
                    </div>
                    <div className="timeline-step-desc">{step.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {selectedItem.status !== 'recalled' && selectedItem.status !== 'sold' && (
              <div style={{ marginTop: 'auto', display: 'flex', gap: 'var(--space-sm)' }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setStatusVal(selectedItem.status);
                    setStatusLocation(selectedItem.location);
                    setStatusDesc('');
                    setShowStatusModal(true);
                  }}
                >
                  Update Status
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setTransferToUserId('');
                    setTransferLocation('');
                    setShowTransferModal(true);
                  }}
                >
                  Transfer ownership
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DRAWER 2: ORDER DETAILS & PACKING SLIP */}
      {selectedOrder && !showFulfillModal && (
        <div className="details-drawer-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="details-drawer-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Order Details</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="order-id-badge">{selectedOrder.orderNumber}</span>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>
                  Ordered on {new Date(selectedOrder.date).toLocaleDateString()}
                </div>
              </div>
              <span className={`status-pill ${selectedOrder.status}`}>{selectedOrder.status}</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 'var(--space-md)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>Customer Information</h3>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>{selectedOrder.buyerName}</strong><br />
                {selectedOrder.buyerEmail}
              </div>
            </div>

            {selectedOrder.trackingNumber && (
              <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ fontSize: '12px', display: 'block', color: 'var(--text-secondary)' }}>Logistics Details:</strong>
                <span style={{ fontSize: '13px' }}>Carrier: <strong>{selectedOrder.shippingCarrier}</strong></span><br />
                <span style={{ fontSize: '13px' }}>Tracking Code: <strong style={{ color: 'var(--accent-cyan)' }}>{selectedOrder.trackingNumber}</strong></span>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 'var(--space-md)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Purchased Items</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {selectedOrder.items.map((i, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px dashed var(--border-default)', paddingBottom: 'var(--space-xs)' }}>
                    <div>
                      <strong>{i.name}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SKU: {i.sku}</div>
                      <div style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>Serial Tag: <code>{i.serialNumber}</code></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>{i.qty} x ${i.price}</div>
                      <strong style={{ color: 'var(--text-primary)' }}>${i.qty * i.price}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, marginTop: 'var(--space-md)' }}>
              <span>Total Price</span>
              <span>${selectedOrder.total.toLocaleString()}</span>
            </div>

            {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
              <div style={{ marginTop: 'auto' }}>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setOrderStatusVal('shipped');
                    setTrackingNum('');
                    setShowFulfillModal(true);
                  }}
                >
                  Ship & Generate Blockchain Tags
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DRAWER 3: PRODUCT CATALOG DETAILS */}
      {selectedProduct && (
        <div className="details-drawer-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="details-drawer-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Product Profile</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedProduct(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="product-image-container" style={{ borderRadius: 'var(--radius-md)' }}>
              <img src={selectedProduct.imageUrl} alt={selectedProduct.name} />
            </div>

            <div>
              <span className="product-category-label">{selectedProduct.category}</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedProduct.name}</h3>
              <code style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{selectedProduct.sku}</code>
            </div>

            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>Description</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{selectedProduct.description}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', padding: 'var(--space-md) 0' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Standard Retail Price:</span>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>${selectedProduct.price.toLocaleString()}</div>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Warehouse Stock Level:</span>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{selectedProduct.stock} units</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="var(--accent-cyan)" />
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Platform Integrity Rating:</span>
                <strong style={{ fontSize: '14px' }}>{selectedProduct.authenticityRating}% Authentic ({selectedProduct.verifiedCount} verified units)</strong>
              </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <button
                className="btn btn-secondary"
                style={{ width: '100%' }}
                onClick={() => {
                  setInventorySearch(selectedProduct.sku);
                  setInventoryStatus('');
                  handleTabChange('inventory');
                  setSelectedProduct(null);
                }}
              >
                View Trackable Units of SKU
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
