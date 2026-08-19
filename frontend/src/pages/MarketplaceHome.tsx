import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageLoader from '../components/ui/PageLoader';
import client from '../api/client';
import NavBar from '../components/NavBar';
import HeroBanner from '../components/HeroBanner';
import CategoriesSection from '../components/CategoriesSection';
import ProductSection from '../components/ProductSection';
import Footer from '../components/Footer';
import type { ListedItem } from '../pages/Marketplace';
import './MarketplaceHome.css';

interface VerifiedEntity {
  _id: string;
  name: string;
  trustScore?: number;
}

const MarketplaceHome: React.FC = () => {
  const [items, setItems] = useState<ListedItem[]>([]);
  const [factories, setFactories] = useState<VerifiedEntity[]>([]);
  const [sellers, setSellers] = useState<VerifiedEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [itemsRes, facRes, sellRes] = await Promise.allSettled([
          client.get('/items/marketplace'),
          client.get('/users?role=factory&verified=true'),
          client.get('/users?role=seller&verified=true'),
        ]);

        if (itemsRes.status === 'fulfilled' && itemsRes.value.data?.items) {
          setItems(itemsRes.value.data.items);
        }
        if (facRes.status === 'fulfilled' && Array.isArray(facRes.value.data)) {
          setFactories(facRes.value.data.slice(0, 4));
        }
        if (sellRes.status === 'fulfilled' && Array.isArray(sellRes.value.data)) {
          setSellers(sellRes.value.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to fetch marketplace data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const featured = items.slice(0, 6);
  const trending = [...items].sort((a, b) => {
    const score = (x: ListedItem) => x.counterfeitRisk === 'low' ? 3 : (x.counterfeitRisk === 'medium' ? 2 : 1);
    return score(b) - score(a);
  }).slice(0, 6);
  const recentlyVerified = [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6);

  if (loading) {
    return <PageLoader minHeight="60vh" />;
  }

  return (
    <div className="marketplace-home">
      <NavBar />
      <HeroBanner />
      <CategoriesSection />
      <ProductSection title="Featured Products" products={featured} />
      <ProductSection title="Trending Products" products={trending} />
      <ProductSection title="Recently Verified" products={recentlyVerified} />
      <section className="marketplace-insight-grid" aria-label="Trusted marketplace leaders">
        <div className="marketplace-insight-card">
          <span className="marketplace-eyebrow">Manufacturers</span>
          <h2>Top trusted manufacturers</h2>
          <div className="leader-list">
            {factories.length > 0 ? (
              factories.map((fac) => (
                <Link
                  key={fac._id}
                  to={`/factory/${fac._id}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', transition: 'background 0.2s ease' }}
                  className="leader-item-link"
                >
                  <strong style={{ color: 'var(--text-primary)' }}>{fac.name}</strong>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{fac.trustScore ?? 100}% trust score</span>
                </Link>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 'var(--space-md) 0' }}>
                Verified manufacturers will be listed here as they register on the network.
              </p>
            )}
          </div>
        </div>
        <div className="marketplace-insight-card">
          <span className="marketplace-eyebrow">Sellers</span>
          <h2>Top trusted sellers</h2>
          <div className="leader-list">
            {sellers.length > 0 ? (
              sellers.map((seller) => (
                <Link
                  key={seller._id}
                  to={`/seller/${seller._id}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', transition: 'background 0.2s ease' }}
                  className="leader-item-link"
                >
                  <strong style={{ color: 'var(--text-primary)' }}>{seller.name}</strong>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{seller.trustScore ?? 100}% trust score</span>
                </Link>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 'var(--space-md) 0' }}>
                Verified sellers will be listed here as they register on the network.
              </p>
            )}
          </div>
        </div>
      </section>
      <section className="why-verichain">
        <span className="marketplace-eyebrow">Why VeriChain</span>
        <h2>Authentication that follows every product from factory to owner.</h2>
        <div className="why-grid">
          <div><strong>Blockchain certificates</strong><span>Immutable proof of production, QA, shipping, sale, and ownership transfer.</span></div>
          <div><strong>Marketplace trust</strong><span>Seller and manufacturer signals help buyers evaluate authenticity before purchase.</span></div>
          <div><strong>Instant verification</strong><span>Serial, QR, and product records connect shoppers to the ledger in seconds.</span></div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default MarketplaceHome;
