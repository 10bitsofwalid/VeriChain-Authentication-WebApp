import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IconRosetteDiscountCheck as RosetteCheck,
  IconClock as Clock,
  IconArrowUpRight as ArrowUpRight,
  IconPackage as Package,
  IconDeviceLaptop as Laptop,
  IconShirt as Shirt,
  IconDiamond as Gem,
  IconPill as Pill,
  IconDeviceWatch as Watch,
  IconQrcode as Qrcode,
} from '@tabler/icons-react';
import client from '../api/client';

interface LiveFeedItem {
  id: string;
  serialNumber: string;
  productName: string;
  category?: string;
  imageUrl?: string;
  currentOwnerName?: string;
  timestamp: string;
}

function getProductCategoryIcon(category?: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('electronics') || cat.includes('tech') || cat.includes('laptop')) return <Laptop size={22} />;
  if (cat.includes('apparel') || cat.includes('cloth') || cat.includes('fashion') || cat.includes('shirt')) return <Shirt size={22} />;
  if (cat.includes('jewelry') || cat.includes('luxury') || cat.includes('gem') || cat.includes('diamond')) return <Gem size={22} />;
  if (cat.includes('pharma') || cat.includes('med') || cat.includes('health') || cat.includes('pill')) return <Pill size={22} />;
  if (cat.includes('watch') || cat.includes('timepiece')) return <Watch size={22} />;
  return <Package size={22} />;
}

const TrustCenterFeed: React.FC = () => {
  const [feed, setFeed] = useState<LiveFeedItem[]>([]);

  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await client.get('/items/recently-verified');
        if (res.data?.items && Array.isArray(res.data.items)) {
          const items: LiveFeedItem[] = res.data.items.slice(0, 6).map((it: any) => ({
            id: it._id,
            serialNumber: it.serialNumber || it._id.slice(-8).toUpperCase(),
            productName: it.product?.name || 'Verified Product',
            category: it.product?.category || 'Authentic Asset',
            imageUrl: it.product?.imageUrl,
            currentOwnerName: it.currentOwner?.name || 'Authorized Custodian',
            timestamp: it.updatedAt || it.createdAt || new Date().toISOString(),
          }));
          setFeed(items);
        }
      } catch {
        setFeed([]);
      }
    }
    loadFeed();
  }, []);

  return (
    <section className="mt-12">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981', display: 'inline-block' }} />
            Live On-Chain Attestations
          </div>
          <h2 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Recent Verification Feed
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time cryptographic audit trail of items verified across the VeriChain network.
          </p>
        </div>
        <Link
          to="/verify"
          className="btn btn-secondary"
          style={{ fontSize: '0.82rem', padding: '6px 14px', borderRadius: 'var(--radius-full)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Qrcode size={15} /> Verify Your Product
        </Link>
      </div>

      {feed.length === 0 ? (
        <div className="glass-card" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No recent ledger verifications recorded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feed.map((event) => (
            <div
              key={event.id}
              className="glass-card animate-fade-in"
              style={{
                padding: 'var(--space-md)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: 'var(--bg-card)',
                transition: 'all var(--transition-base)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: 0 }}>
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.productName}
                      style={{ width: 44, height: 44, borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-default)', flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(22, 35, 59, 0.25) 100%)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#F59E0B',
                        flexShrink: 0,
                      }}
                    >
                      {getProductCategoryIcon(event.category)}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                      {event.category}
                    </div>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {event.productName}
                    </h4>
                  </div>
                </div>

                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0,
                  }}
                >
                  <RosetteCheck size={12} /> Verified
                </span>
              </div>

              <div style={{ background: 'var(--bg-secondary, rgba(0,0,0,0.03))', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  #{event.serialNumber}
                </span>
                <Link
                  to={`/verify?serial=${encodeURIComponent(event.serialNumber)}`}
                  style={{ fontSize: '0.72rem', color: 'var(--accent-purple, #F59E0B)', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  Audit <ArrowUpRight size={12} />
                </Link>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                <span>By {event.currentOwnerName}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Clock size={11} />
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TrustCenterFeed;
