import { useEffect, useState } from 'react';
import PageLoader from '../components/ui/PageLoader';
import AlertBanner from '../components/ui/AlertBanner';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import LazyImage from '../components/LazyImage';
import {
  ShoppingBag,
  Search,
  Tag,
  AlertTriangle,
  User,
  Loader,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

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
  
  // Purchase states
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

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
      // Remove from list or refresh
      setItems(prev => prev.filter(i => i._id !== itemId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to purchase the item.');
    } finally {
      setBuyingId(null);
    }
  };

  // Get unique categories for filter
  const categories = ['All', ...Array.from(new Set(items.map(item => item.product?.category).filter(Boolean)))];

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.serialNumber?.toLowerCase().includes(search.toLowerCase()) ||
      item.product?.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.product?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const riskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'high': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  const verificationBadge = (status: string) => {
    switch (status) {
      case 'verified': return 'badge-success';
      case 'rejected': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  if (loading) {
    return <PageLoader minHeight="60vh" />;
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Verified Marketplace</h1>
        <p>Browse authentic, registered products listed by verified sellers</p>
      </div>

      {successMessage && (
        <AlertBanner
          type="success"
          message={successMessage}
          onDismiss={() => setSuccessMessage('')}
          style={{ marginBottom: 'var(--space-lg)' }}
        />
      )}

      {error && (
        <AlertBanner
          type="error"
          message={error}
          onDismiss={() => setError('')}
          style={{ marginBottom: 'var(--space-lg)' }}
        />
      )}

      {/* Filters */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-xl)',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search */}
        <div className="input-icon-wrapper" style={{ flex: '1', minWidth: '280px', maxWidth: '450px' }}>
          <Search size={16} className="input-icon" />
          <input
            type="text"
            className="form-input input-with-icon"
            placeholder="Search by product, serial, or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: 'var(--space-xs)', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="empty-state glass-card">
          <ShoppingBag size={48} />
          <h3>No Products Found</h3>
          <p>No products are currently listed matching your criteria or available on the platform.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {filteredItems.map(item => (
            <div key={item._id} className="glass-card animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Image Container */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '180px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'rgba(15, 20, 36, 0.4)',
                border: '1px solid var(--border-subtle)',
                marginBottom: 'var(--space-md)'
              }}>
                <LazyImage
                  src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80'}
                  alt={item.product?.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                  <span className={`badge ${verificationBadge(item.product?.verifiedStatus)}`}>
                    {item.product?.verifiedStatus === 'verified' ? 'Authentic' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Title & Specs */}
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <span className="badge badge-neutral" style={{ alignSelf: 'flex-start' }}>
                  <Tag size={10} style={{ marginRight: '2px' }} />
                  {item.product?.category}
                </span>

                <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '4px', color: 'var(--text-primary)' }}>
                  {item.product?.name}
                </h3>

                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minHeight: '40px'
                }}>
                  {item.product?.description}
                </p>

                {/* Technical Meta */}
                <div style={{
                  background: 'rgba(10, 14, 26, 0.4)',
                  padding: 'var(--space-sm)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  border: '1px solid var(--border-subtle)',
                  marginTop: 'var(--space-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Serial:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{item.serialNumber}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>SKU:</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{item.product?.sku}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Counterfeit Risk:</span>
                    <span className={`badge ${riskBadge(item.counterfeitRisk)}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                      {item.counterfeitRisk}
                    </span>
                  </div>
                </div>

                {/* Seller Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)', fontSize: '13px' }}>
                  <User size={14} color="var(--text-muted)" />
                  <span style={{ color: 'var(--text-muted)' }}>Seller:</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{item.currentOwner?.name}</span>
                </div>
              </div>

              {/* Purchase Footer */}
              <div style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-default)', display: 'flex', gap: 'var(--space-xs)' }}>
                {user?.role === 'buyer' ? (
                  <button
                    className="btn btn-primary"
                    style={{ flex: '1' }}
                    onClick={() => handleBuy(item._id)}
                    disabled={buyingId === item._id}
                  >
                    {buyingId === item._id ? (
                      <>
                        <Loader size={14} className="spin" /> Purchasing...
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} /> Buy Product
                      </>
                    )}
                  </button>
                ) : (
                  <span style={{ flex: '1', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', padding: '6px 0' }}>
                    Logged in as {user?.role}
                  </span>
                )}
                {item.product?.certificateUrl && (
                  <a
                    href={item.product.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    title="View Authenticity Certificate"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
