import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import FactoryCard from '../components/FactoryCard';
import SellerProductCard from '../components/SellerProductCard';
import SkeletonFactoryCard from '../components/SkeletonFactoryCard';
import SkeletonProductCard from '../components/SkeletonProductCard';
import EmptyState from '../components/EmptyState';
import { Search } from 'lucide-react';

interface Factory {
  _id: string;
  name: string;
  logoUrl?: string;
  verificationStatus: string;
  trustScore?: number;
  country?: string;
  yearsVerified?: number;
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

export default function SellerSourcing() {
  const { user } = useAuth();
  const [factories, setFactories] = useState<Factory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [loadingFactories, setLoadingFactories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [sortBy, setSortBy] = useState('Newest');

  // Fetch factories once
  useEffect(() => {
    client
      .get('/users?role=factory&verified=true')
      .then((res) => setFactories(res.data.users))
      .catch(() => setError('Failed to load factories'))
      .finally(() => setLoadingFactories(false));
  }, []);

  // Fetch products when a factory is selected
  useEffect(() => {
    if (!selectedFactory) {
      setProducts([]);
      return;
    }
    setLoadingProducts(true);
    client
      .get(`/products/factory?factoryId=${selectedFactory._id}`)
      .then((res) => setProducts(res.data.products))
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoadingProducts(false));
  }, [selectedFactory]);

  // Filtering & sorting
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.batchId.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const matchesPrice = p.wholesalePrice >= priceRange[0] && p.wholesalePrice <= priceRange[1];
      const matchesAvailability = !availabilityOnly || p.availableQty > 0;
      const matchesVerified = !verifiedOnly || p.authenticityStatus === 'verified';
      return matchesSearch && matchesCategory && matchesPrice && matchesAvailability && matchesVerified;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'PriceLowHigh':
          return a.wholesalePrice - b.wholesalePrice;
        case 'PriceHighLow':
          return b.wholesalePrice - a.wholesalePrice;
        case 'Newest':
          return new Date(b.manufacturingDate).getTime() - new Date(a.manufacturingDate).getTime();
        default:
          return 0;
      }
    });

  if (!user?.role?.includes('seller')) {
    return <div className="alert alert-error">Access denied: Sellers only.</div>;
  }

  return (
    <div className="animate-fade-in" style={{ padding: 'var(--space-xl)' }}>
      <h1 className="page-header">Factory Sourcing Portal</h1>
      {error && <div className="alert alert-error">{error}</div>}

      {/* Factory selection */}
      <section>
        <h2>Verified Factories</h2>
        {loadingFactories ? (
          <div className="factory-grid">
            {[...Array(4)].map((_, i) => (
              <SkeletonFactoryCard key={i} />
            ))}
          </div>
        ) : factories.length === 0 ? (
          <EmptyState message="No verified factories available." />
        ) : (
          <div className="factory-grid">
            {factories.map((f) => (
              <FactoryCard
                key={f._id}
                factory={f}
                selected={selectedFactory?._id === f._id}
                onSelect={() => setSelectedFactory(f)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Filters */}
      {selectedFactory && (
        <section style={{ marginTop: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', alignItems: 'center' }}>
            {/* Search */}
            <div className="input-icon-wrapper" style={{ flex: '1', minWidth: '250px' }}>
              <Search size={16} className="input-icon" />
              <input
                type="text"
                className="form-input input-with-icon"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Category */}
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {/* dynamically generate categories */}
              {Array.from(new Set(products.map((p) => p.category).filter(Boolean))).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {/* Price range (simple) */}
            <input
              type="range"
              min={0}
              max={1000}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            />
            {/* Availability toggle */}
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={availabilityOnly}
                onChange={() => setAvailabilityOnly(!availabilityOnly)}
              />
              In Stock Only
            </label>
            {/* Verified only toggle */}
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={() => setVerifiedOnly(!verifiedOnly)}
              />
              Verified Only
            </label>
            {/* Sort */}
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Newest">Newest</option>
              <option value="PriceLowHigh">Price: Low‑to‑High</option>
              <option value="PriceHighLow">Price: High‑to‑Low</option>
            </select>
          </div>
        </section>
      )}

      {/* Product grid */}
      {selectedFactory && (
        <section style={{ marginTop: 'var(--space-xl)' }}>
          <h2>Products from {selectedFactory.name}</h2>
          {loadingProducts ? (
            <div className="product-grid">
              {[...Array(6)].map((_, i) => (
                <SkeletonProductCard key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState message="No products match your criteria." />
          ) : (
            <div className="product-grid">
              {filteredProducts.map((p) => (
                <SellerProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
