import React, { useEffect, useState } from 'react';
import PageLoader from '../components/ui/PageLoader';
import client from '../api/client';
import NavBar from '../components/NavBar';
import HeroBanner from '../components/HeroBanner';
import CategoriesSection from '../components/CategoriesSection';
import ProductSection from '../components/ProductSection';
import Footer from '../components/Footer';
import type { ListedItem } from '../pages/Marketplace'; // reuse type if exported, else define inline
import './MarketplaceHome.css';

const MarketplaceHome: React.FC = () => {
  const [items, setItems] = useState<ListedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await client.get('/items/marketplace');
        setItems(res.data.items);
      } catch (err) {
        console.error('Failed to fetch marketplace items', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Derive sections (simple mock logic)
  const featured = items.slice(0, 6);
  const trending = [...items].sort((a, b) => {
    const score = (x: ListedItem) => x.counterfeitRisk === 'low' ? 3 : (x.counterfeitRisk === 'medium' ? 2 : 1);
    return score(b) - score(a);
  }).slice(0, 6);
  const recentlyVerified = [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6);
  const trustedManufacturers = Array.from(new Set(items.map((item) => item.product?.category).filter(Boolean))).slice(0, 4);
  const trustedSellers = items.slice(0, 4).map((item) => item.currentOwner?.name).filter(Boolean);

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
            {(trustedManufacturers.length ? trustedManufacturers : ['Electronics', 'Luxury Goods', 'Pharmaceuticals', 'Apparel']).map((name, index) => (
              <div key={name}>
                <strong>{name} Collective</strong>
                <span>{96 - index}% trust score</span>
              </div>
            ))}
          </div>
        </div>
        <div className="marketplace-insight-card">
          <span className="marketplace-eyebrow">Sellers</span>
          <h2>Top trusted sellers</h2>
          <div className="leader-list">
            {(trustedSellers.length ? trustedSellers : ['Northstar Supply', 'Ledger Goods', 'Proof Market', 'Origin House']).map((name, index) => (
              <div key={`${name}-${index}`}>
                <strong>{name}</strong>
                <span>{420 - index * 42} verified listings</span>
              </div>
            ))}
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
