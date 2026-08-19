import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageLoader from '../components/ui/PageLoader';
import AlertBanner from '../components/ui/AlertBanner';
import client from '../api/client';
import { ShoppingBag, Plus, Filter, ArrowUpDown } from 'lucide-react';
import SearchBar from '../design-system/components/SearchBar';
import CategoryFilter from '../design-system/components/CategoryFilter';
import ProductCard from '../components/ProductCard';
import PaginationControls from '../design-system/components/PaginationControls';
import { useAuth } from '../context/AuthContext';
import './MarketplaceHome.css';

export interface ListedItem {
  _id: string;
  serialNumber: string;
  counterfeitRisk: string;
  product: {
    _id?: string;
    id?: string;
    name: string;
    description: string;
    category: string;
    sku: string;
    price?: number;
    imageUrl: string;
    certificateUrl?: string;
    verifiedStatus: string;
    specs?: Record<string, string>;
  };
  currentOwner: {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    role: string;
    trustScore?: number;
    verified?: boolean;
    logoUrl?: string;
  };
  updatedAt: string;
}

export default function Marketplace() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const [items, setItems] = useState<ListedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'trust'>('newest');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium'>('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    if (categoryParam) {
      if (categoryParam.toLowerCase() === 'all') {
        setSelectedCategory('All');
      } else {
        setSelectedCategory(categoryParam);
      }
    }
    if (searchParam) {
      setSearch(searchParam);
    }
  }, [categoryParam, searchParam]);

  const fetchMarketplace = async () => {
    try {
      const res = await client.get('/items/marketplace');
      setItems(res.data.items || []);
    } catch (err: any) {
      console.error('Failed to fetch marketplace:', err);
      setError('Could not load marketplace items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplace();
  }, []);

  const categories = ['All', ...Array.from(new Set(items.map(i => i.product?.category).filter(Boolean)))];

  const matchesSearch = (item: ListedItem) => {
    const term = search.toLowerCase();
    return (
      item.product?.name?.toLowerCase().includes(term) ||
      item.serialNumber?.toLowerCase().includes(term) ||
      item.product?.sku?.toLowerCase().includes(term) ||
      item.currentOwner?.name?.toLowerCase().includes(term) ||
      item.product?.description?.toLowerCase().includes(term)
    );
  };

  let filtered = items.filter(i => {
    const matchesCat = selectedCategory === 'All' || i.product?.category === selectedCategory;
    const matchesRisk = riskFilter === 'all' || i.counterfeitRisk === riskFilter;
    return matchesSearch(i) && matchesCat && matchesRisk;
  });

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'price_asc') {
      return (Number(a.product?.price) || 100) - (Number(b.product?.price) || 100);
    }
    if (sortBy === 'price_desc') {
      return (Number(b.product?.price) || 100) - (Number(a.product?.price) || 100);
    }
    if (sortBy === 'trust') {
      return (b.currentOwner?.trustScore ?? 99) - (a.currentOwner?.trustScore ?? 99);
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isSellerOrAdmin = user && (user.role === 'seller' || user.role === 'factory' || user.role === 'admin');

  if (loading) return <PageLoader minHeight="60vh" />;

  return (
    <div className="animate-fade-in marketplace-page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1>Verified Marketplace</h1>
          <p>Explore authentic, ledger-registered luxury merchandise with direct seller inquiries and provenance validation.</p>
        </div>

        {isSellerOrAdmin && (
          <Link
            to="/dashboard/inventory?tab=listings&action=new"
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              fontWeight: 700,
            }}
          >
            <Plus size={18} />
            <span>Add Product to Marketplace</span>
          </Link>
        )}
      </div>

      {successMessage && (
        <AlertBanner type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} style={{ marginBottom: 'var(--space-lg)' }} />
      )}
      {error && (
        <AlertBanner type="error" message={error} onDismiss={() => setError('')} style={{ marginBottom: 'var(--space-lg)' }} />
      )}

      {/* Control Bar: Search, Category, Sorting, Risk Filter */}
      <div className="marketplace-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: '1 1 300px' }}>
          <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by product, SKU, serial, or verified merchant..." />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <ArrowUpDown size={14} />
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto' }}
            >
              <option value="newest">Newest Listed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="trust">Highest Trust Score</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Filter size={14} />
            <select
              className="form-select"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto' }}
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk (Verified)</option>
              <option value="medium">Medium Risk</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <CategoryFilter categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {paginatedItems.length === 0 ? (
        <div className="empty-state glass-card" style={{ padding: 'var(--space-3xl)' }}>
          <ShoppingBag size={48} />
          <h3>No Products Found</h3>
          <p>No products currently match your search filters or catalog criteria.</p>
          {isSellerOrAdmin && (
            <Link
              to="/dashboard/inventory?tab=listings&action=new"
              className="btn btn-primary"
              style={{ marginTop: 'var(--space-md)' }}
            >
              <Plus size={16} /> List the First Product
            </Link>
          )}
        </div>
      ) : (
        <div className="grid-cards">
          {paginatedItems.map(item => (
            <ProductCard
              key={item._id}
              item={item}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </div>
  );
}
