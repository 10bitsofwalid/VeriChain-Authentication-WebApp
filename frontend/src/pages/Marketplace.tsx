import { useEffect, useState } from 'react';
import PageLoader from '../components/ui/PageLoader';
import AlertBanner from '../components/ui/AlertBanner';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import LazyImage from '../components/LazyImage';
import { Search, ShoppingBag, Loader, ExternalLink, User } from 'lucide-react';
import SearchBar from '../design-system/components/SearchBar';
import CategoryFilter from '../design-system/components/CategoryFilter';
import ProductCard from '../components/ProductCard';
import PaginationControls from '../design-system/components/PaginationControls';


export interface ListedItem {
  _id: string;
  serialNumber: string;
  counterfeitRisk: string;
  product: {
    name: string;
    description: string;
    category: string;
    sku: string;
    imageUrl: string;
    certificateUrl?: string;
    verifiedStatus: string;
  };
  currentOwner: {
    name: string;
    email: string;
    role: string;
  };
  updatedAt: string;
}

export default function Marketplace() {
  const { user } = useAuth();
  const [items, setItems] = useState<ListedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchMarketplace = async () => {
    try {
      const res = await client.get('/items/marketplace');
      setItems(res.data.items);
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

  const handleBuy = async (itemId: string) => {
    setBuyingId(itemId);
    setError('');
    setSuccessMessage('');
    try {
      const res = await client.post(`/items/${itemId}/buy`);
      setSuccessMessage(res.data.message || 'Item purchased successfully!');
      setItems(prev => prev.filter(i => i._id !== itemId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to purchase the item.');
    } finally {
      setBuyingId(null);
    }
  };

  const categories = ['All', ...Array.from(new Set(items.map(i => i.product?.category).filter(Boolean)))];

  const matchesSearch = (item: ListedItem) => {
    const term = search.toLowerCase();
    return (
      item.product?.name?.toLowerCase().includes(term) ||
      item.serialNumber?.toLowerCase().includes(term) ||
      item.product?.sku?.toLowerCase().includes(term)
    );
  };

  const filtered = items.filter(i => matchesSearch(i) && (selectedCategory === 'All' || i.product?.category === selectedCategory));

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <PageLoader minHeight="60vh" />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Verified Marketplace</h1>
        <p>Browse authentic, registered products listed by verified sellers</p>
      </div>

      {successMessage && (
        <AlertBanner type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} style={{ marginBottom: 'var(--space-lg)' }} />
      )}
      {error && (
        <AlertBanner type="error" message={error} onDismiss={() => setError('')} style={{ marginBottom: 'var(--space-lg)' }} />
      )}

      <div className="marketplace-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', alignItems: 'center', justifyContent: 'space-between' }}>
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by product, serial, or SKU..." />
        <CategoryFilter categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {paginatedItems.length === 0 ? (
        <div className="empty-state glass-card">
          <ShoppingBag size={48} />
          <h3>No Products Found</h3>
          <p>No products are currently listed matching your criteria or available on the platform.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {paginatedItems.map(item => (
            <ProductCard
              key={item._id}
              item={item}
              userRole={user?.role}
              buyingId={buyingId}
              onBuy={handleBuy}
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
