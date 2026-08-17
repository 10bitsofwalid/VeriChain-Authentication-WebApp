import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { TrendingUp, Users, Clipboard, CheckCircle } from 'lucide-react';
import FactoryCard from '../components/FactoryCard';
import SellerInfoCard from '../components/SellerInfoCard';
import AnalyticsCard from '../components/AnalyticsCard';
import { useNavigate } from 'react-router-dom';
import TrustCenterFeed from './TrustCenterFeed';
import RecallAlerts from './RecallAlerts';
import VerificationActivity from './VerificationActivity';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg">Loading Trust Center…</span>
      </div>
    );
  }

  const totalProducts = products.length;
  const verifiedProducts = products.filter(p => p.verifiedStatus === 'verified' || p.verified).length;

  return (
    <section className="trust-center container mx-auto p-4 space-y-8">
      {/* Trust Hero */}
      <div
        className="glass-card flex flex-col items-center text-center p-8 animate-fade-in"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.8))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4" style={{ color: '#fff' }}>
          Verify with Confidence
        </h1>
        <p className="text-lg text-gray-300 mb-6 max-w-2xl">
          Transparent Ownership • Verified Supply Chain • Decentralized Authenticity
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/verify')}
          style={{ background: 'var(--accent-gradient)' }}
        >
          Verify Product
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard icon={<Users size={24} />} title="Registered Products" value={totalProducts} />
        <AnalyticsCard icon={<CheckCircle size={24} />} title="Products Verified" value={verifiedProducts} />
        <AnalyticsCard icon={<Clipboard size={24} />} title="Filed Complaints" value={complaintCount} />
        <AnalyticsCard icon={<TrendingUp size={24} />} title="Verified Partners" value={factories.length + sellers.length} />
      </div>

      {/* Top Trusted Factories */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Top Trusted Factories</h2>
        {factories.length === 0 ? (
          <p className="text-gray-400">Verified factory profiles will appear here as manufacturers register.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {factories.map(f => (
              <FactoryCard key={f._id} factory={f} selected={false} onSelect={() => {}} />
            ))}
          </div>
        )}
      </section>

      {/* Top Trusted Sellers */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Top Trusted Sellers</h2>
        {sellers.length === 0 ? (
          <p className="text-gray-400">Verified sellers will appear here as merchants register.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sellers.map(s => (
              <SellerInfoCard key={s._id} seller={s} />
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

    </section>
  );
};

export default TrustCenter;
