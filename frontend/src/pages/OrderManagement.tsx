import { useState } from 'react';
import {
  User,
  Store,
  Factory,
  Truck,
  Activity,
  Package,
  ShieldCheck,
  Check,
  Clock,
  RefreshCw,
  Download,
  Share2,
  Lock,
} from 'lucide-react';
import './OrderManagement.css';

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

interface OrderData {
  id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusLabel: string;
  progressPercent: number;
  authenticityScore: number;
  blockNumber: string;
  transactionHash: string;
  createdDate: string;

  buyer: {
    name: string;
    email: string;
    phone: string;
    avatarInitials: string;
    verified: boolean;
    shippingAddress: string;
    billingAddress: string;
    paymentMethod: string;
    paymentStatus: string;
  };

  seller: {
    id: string;
    name: string;
    avatarInitials: string;
    verified: boolean;
    tier: string;
    rating: string;
    reviewCount: number;
    dispatchFacility: string;
    fulfillmentRate: string;
    supportEmail: string;
  };

  factory: {
    id: string;
    name: string;
    location: string;
    batchHash: string;
    nfcTag: string;
    manufacturedDate: string;
    qcScore: string;
    certification: string;
    defectRate: string;
  };

  shipment: {
    carrier: string;
    trackingId: string;
    estDelivery: string;
    currentLocation: string;
    steps: {
      title: string;
      time: string;
      status: 'done' | 'active' | 'pending';
    }[];
  };

  items: OrderItem[];

  timeline: {
    id: string;
    type: 'buyer' | 'seller' | 'factory' | 'ship' | 'system';
    title: string;
    timestamp: string;
    actor: string;
    tag: string;
    details?: string;
  }[];
}

const MOCK_ORDERS: OrderData[] = [
  {
    id: 'ORD-9821-VX',
    status: 'shipped',
    statusLabel: 'In Transit',
    progressPercent: 75,
    authenticityScore: 99.9,
    blockNumber: '#18,492,011',
    transactionHash: '0x8f2a9c4b7e1d3f6a5b8c9d0e1f2a3b4c5d6e7f8a',
    createdDate: 'Oct 14, 2025, 08:45 AM',

    buyer: {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+1 (555) 234-5678',
      avatarInitials: 'JD',
      verified: true,
      shippingAddress: '142 Tech Boulevard, Suite 400, San Francisco, CA 94107',
      billingAddress: 'Same as shipping address',
      paymentMethod: 'Visa •••• 4242',
      paymentStatus: 'Paid ($1,299.00)',
    },

    seller: {
      id: 'SEL-88204',
      name: 'Apex Luxe Authorized',
      avatarInitials: 'AL',
      verified: true,
      tier: 'Gold Tier Seller',
      rating: '4.95',
      reviewCount: 1420,
      dispatchFacility: 'Seller Hub West, Bay 4B',
      fulfillmentRate: '99.4% On-Time',
      supportEmail: 'concierge@apexluxe.com',
    },

    factory: {
      id: 'FAC-9041',
      name: 'VeriTech Precision Plant #3',
      location: 'Stuttgart, Germany',
      batchHash: '0x7f8a9b1c2d3e4f5a6b7c8d9e',
      nfcTag: 'NFC-99482-A7',
      manufacturedDate: 'October 12, 2025',
      qcScore: '100%',
      certification: 'ISO-9001',
      defectRate: '0.00%',
    },

    shipment: {
      carrier: 'VeriExpress Express Air',
      trackingId: 'TRK-987410293-VX',
      estDelivery: 'Tomorrow, 2:00 PM',
      currentLocation: 'Regional Sorting Facility, Oakland CA',
      steps: [
        { title: 'Order Confirmed & Cryptographically Sealed', time: 'Oct 14, 08:45 AM', status: 'done' },
        { title: 'Manufactured & Passed QA Inspection', time: 'Oct 14, 02:30 PM', status: 'done' },
        { title: 'Handed to Carrier at Factory Gate', time: 'Oct 15, 09:15 AM', status: 'done' },
        { title: 'In Transit - Regional Sorting Facility', time: 'Oct 16, 11:45 AM', status: 'active' },
        { title: 'Out for Final Customer Delivery', time: 'Estimated Oct 17', status: 'pending' },
      ],
    },

    items: [
      { id: '1', name: 'VeriChron Smart Authenticated Chronograph', sku: 'SKU-VC-990-BLK', quantity: 1, price: 1299.00 },
    ],

    timeline: [
      { id: 't1', type: 'buyer', title: 'Order Placed & Payment Captured', timestamp: 'Oct 14, 08:45 AM', actor: 'Jane Doe (Buyer)', tag: 'Checkout' },
      { id: 't2', type: 'system', title: 'Smart Contract Escrow Initialized', timestamp: 'Oct 14, 08:46 AM', actor: 'VeriChain Protocol', tag: 'Blockchain' },
      { id: 't3', type: 'factory', title: 'NFC Tag Provisioned & Verified', timestamp: 'Oct 14, 02:15 PM', actor: 'Plant #3 Automation', tag: 'QC Pass' },
      { id: 't4', type: 'seller', title: 'Seller Dispatch Inspection Completed', timestamp: 'Oct 15, 08:30 AM', actor: 'Apex Luxe Ops', tag: 'Verified' },
      { id: 't5', type: 'ship', title: 'Carrier Scanned Package at Hub', timestamp: 'Oct 16, 11:45 AM', actor: 'VeriExpress Air', tag: 'In Transit' },
    ],
  },
  {
    id: 'ORD-7740-FB',
    status: 'processing',
    statusLabel: 'Factory Manufacturing',
    progressPercent: 40,
    authenticityScore: 100.0,
    blockNumber: '#18,495,120',
    transactionHash: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    createdDate: 'Oct 15, 2025, 02:10 PM',

    buyer: {
      name: 'Michael Chang',
      email: 'm.chang@techcorp.io',
      phone: '+1 (555) 890-1234',
      avatarInitials: 'MC',
      verified: true,
      shippingAddress: '789 Innovation Way, Austin, TX 78701',
      billingAddress: 'Same as shipping address',
      paymentMethod: 'MasterCard •••• 8819',
      paymentStatus: 'Escrow Held ($2,450.00)',
    },

    seller: {
      id: 'SEL-10293',
      name: 'CyberAudio Direct',
      avatarInitials: 'CD',
      verified: true,
      tier: 'Platinum Premier',
      rating: '4.98',
      reviewCount: 3890,
      dispatchFacility: 'Central Distro Center 1',
      fulfillmentRate: '99.8% On-Time',
      supportEmail: 'support@cyberaudio.io',
    },

    factory: {
      id: 'FAC-4021',
      name: 'Nordic Acoustic Labs',
      location: 'Copenhagen, Denmark',
      batchHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f',
      nfcTag: 'NFC-88120-B3',
      manufacturedDate: 'In Production (Oct 16)',
      qcScore: '99.8%',
      certification: 'Hi-Res Audio Cert',
      defectRate: '0.01%',
    },

    shipment: {
      carrier: 'DHL Express Worldwide',
      trackingId: 'TRK-554192081-DHL',
      estDelivery: 'Oct 19, 2025',
      currentLocation: 'Factory Packaging Line 2',
      steps: [
        { title: 'Order Placed & Escrow Locked', time: 'Oct 15, 02:10 PM', status: 'done' },
        { title: 'Factory Batch Allocation & RFID Tagging', time: 'Oct 16, 09:00 AM', status: 'active' },
        { title: 'Final QA & Acoustic Calibration', time: 'Pending', status: 'pending' },
        { title: 'Dispatch to Carrier Airport Hub', time: 'Pending', status: 'pending' },
        { title: 'Customer Delivery', time: 'Pending', status: 'pending' },
      ],
    },

    items: [
      { id: '1', name: 'Planar Magnetic Audiophile Headphones', sku: 'SKU-AUDIO-PM1', quantity: 1, price: 2450.00 },
    ],

    timeline: [
      { id: 't1', type: 'buyer', title: 'Order Submitted', timestamp: 'Oct 15, 02:10 PM', actor: 'Michael Chang', tag: 'Submitted' },
      { id: 't2', type: 'system', title: 'Payment Deposited into Smart Contract', timestamp: 'Oct 15, 02:11 PM', actor: 'VeriChain System', tag: 'Escrow' },
      { id: 't3', type: 'factory', title: 'Factory Order Acknowledged', timestamp: 'Oct 16, 08:00 AM', actor: 'Nordic Acoustic ERP', tag: 'Assigned' },
    ],
  },
  {
    id: 'ORD-6612-DL',
    status: 'delivered',
    statusLabel: 'Delivered & Verified',
    progressPercent: 100,
    authenticityScore: 100.0,
    blockNumber: '#18,480,942',
    transactionHash: '0x1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e',
    createdDate: 'Oct 10, 2025, 10:00 AM',

    buyer: {
      name: 'Sophia Al-Mansoor',
      email: 'sophia.al@designstudio.ae',
      phone: '+971 50 123 4567',
      avatarInitials: 'SA',
      verified: true,
      shippingAddress: 'Downtown Marina Tower 12, Floor 34, Dubai, UAE',
      billingAddress: 'Same as shipping address',
      paymentMethod: 'Apple Pay',
      paymentStatus: 'Completed ($3,800.00)',
    },

    seller: {
      id: 'SEL-50912',
      name: 'Maison de Luxe Dubai',
      avatarInitials: 'ML',
      verified: true,
      tier: 'Diamond Verified',
      rating: '5.00',
      reviewCount: 940,
      dispatchFacility: 'Dubai Airport Freezone Hub',
      fulfillmentRate: '100% On-Time',
      supportEmail: 'vip@maisondeluxe.ae',
    },

    factory: {
      id: 'FAC-1002',
      name: 'Atelier Artisan Paris',
      location: 'Paris, France',
      batchHash: '0x9e8d7c6b5a4f3e2d1c0b9a8f',
      nfcTag: 'NFC-11092-PARIS',
      manufacturedDate: 'September 28, 2025',
      qcScore: '100%',
      certification: 'Haute Couture Passport',
      defectRate: '0.00%',
    },

    shipment: {
      carrier: 'FedEx Priority Overnight',
      trackingId: 'TRK-10928374-FDX',
      estDelivery: 'Delivered Oct 12, 11:30 AM',
      currentLocation: 'Delivered to Recipient (Signed by SA)',
      steps: [
        { title: 'Order Confirmed', time: 'Oct 10, 10:00 AM', status: 'done' },
        { title: 'Authenticity Certificate Attached', time: 'Oct 10, 04:00 PM', status: 'done' },
        { title: 'In International Transit', time: 'Oct 11, 01:00 AM', status: 'done' },
        { title: 'Customs Cleared at Dubai Airport', time: 'Oct 12, 08:15 AM', status: 'done' },
        { title: 'Delivered & Buyer Scan Confirmed', time: 'Oct 12, 11:30 AM', status: 'done' },
      ],
    },

    items: [
      { id: '1', name: 'Limited Edition Handcrafted Leather Tote', sku: 'SKU-LUXE-TOTE-PARIS', quantity: 1, price: 3800.00 },
    ],

    timeline: [
      { id: 't1', type: 'buyer', title: 'Order Completed & Paid', timestamp: 'Oct 10, 10:00 AM', actor: 'Sophia Al-Mansoor', tag: 'Purchase' },
      { id: 't2', type: 'factory', title: 'Cryptographic NFC Seal Generated', timestamp: 'Oct 10, 02:00 PM', actor: 'Atelier Paris', tag: 'Passport' },
      { id: 't3', type: 'seller', title: 'Pre-Shipment Authenticity Verified', timestamp: 'Oct 10, 04:00 PM', actor: 'Maison de Luxe', tag: 'Verified' },
      { id: 't4', type: 'ship', title: 'Package Handed to FedEx', timestamp: 'Oct 10, 08:00 PM', actor: 'FedEx Express', tag: 'Transit' },
      { id: 't5', type: 'buyer', title: 'Recipient NFC Scan Verified Authenticity', timestamp: 'Oct 12, 11:32 AM', actor: 'Sophia Al-Mansoor', tag: 'Verified' },
    ],
  },
];

export default function OrderManagement() {
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number>(0);
  const [timelineFilter, setTimelineFilter] = useState<string>('all');
  const [notification, setNotification] = useState<string | null>(null);

  const order = MOCK_ORDERS[selectedOrderIndex] || MOCK_ORDERS[0];

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const filteredTimeline = order.timeline.filter((item) => {
    if (timelineFilter === 'all') return true;
    return item.type === timelineFilter;
  });

  return (
    <div className="om-page">
      {/* Toast Banner */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            background: 'var(--bg-card)',
            border: '1px solid var(--accent-cyan)',
            color: 'var(--text-primary)',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'om-fade-up 0.25s ease',
          }}
        >
          <ShieldCheck size={20} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{notification}</span>
        </div>
      )}

      {/* Header */}
      <header className="om-header">
        <div className="om-header-left">
          <h1>Order Management Hub</h1>
          <p>End-to-End Verifiable Supply Chain: Buyer • Seller • Factory • Shipment • Status • Timeline</p>
        </div>

        <div className="om-header-actions">
          <button
            className="om-btn om-btn-ghost"
            onClick={() => showToast('Refreshed real-time blockchain telemetry & tracking')}
            title="Refresh Order Data"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button
            className="om-btn om-btn-ghost"
            onClick={() => showToast(`Share link copied for ${order.id}`)}
            title="Share Order Tracking"
          >
            <Share2 size={15} />
            <span>Share</span>
          </button>
          <button
            className="om-btn om-btn-primary"
            onClick={() => showToast(`Certificate of Authenticity downloaded for ${order.id}`)}
            title="Download Authenticity Certificate"
          >
            <Download size={15} />
            <span>Export Certificate</span>
          </button>
        </div>
      </header>

      {/* Order Selector Bar */}
      <section className="om-order-bar" aria-label="Order selector bar">
        <span className="om-order-bar-label">Active Orders ({MOCK_ORDERS.length})</span>
        <div className="om-order-chips">
          {MOCK_ORDERS.map((ord, idx) => {
            const isActive = idx === selectedOrderIndex;
            let statusColor = '#3b82f6';
            if (ord.status === 'shipped') statusColor = '#6366f1';
            if (ord.status === 'delivered') statusColor = '#10b981';
            if (ord.status === 'processing') statusColor = '#f59e0b';

            return (
              <button
                key={ord.id}
                className={`om-order-chip ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedOrderIndex(idx)}
                type="button"
              >
                <span className="chip-status-dot" style={{ background: statusColor }} />
                <span>{ord.id}</span>
                <span className={`om-badge ${ord.status}`}>{ord.statusLabel}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Top 3 Column Grid: Buyer, Seller, Factory */}
      <div className="om-grid">
        {/* PANEL 1: BUYER DETAILS */}
        <div className="om-panel">
          <div className="om-panel-header">
            <div className="om-panel-title-group">
              <div className="om-panel-icon buyer">
                <User size={18} color="var(--accent-cyan)" />
              </div>
              <div>
                <div className="om-panel-title">Buyer Information</div>
                <div className="om-panel-sub">Customer Identity & Destination</div>
              </div>
            </div>
            {order.buyer.verified && (
              <span className="om-badge verified dot">Verified Identity</span>
            )}
          </div>

          <div className="om-panel-body">
            <div className="om-avatar">
              <div className="om-avatar-img">{order.buyer.avatarInitials}</div>
              <div className="om-avatar-info">
                <strong>{order.buyer.name}</strong>
                <span>{order.buyer.email}</span>
              </div>
            </div>

            <div className="om-info-row">
              <span className="om-info-label">Contact</span>
              <span className="om-info-value">{order.buyer.phone}</span>
            </div>

            <div className="om-info-row">
              <span className="om-info-label">Shipping To</span>
              <span className="om-info-value">{order.buyer.shippingAddress}</span>
            </div>

            <div className="om-info-row">
              <span className="om-info-label">Payment</span>
              <span className="om-info-value mono">{order.buyer.paymentStatus}</span>
            </div>

            <div className="om-divider" />

            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Order Items ({order.items.length})
            </div>

            <div className="om-items-list">
              {order.items.map((item) => (
                <div className="om-item-row" key={item.id}>
                  <div className="om-item-icon">
                    <Package size={18} color="var(--text-secondary)" />
                  </div>
                  <div className="om-item-details">
                    <div className="om-item-name">{item.name}</div>
                    <div className="om-item-sku">SKU: {item.sku} • Qty: {item.quantity}</div>
                  </div>
                  <div className="om-item-price">${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
              ))}
            </div>

            <div className="om-total-row">
              <span className="om-total-label">Total Amount</span>
              <span className="om-total-value">
                ${order.items.reduce((acc, i) => acc + i.price * i.quantity, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* PANEL 2: SELLER DETAILS */}
        <div className="om-panel">
          <div className="om-panel-header">
            <div className="om-panel-title-group">
              <div className="om-panel-icon seller">
                <Store size={18} color="#10b981" />
              </div>
              <div>
                <div className="om-panel-title">Seller Information</div>
                <div className="om-panel-sub">Merchant & Merchant Fulfillment</div>
              </div>
            </div>
            <span className="om-badge verified dot">{order.seller.tier}</span>
          </div>

          <div className="om-panel-body">
            <div className="om-avatar">
              <div className="om-avatar-img" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                {order.seller.avatarInitials}
              </div>
              <div className="om-avatar-info">
                <strong>{order.seller.name}</strong>
                <span>ID: {order.seller.id}</span>
              </div>
            </div>

            <div className="om-info-row">
              <span className="om-info-label">Rating</span>
              <span className="om-info-value" style={{ color: '#f59e0b' }}>
                ★ {order.seller.rating} ({order.seller.reviewCount.toLocaleString()} reviews)
              </span>
            </div>

            <div className="om-info-row">
              <span className="om-info-label">Dispatch Hub</span>
              <span className="om-info-value">{order.seller.dispatchFacility}</span>
            </div>

            <div className="om-info-row">
              <span className="om-info-label">Fulfillment</span>
              <span className="om-info-value">{order.seller.fulfillmentRate}</span>
            </div>

            <div className="om-info-row">
              <span className="om-info-label">Support</span>
              <span className="om-info-value muted">{order.seller.supportEmail}</span>
            </div>

            <div className="om-divider" />

            <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#10b981', marginBottom: 4 }}>
                <ShieldCheck size={14} />
                <span>Authorized VeriChain Seller Guarantee</span>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>
                Product authenticity is backed by anti-tamper NFC verification and merchant escrow policies.
              </span>
            </div>
          </div>
        </div>

        {/* PANEL 3: FACTORY & MANUFACTURING */}
        <div className="om-panel">
          <div className="om-panel-header">
            <div className="om-panel-title-group">
              <div className="om-panel-icon factory">
                <Factory size={18} color="#f59e0b" />
              </div>
              <div>
                <div className="om-panel-title">Factory Source</div>
                <div className="om-panel-sub">Manufacturing Plant & NFC Batch</div>
              </div>
            </div>
            <span className="om-badge verified dot">Passed QC</span>
          </div>

          <div className="om-panel-body">
            <div className="om-avatar">
              <div className="om-avatar-img" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                VF
              </div>
              <div className="om-avatar-info">
                <strong>{order.factory.name}</strong>
                <span>ID: {order.factory.id}</span>
              </div>
            </div>

            <div className="om-info-row">
              <span className="om-info-label">Origin Plant</span>
              <span className="om-info-value">{order.factory.location}</span>
            </div>

            <div className="om-info-row">
              <span className="om-info-label">Batch Hash</span>
              <span className="om-info-value mono">{order.factory.batchHash}</span>
            </div>

            <div className="om-info-row">
              <span className="om-info-label">NFC / RFID Tag</span>
              <span className="om-info-value mono">{order.factory.nfcTag}</span>
            </div>

            <div className="om-info-row">
              <span className="om-info-label">Date Produced</span>
              <span className="om-info-value muted">{order.factory.manufacturedDate}</span>
            </div>

            <div className="om-divider" />

            <div className="om-factory-stats">
              <div className="om-factory-stat">
                <span className="om-factory-stat-val">{order.factory.qcScore}</span>
                <span className="om-factory-stat-lbl">QC Score</span>
              </div>
              <div className="om-factory-stat">
                <span className="om-factory-stat-val">{order.factory.certification}</span>
                <span className="om-factory-stat-lbl">Standard</span>
              </div>
              <div className="om-factory-stat">
                <span className="om-factory-stat-val">{order.factory.defectRate}</span>
                <span className="om-factory-stat-lbl">Defect Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 2 Column Grid: Shipment & Status/Timeline */}
      <div className="om-grid-bottom">
        {/* PANEL 4: SHIPMENT LOGISTICS */}
        <div className="om-panel">
          <div className="om-panel-header">
            <div className="om-panel-title-group">
              <div className="om-panel-icon ship">
                <Truck size={18} color="#6366f1" />
              </div>
              <div>
                <div className="om-panel-title">Shipment & Delivery</div>
                <div className="om-panel-sub">Real-Time Logistics Telemetry</div>
              </div>
            </div>
            <span className={`om-badge ${order.status}`}>{order.statusLabel}</span>
          </div>

          <div className="om-panel-body">
            {/* Tracking ID & Barcode */}
            <div className="om-tracking-box">
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tracking Number
              </div>
              <div className="om-tracking-id">{order.shipment.trackingId}</div>

              {/* Vector Barcode Representation */}
              <svg className="om-barcode-svg" viewBox="0 0 200 35" fill="var(--text-primary)" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="0" width="3" height="35" />
                <rect x="11" y="0" width="2" height="35" />
                <rect x="16" y="0" width="6" height="35" />
                <rect x="25" y="0" width="2" height="35" />
                <rect x="30" y="0" width="4" height="35" />
                <rect x="37" y="0" width="2" height="35" />
                <rect x="42" y="0" width="7" height="35" />
                <rect x="52" y="0" width="3" height="35" />
                <rect x="58" y="0" width="2" height="35" />
                <rect x="63" y="0" width="5" height="35" />
                <rect x="71" y="0" width="2" height="35" />
                <rect x="76" y="0" width="4" height="35" />
                <rect x="83" y="0" width="6" height="35" />
                <rect x="92" y="0" width="2" height="35" />
                <rect x="97" y="0" width="3" height="35" />
                <rect x="103" y="0" width="5" height="35" />
                <rect x="111" y="0" width="2" height="35" />
                <rect x="116" y="0" width="4" height="35" />
                <rect x="123" y="0" width="2" height="35" />
                <rect x="128" y="0" width="6" height="35" />
                <rect x="137" y="0" width="3" height="35" />
                <rect x="143" y="0" width="2" height="35" />
                <rect x="148" y="0" width="5" height="35" />
                <rect x="156" y="0" width="3" height="35" />
                <rect x="162" y="0" width="2" height="35" />
                <rect x="167" y="0" width="6" height="35" />
                <rect x="176" y="0" width="2" height="35" />
                <rect x="181" y="0" width="4" height="35" />
                <rect x="188" y="0" width="3" height="35" />
              </svg>

              <div className="om-tracking-carrier">
                {order.shipment.carrier} • Estimated Delivery: <strong>{order.shipment.estDelivery}</strong>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
              Current Status: <span style={{ color: 'var(--text-primary)' }}>{order.shipment.currentLocation}</span>
            </div>

            <div className="om-divider" />

            {/* Shipment Progress Steps */}
            <div className="om-ship-progress">
              {order.shipment.steps.map((step, idx) => (
                <div key={idx} className="om-ship-step">
                  <div className={`om-ship-node ${step.status}`}>
                    {step.status === 'done' && <Check size={12} color="#fff" />}
                    {step.status === 'active' && <Clock size={12} color="#b45309" />}
                  </div>
                  <div className="om-ship-info">
                    <strong>{step.title}</strong>
                    <span>{step.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL 5: STATUS & TIMELINE */}
        <div className="om-panel">
          <div className="om-panel-header">
            <div className="om-panel-title-group">
              <div className="om-panel-icon status">
                <Activity size={18} color="var(--color-danger)" />
              </div>
              <div>
                <div className="om-panel-title">Status & Cryptographic Timeline</div>
                <div className="om-panel-sub">Immutable Chain Audit Trail</div>
              </div>
            </div>
            <span className="om-badge verified dot">{order.authenticityScore}% Authenticity</span>
          </div>

          <div className="om-panel-body">
            {/* Status Metrics */}
            <div className="om-status-grid">
              <div className="om-status-metric">
                <span className="om-status-metric-label">Lifecycle Status</span>
                <span className="om-status-metric-value accent">{order.statusLabel}</span>
              </div>
              <div className="om-status-metric">
                <span className="om-status-metric-label">Authenticity Score</span>
                <span className="om-status-metric-value success">{order.authenticityScore}%</span>
              </div>
              <div className="om-status-metric">
                <span className="om-status-metric-label">Blockchain Block</span>
                <span className="om-status-metric-value warning">{order.blockNumber}</span>
              </div>
              <div className="om-status-metric">
                <span className="om-status-metric-label">Smart Contract</span>
                <span className="om-status-metric-value" style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                  0x8f2a...7f8a
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="om-progress-bar-wrap">
              <div className="om-progress-bar-label">
                <span>Completion Status</span>
                <strong>{order.progressPercent}%</strong>
              </div>
              <div className="om-progress-bar">
                <div
                  className={`om-progress-bar-fill ${order.progressPercent === 100 ? 'success' : ''}`}
                  style={{ width: `${order.progressPercent}%` }}
                />
              </div>
            </div>

            <div className="om-divider" />

            {/* Timeline Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Timeline Audit Trail ({filteredTimeline.length})
              </span>

              <div style={{ display: 'flex', gap: 4 }}>
                {['all', 'buyer', 'seller', 'factory', 'ship', 'system'].map((typeKey) => (
                  <button
                    key={typeKey}
                    onClick={() => setTimelineFilter(typeKey)}
                    style={{
                      border: '1px solid var(--border-default)',
                      background: timelineFilter === typeKey ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                      color: timelineFilter === typeKey ? '#fff' : 'var(--text-muted)',
                      borderRadius: 'var(--radius-full)',
                      padding: '2px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {typeKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Stream */}
            <div className="om-timeline">
              {filteredTimeline.map((item) => (
                <div className="om-timeline-item" key={item.id}>
                  <div className={`om-timeline-dot ${item.type}`}>
                    {item.type === 'buyer' && <User size={11} />}
                    {item.type === 'seller' && <Store size={11} />}
                    {item.type === 'factory' && <Factory size={11} />}
                    {item.type === 'ship' && <Truck size={11} />}
                    {item.type === 'system' && <Lock size={11} />}
                  </div>
                  <div className="om-timeline-content">
                    <div className="om-timeline-event">{item.title}</div>
                    <div className="om-timeline-meta">
                      <span>{item.timestamp}</span>
                      <span>•</span>
                      <span>{item.actor}</span>
                      <span className="om-timeline-tag">{item.tag}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
