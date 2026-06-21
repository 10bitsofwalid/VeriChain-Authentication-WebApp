import React, { useEffect, useState } from 'react';
import client from '../api/client';
import NavBar from '../components/NavBar';
import HeroBanner from '../components/HeroBanner';
import CategoriesSection from '../components/CategoriesSection';
import ProductSection from '../components/ProductSection';
import Footer from '../components/Footer';
import type { ListedItem } from '../pages/Marketplace'; // reuse type if exported, else define inline

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
  const recommended = items.slice(6, 12);

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="marketplace-home">
      <NavBar />
      <HeroBanner />
      <CategoriesSection />
      <ProductSection title="Featured Products" products={featured} />
      <ProductSection title="Trending Products" products={trending} />
      <ProductSection title="Recently Verified" products={recentlyVerified} />
      <ProductSection title="Recommended Products" products={recommended} />
      {/* Placeholder for Top Verified Factories preview */}
      <Footer />
    </div>
  );
};

export default MarketplaceHome;
