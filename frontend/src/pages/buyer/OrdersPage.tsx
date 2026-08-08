import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, XCircle, Clock, RotateCcw, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import client from '../../api/client';
import './BuyerExperience.css';
import BuyerNav from './BuyerNav';
import type { Order } from '../../types/buyer';

const STATUS_ICONS: Record<string, React.ReactNode> = {
  delivered:  <CheckCircle size={13} />,
  shipped:    <Truck size={13} />,
  processing: <Clock size={13} />,
  cancelled:  <XCircle size={13} />,
  returned:   <RotateCcw size={13} />,
};

const ALL_FILTERS = ['all', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await client.get('/items/my');
        if (res.data?.items && Array.isArray(res.data.items) && res.data.items.length > 0) {
          const transformed: Order[] = res.data.items.map((item: any) => ({
            id: item._id,
            orderNumber: `ORD-${item.serialNumber || item._id.slice(-6).toUpperCase()}`,
            date: item.createdAt || new Date().toISOString(),
            status: (item.status === 'sold' ? 'delivered' : item.status === 'in_transit' ? 'shipped' : 'processing') as Order['status'],
            total: Number(item.product?.price) || 0,
            items: [
              {
                name: item.product?.name || 'Verified Product',
                qty: 1,
                price: Number(item.product?.price) || 0,
                image: item.product?.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
                verified: item.product?.verifiedStatus === 'verified',
              },
            ],
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
    }
    fetchOrders();
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  return (
    <div className="buyer-page">
      <BuyerNav />
      <div className="bx-header">
        <div className="bx-header-left">
          <h1>
            My Orders
            <span className="bx-count-badge">{orders.length}</span>
          </h1>
          <p>Track and manage all your verified purchases</p>
        </div>
        <Link to="/buyer/purchase-history" className="bx-btn-ghost">
          Purchase History
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="bx-tabs">
        {ALL_FILTERS.map(f => (
          <button
            key={f}
            className={`bx-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? `All Orders` : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className="bx-count-badge" style={{ marginLeft: 6, fontSize: '0.65rem', minWidth: 18, height: 18, padding: '0 5px' }}>
                {orders.filter(o => o.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bx-empty">
          <p>Loading your orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bx-empty">
          <div className="bx-empty-icon"><Package size={32} /></div>
          <h2>No orders found</h2>
          <p>No orders match this filter. Browse our marketplace to find verified authentic products.</p>
          <Link to="/dashboard/marketplace" className="bx-btn-primary">Browse Marketplace</Link>
        </div>
      ) : (
        <div>
          {filtered.map(order => (
            <div key={order.id} className="bx-order-card">
              {/* Header */}
              <div className="bx-order-header">
                <div className="bx-order-meta">
                  <span className="bx-order-num">{order.orderNumber}</span>
                  <span className="bx-order-date">
                    {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <span className={`bx-status bx-status-${order.status}`}>
                    {STATUS_ICONS[order.status]} {order.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <span className="bx-order-total">${order.total.toFixed(2)}</span>
                  <button
                    className="bx-btn-ghost"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={() => toggle(order.id)}
                  >
                    {expanded === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {expanded === order.id ? 'Hide' : 'Details'}
                  </button>
                </div>
              </div>

              {/* Quick preview (always visible) */}
              <div className="bx-order-body">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {order.items.slice(0, 4).map((item, i) => (
                    <img key={i} src={item.image} alt={item.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-default)' }} />
                  ))}
                  {order.items.length > 4 && (
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      +{order.items.length - 4}
                    </div>
                  )}
                  <span style={{ marginLeft: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Tracking row */}
              {order.trackingNumber && (
                <div className="bx-tracking-row">
                  <Truck size={13} color="var(--accent-cyan)" />
                  <span>Tracking: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{order.trackingNumber}</span></span>
                  <span style={{ color: 'var(--text-muted)' }}>via {order.carrier}</span>
                  {order.estimatedDelivery && (
                    <span style={{ marginLeft: 'auto', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                      Est. {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              )}

              {/* Expanded details */}
              {expanded === order.id && (
                <div style={{ padding: 'var(--space-md) var(--space-lg)', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                  <div className="bx-section-title" style={{ marginBottom: 'var(--space-sm)' }}>Items in this Order</div>
                  {order.items.map((item, i) => (
                    <div key={i} className="bx-product-row" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', marginBottom: 6 }}>
                      <img src={item.image} alt={item.name} className="bx-product-img" />
                      <div className="bx-product-info">
                        <div className="bx-product-name">{item.name}</div>
                        <div className="bx-product-brand">Qty: {item.qty}</div>
                        {item.verified ? (
                          <span className="bx-verified"><ShieldCheck size={10} /> Verified Authentic</span>
                        ) : null}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)', flexWrap: 'wrap' }}>
                    <Link to="/complaints" className="bx-btn-ghost" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>Report Issue</Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
