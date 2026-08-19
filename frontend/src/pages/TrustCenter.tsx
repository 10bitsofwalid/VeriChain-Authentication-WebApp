import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { TrendingUp, Users, Clipboard, CheckCircle, ShieldCheck, Zap } from 'lucide-react';
import FactoryCard from '../components/FactoryCard';
import SellerInfoCard from '../components/SellerInfoCard';
import AnalyticsCard from '../components/AnalyticsCard';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import TrustCenterFeed from './TrustCenterFeed';
import RecallAlerts from './RecallAlerts';
import VerificationActivity from './VerificationActivity';
import ActionButton from '../components/ui/ActionButton';
import PageLoader from '../components/ui/PageLoader';
import './MarketplaceHome.css';

interface Product {
  _id: string;
  verifiedStatus?: string;
  verified?: boolean;
}

interface Factory {
  _id: string;
  name: string;
  logoUrl?: string;
  verificationStatus: string;
  trustScore?: number;
  country?: string;
}

interface Seller {
  _id: string;
  name: string;
  trustScore?: number;
  rating?: number;
  verified?: boolean;
}

const TrustCenter: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [complaintCount, setComplaintCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, facRes, sellRes, compRes] = await Promise.allSettled([
          client.get('/products'),
          client.get('/users?role=factory&verified=true'),
          client.get('/users?role=seller&verified=true'),
          client.get('/complaints'),
        ]);

        if (prodRes.status === 'fulfilled') {
          const prodList = Array.isArray(prodRes.value.data) ? prodRes.value.data : prodRes.value.data?.products;
          if (Array.isArray(prodList)) {
            setProducts(prodList);
          }
        }
        if (facRes.status === 'fulfilled' && Array.isArray(facRes.value.data)) {
          const topFactories = (facRes.value.data as Factory[])
            .sort((a, b) => (b.trustScore ?? 0) - (a.trustScore ?? 0))
            .slice(0, 6);
          setFactories(topFactories);
        }
        if (sellRes.status === 'fulfilled' && Array.isArray(sellRes.value.data)) {
          const topSellers = (sellRes.value.data as Seller[])
            .sort((a, b) => (b.trustScore ?? 0) - (a.trustScore ?? 0))
            .slice(0, 6);
          setSellers(topSellers);
        }
        if (compRes.status === 'fulfilled' && compRes.value.data?.complaints) {
          setComplaintCount(compRes.value.data.complaints.length);
        }
      } catch (err) {
        console.error('Error loading Trust Center data', err);
        setProducts([]);
        setFactories([]);
        setSellers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalProducts = products.length;
  const verifiedProducts = products.filter(p => p.verifiedStatus === 'verified' || p.verified).length;

  return (
    <div className="marketplace-home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />

      <main className="page-container" style={{ flex: 1, padding: 'var(--space-xl) var(--space-md)' }}>
        {loading ? (
          <PageLoader minHeight="60vh" />
        ) : (
          <div className="space-y-8">
            {/* Trust Hero Banner */}
            <div
              className="glass-card flex flex-col items-center text-center p-8 animate-fade-in"
              style={{
                background: 'linear-gradient(135deg, #16233B 0%, #0B0F19 100%)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#F59E0B',
                  borderRadius: '999px',
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: 'var(--space-sm)',
                }}
              >
                <ShieldCheck size={16} />
                <span>VeriChain Global Trust & Provenance Network</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-4" style={{ color: '#FFFFFF' }}>
                Verify with Complete Confidence
              </h1>
              <p className="text-lg text-gray-300 mb-6 max-w-2xl">
                Transparent Ownership • Cryptographic Supply Chain • Zero Counterfeit Tolerance
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <ActionButton variant="primary" size="md" onClick={() => navigate('/verify')}>
                  <Zap size={16} /> Quick Verify Product
                </ActionButton>
                <ActionButton variant="secondary" size="md" onClick={() => navigate('/dashboard/marketplace')}>
                  Browse Verified Marketplace
                </ActionButton>
              </div>
            </div>

            {/* Platform Telemetry Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalyticsCard icon={<Users size={24} />} title="Registered Products" value={totalProducts} />
              <AnalyticsCard icon={<CheckCircle size={24} />} title="Products Verified" value={verifiedProducts} />
              <AnalyticsCard icon={<Clipboard size={24} />} title="Filed Complaints" value={complaintCount} />
              <AnalyticsCard icon={<TrendingUp size={24} />} title="Verified Partners" value={factories.length + sellers.length} />
            </div>

            {/* Top Trusted Manufacturers */}
            <section className="mt-12">
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <span className="marketplace-eyebrow">Accredited Production</span>
                <h2 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Top Trusted Manufacturers
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Audited manufacturing facilities with cryptographic minting credentials.
                </p>
              </div>
              {factories.length === 0 ? (
                <div className="glass-card" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Verified factory profiles will appear here as manufacturers register on the ledger.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {factories.map(f => (
                    <FactoryCard key={f._id} factory={f} selected={false} onSelect={() => navigate(`/factory/${f._id}`)} />
                  ))}
                </div>
              )}
            </section>

            {/* Top Trusted Sellers */}
            <section className="mt-12">
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <span className="marketplace-eyebrow">Authorized Distribution</span>
                <h2 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Top Trusted Merchants & Sellers
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Certified merchants with verified chain of custody and high buyer ratings.
                </p>
              </div>
              {sellers.length === 0 ? (
                <div className="glass-card" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Verified sellers will appear here as merchants register on the ledger.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sellers.map(s => (
                    <SellerInfoCard key={s._id} seller={s} title="Verified Merchant Partner" />
                  ))}
                </div>
              )}
            </section>

            {/* Live Verification Feed */}
            <TrustCenterFeed />

            {/* Recall Alerts */}
            <RecallAlerts />

            {/* Verification Activity */}
            <VerificationActivity />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TrustCenter;
