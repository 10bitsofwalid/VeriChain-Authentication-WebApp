import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import FactoryCard from '../../components/FactoryCard';
import SellerProductCard from '../../components/SellerProductCard';

// Types (reuse existing where possible)
interface Factory {
  _id: string;
  name: string;
  logoUrl?: string;
  verificationStatus: string;
  trustScore?: number;
  country?: string;
  yearsVerified?: number;
  certifications?: string[];
  categories?: string[];
}

interface Product {
  _id: string;
  name: string;
  imageUrl?: string;
  batchId: string;
  availableQty: number;
  wholesalePrice: number;
  manufacturingDate: string;
  certifications?: string[];
  authenticityStatus: string;
  category?: string;
}

const SellerSourcing: React.FC = () => {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingFactories, setLoadingFactories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch verified factories on mount
  useEffect(() => {
    const fetchFactories = async () => {
      try {
        const res = await client.get('/users', { params: { role: 'factory', verified: true } });
        setFactories(res.data.users || []);
        if (res.data.users && res.data.users.length > 0) {
          setSelectedFactoryId(res.data.users[0]._id);
        }
      } catch (err: any) {
        console.error('Failed to load factories', err);
        setError('Could not load factories.');
      } finally {
        setLoadingFactories(false);
      }
    };
    fetchFactories();
  }, []);

  // Fetch products whenever a factory is selected
  useEffect(() => {
    if (!selectedFactoryId) return;
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setError('');
      try {
        const res = await client.get('/products/factory', { params: { factoryId: selectedFactoryId } });
        setProducts(res.data.products || []);
      } catch (err: any) {
        console.error('Failed to load inventory', err);
        setError('Could not load inventory for the selected factory.');
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [selectedFactoryId]);

  const handleFactorySelect = (factoryId: string) => {
    setSelectedFactoryId(factoryId);
  };

  if (loadingFactories) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="seller-sourcing-page animate-fade-in" style={{ padding: 'var(--space-lg)' }}>
      <h1 className="page-header">Factory Sourcing Marketplace</h1>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
          {error}
        </div>
      )}
      {/* Factory List */}
      <div className="factory-list" style={{ display: 'flex', gap: 'var(--space-md)', overflowX: 'auto', marginBottom: 'var(--space-xl)' }}>
        {factories.map((factory) => (
          <FactoryCard
            key={factory._id}
            factory={factory}
            selected={factory._id === selectedFactoryId}
            onSelect={() => handleFactorySelect(factory._id)}
          />
        ))}
      </div>

      {/* Inventory Grid */}
      <div className="inventory-section">
        {loadingProducts ? (
          <div className="loading-container" style={{ minHeight: '40vh' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-lg)' }}>
            {products.map((product) => (
              <SellerProductCard key={product._id} product={product} />
            ))}
            {products.length === 0 && (
              <div className="empty-state glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-xl)' }}>
                <p>No inventory available for this factory.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerSourcing;
