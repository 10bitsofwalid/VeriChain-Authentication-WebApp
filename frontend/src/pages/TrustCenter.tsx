import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { TrendingUp, Users, Clipboard, CheckCircle } from 'lucide-react';
import FactoryCard from '../components/FactoryCard';
import SellerInfoCard from '../components/SellerInfoCard';
import AnalyticsCard from '../components/AnalyticsCard';
import { useNavigate } from 'react-router-dom';

// Types for fetched data
interface Product {
  _id: string;
  verified: boolean;
}

interface Factory {
  _id: string;
  name: string;
  logoUrl?: string;
  verificationStatus: string;
  trustScore?: number;
  country?: string;
  yearsVerified?: number;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, facRes, sellRes] = await Promise.all([
          client.get('/products'),
          client.get('/users?role=factory&verified=true'),
          client.get('/users?role=seller&verified=true'),
        ]);
        setProducts(prodRes.data);
        // Top factories by trustScore
        const topFactories = (facRes.data as Factory[])
          .filter(f => f.trustScore !== undefined)
          .sort((a, b) => (b.trustScore ?? 0) - (a.trustScore ?? 0))
          .slice(0, 6);
        setFactories(topFactories);
        // Top sellers by trustScore
        const topSellers = (sellRes.data as Seller[])
          .filter(s => s.trustScore !== undefined)
          .sort((a, b) => (b.trustScore ?? 0) - (a.trustScore ?? 0))
          .slice(0, 6);
        setSellers(topSellers);
      } catch (err) {
        console.error('Error loading Trust Center data', err);
        // Fallback mock data to keep UI functional
        setProducts([]);
        setFactories([
          { _id: '1', name: 'Alpha Manufacturing', verificationStatus: 'verified', trustScore: 96 },
          { _id: '2', name: 'Beta Tools', verificationStatus: 'verified', trustScore: 93 },
        ]);
        setSellers([
          { _id: 's1', name: 'EcoStore', trustScore: 98, rating: 4.9, verified: true },
          { _id: 's2', name: 'PureGoods', trustScore: 95, rating: 4.7, verified: true },
        ]);
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
  const verifiedProducts = products.filter(p => p.verified).length;
  const counterfeitReports = 12; // placeholder/mock
  const verificationsToday = 34; // placeholder/mock

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
          Transparent Ownership • Verified Supply Chain
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/verify')}
          style={{ background: 'linear-gradient(135deg, #0058bc, #0070eb)' }}
        >
          Verify Product
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard icon={<Users size={24} />} title="Total Products" value={totalProducts} />
        <AnalyticsCard icon={<CheckCircle size={24} />} title="Products Verified" value={verifiedProducts} />
        <AnalyticsCard icon={<Clipboard size={24} />} title="Counterfeit Reports" value={counterfeitReports} />
        <AnalyticsCard icon={<TrendingUp size={24} />} title="Verifications Today" value={verificationsToday} />
      </div>

      {/* Top Trusted Factories */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Top Trusted Factories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {factories.map(f => (
            <FactoryCard key={f._id} factory={f} selected={false} onSelect={() => {}} />
          ))}
        </div>
      </section>

      {/* Top Trusted Sellers */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Top Trusted Sellers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sellers.map(s => (
            <SellerInfoCard key={s._id} seller={s} />
          ))}
        </div>
      </section>
    </section>
  );
};

export default TrustCenter;
