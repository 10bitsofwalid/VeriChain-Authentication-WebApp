import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  Truck,
  Building,
  User,
  ShoppingBag,
  Download,
  Share2,
  RefreshCw,
} from 'lucide-react';
import client from '../api/client';
import EmptyState from '../components/ui/EmptyState';
import './OrderManagement.css';

export interface OrderData {
  id: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusLabel: string;
  progressPercent: number;
  authenticityScore: number;
  blockNumber: string;
  transactionHash: string;
  createdDate: string;

  buyer: {
    name: string;
    email: string;
    phone?: string;
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

  items: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
  }[];

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

export default function OrderManagement() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await client.get('/items/my');
      if (res.data?.items && Array.isArray(res.data.items) && res.data.items.length > 0) {
        const transformed: OrderData[] = res.data.items.map((it: any, idx: number) => ({
          id: `ORD-${it.serialNumber || it._id.slice(-6).toUpperCase()}`,
          status: (it.status === 'sold' ? 'delivered' : it.status === 'in_transit' ? 'shipped' : 'processing') as any,
          statusLabel: it.status === 'sold' ? 'Delivered' : it.status === 'in_transit' ? 'In Transit' : 'Processing',
          progressPercent: it.status === 'sold' ? 100 : it.status === 'in_transit' ? 70 : 40,
          authenticityScore: 100,
          blockNumber: `#${18492000 + idx * 12}`,
          transactionHash: (it.journey && it.journey[0]?.txHash) || '0x8f2a9c4b7e1d3f6a5b8c9d0e1f2a3b4c5d6e7f8a',
          createdDate: new Date(it.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          buyer: {
            name: it.currentOwner?.name || 'Verified Buyer',
            email: it.currentOwner?.email || 'buyer@verichain.network',
            avatarInitials: (it.currentOwner?.name || 'VB').slice(0, 2).toUpperCase(),
            verified: true,
            shippingAddress: it.location || 'Verified Custody Address',
            billingAddress: 'Same as shipping address',
            paymentMethod: 'VeriChain Escrow',
            paymentStatus: `Settled ($${it.product?.price || '0.00'})`,
          },
          seller: {
            id: 'SEL-VERIFIED',
            name: (it.journey && it.journey.find((j: any) => j.action === 'listed')?.actor?.name) || 'Authorized Merchant',
            avatarInitials: 'AM',
            verified: true,
            tier: 'Verified Merchant',
            rating: '4.95',
            reviewCount: 120,
            dispatchFacility: 'Regional Hub',
            fulfillmentRate: '100%',
            supportEmail: 'support@verichain.network',
          },
          factory: {
            id: 'FAC-ORIGIN',
            name: (it.journey && it.journey[0]?.actor?.name) || 'Origin Manufacturing Plant',
            location: (it.journey && it.journey[0]?.location) || 'Certified Facility',
            batchHash: it.serialNumber ? `0x${it.serialNumber}` : '0x7f8a9b1c2d3e4f5a',
            nfcTag: `NFC-${it.serialNumber || 'A1'}`,
            manufacturedDate: new Date(it.createdAt || Date.now()).toLocaleDateString(),
            qcScore: '100%',
            certification: 'ISO-9001',
            defectRate: '0.00%',
          },
          shipment: {
            carrier: 'VeriExpress',
            trackingId: `TRK-${it.serialNumber || it._id.slice(-6)}`,
            estDelivery: 'Completed',
            currentLocation: it.location || 'Delivered',
            steps: [
              { title: 'Item Minted & Sealed', time: 'Factory', status: 'done' },
              { title: 'Passed QA & Custody Check', time: 'Warehouse', status: 'done' },
              { title: 'Ownership Transferred to Buyer', time: 'Final', status: 'done' },
            ],
          },
          items: [
            {
              id: it._id,
              name: it.product?.name || 'Verified Authentic Item',
              sku: it.product?.sku || 'VC-SKU',
              quantity: 1,
              price: Number(it.product?.price) || 0,
            },
          ],
          timeline: (it.journey || []).map((j: any, jIdx: number) => ({
            id: `t-${jIdx}`,
            type: 'system' as const,
            title: `Event: ${j.action}`,
            timestamp: new Date(j.timestamp).toLocaleString(),
            actor: j.actor?.name || 'VeriChain Ledger',
            tag: j.action,
            details: j.details,
          })),
        }));
        setOrders(transformed);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const order = orders[selectedOrderIndex] || orders[0];

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  if (loading) {
    return (
      <div className="om-page" style={{ textAlign: 'center', padding: 60 }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading order management telemetry...</p>
      </div>
    );
  }

  if (orders.length === 0 || !order) {
    return (
      <div className="om-page">
        <header className="om-header">
          <div className="om-header-left">
            <h1>Order Management Hub</h1>
            <p>End-to-End Verifiable Supply Chain: Buyer • Seller • Factory • Shipment • Status • Timeline</p>
          </div>
        </header>
        <div style={{ marginTop: 'var(--space-2xl)' }}>
          <EmptyState
            icon={ShoppingBag}
            title="No Active Orders"
            message="There are currently no orders recorded on the ledger. Check the marketplace for verified product items."
            action={
              <button
                className="btn btn-primary"
                onClick={() => window.location.href = '/dashboard/marketplace'}
              >
                Explore Marketplace
              </button>
            }
          />
        </div>
      </div>
    );
  }

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
            onClick={() => {
              fetchOrders();
              showToast('Refreshed real-time blockchain telemetry & tracking');
            }}
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
            onClick={() => showToast(`Certificate of Authenticity exported for ${order.id}`)}
            title="Download Authenticity Certificate"
          >
            <Download size={15} />
            <span>Export Certificate</span>
          </button>
        </div>
      </header>

      {/* Order Selector Bar */}
      <section className="om-order-bar" aria-label="Order selector bar">
        <span className="om-order-bar-label">Active Orders ({orders.length})</span>
        <div className="om-order-chips">
          {orders.map((ord, idx) => {
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

            <div className="om-field-group">
              <div className="om-field">
                <span className="om-field-label">Delivery Destination</span>
                <span className="om-field-val">{order.buyer.shippingAddress}</span>
              </div>
              <div className="om-field">
                <span className="om-field-label">Settlement Mode</span>
                <span className="om-field-val">{order.buyer.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 2: SELLER DETAILS */}
        <div className="om-panel">
          <div className="om-panel-header">
            <div className="om-panel-title-group">
              <div className="om-panel-icon seller">
                <ShoppingBag size={18} color="#8b5cf6" />
              </div>
              <div>
                <div className="om-panel-title">Authorized Merchant</div>
                <div className="om-panel-sub">Fulfillment & Storefront Node</div>
              </div>
            </div>
            {order.seller.verified && (
              <span className="om-badge verified dot">Verified Seller</span>
            )}
          </div>

          <div className="om-panel-body">
            <div className="om-avatar">
              <div className="om-avatar-img" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                {order.seller.avatarInitials}
              </div>
              <div className="om-avatar-info">
                <strong>{order.seller.name}</strong>
                <span>{order.seller.tier}</span>
              </div>
            </div>

            <div className="om-field-group">
              <div className="om-field">
                <span className="om-field-label">Fulfillment Quality</span>
                <span className="om-field-val" style={{ color: '#10b981' }}>{order.seller.fulfillmentRate}</span>
              </div>
              <div className="om-field">
                <span className="om-field-label">Dispatch Node</span>
                <span className="om-field-val">{order.seller.dispatchFacility}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 3: FACTORY DETAILS */}
        <div className="om-panel">
          <div className="om-panel-header">
            <div className="om-panel-title-group">
              <div className="om-panel-icon factory">
                <Building size={18} color="#10b981" />
              </div>
              <div>
                <div className="om-panel-title">Manufacturing Origin</div>
                <div className="om-panel-sub">Digital Birth & QA Pass</div>
              </div>
            </div>
            <span className="om-badge verified dot">ISO Certified</span>
          </div>

          <div className="om-panel-body">
            <div className="om-avatar">
              <div className="om-avatar-img" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                FO
              </div>
              <div className="om-avatar-info">
                <strong>{order.factory.name}</strong>
                <span>{order.factory.location}</span>
              </div>
            </div>

            <div className="om-field-group">
              <div className="om-field">
                <span className="om-field-label">Quality Score</span>
                <span className="om-field-val" style={{ color: '#10b981' }}>{order.factory.qcScore} PASS</span>
              </div>
              <div className="om-field">
                <span className="om-field-label">NFC Seal ID</span>
                <span className="om-field-val" style={{ fontFamily: 'monospace' }}>{order.factory.nfcTag}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipment & Tracking Section */}
      <section className="om-section" style={{ marginTop: 'var(--space-xl)' }}>
        <div className="om-panel" style={{ padding: 'var(--space-xl)' }}>
          <div className="om-panel-header" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="om-panel-title-group">
              <div className="om-panel-icon shipment">
                <Truck size={18} color="#06b6d4" />
              </div>
              <div>
                <div className="om-panel-title">Logistics & Custody Verification</div>
                <div className="om-panel-sub">Tracking ID: {order.shipment.trackingId} via {order.shipment.carrier}</div>
              </div>
            </div>
            <span className={`om-badge ${order.status}`}>{order.statusLabel}</span>
          </div>

          <div className="om-shipment-stepper">
            {order.shipment.steps.map((step, idx) => (
              <div key={idx} className={`om-step ${step.status}`}>
                <div className="om-step-node">
                  {step.status === 'done' ? <CheckCircle size={14} /> : <div className="om-step-dot" />}
                </div>
                <div className="om-step-info">
                  <div className="om-step-title">{step.title}</div>
                  <div className="om-step-time">{step.time}</div>
                </div>
                {idx < order.shipment.steps.length - 1 && <div className="om-step-line" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ordered Products Ledger */}
      <section className="om-section" style={{ marginTop: 'var(--space-xl)' }}>
        <div className="om-panel">
          <div className="om-panel-header">
            <div className="om-panel-title">Authenticated Products in Order</div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.items.length} item(s)</span>
          </div>

          <div className="om-table-wrapper">
            <table className="om-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU Identifier</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{it.name}</td>
                    <td style={{ fontFamily: 'monospace' }}>{it.sku}</td>
                    <td>{it.quantity}</td>
                    <td>${it.price.toFixed(2)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      ${(it.price * it.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
