import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useShopping } from '../context/ShoppingContext';
import { Heart, ShoppingBag, Trash2, ShieldCheck, ArrowRight } from 'lucide-react';
import ActionButton from '../components/ui/ActionButton';
import './MarketplaceHome.css';

export default function Wishlist() {
  const { wishlist, dispatch } = useShopping();
  const navigate = useNavigate();
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: id });
  };

  const handleAddToCart = (item: any) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: item.id,
        productId: item.productId || item.id,
        itemInstanceId: item.itemInstanceId || (item.serialNumber ? item.id : undefined),
        serialNumber: item.serialNumber,
        sku: item.sku,
        name: item.name,
        price: Number(item.price) || 0,
        imageUrl: item.imageUrl || item.image,
        quantity: 1,
        verified: item.verified !== false,
      },
    });
    setAddedMessage(`"${item.name}" added to cart!`);
    setTimeout(() => setAddedMessage(null), 3000);
  };

  const handleBuyNow = (item: any) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: item.id,
        productId: item.productId || item.id,
        itemInstanceId: item.itemInstanceId || (item.serialNumber ? item.id : undefined),
        serialNumber: item.serialNumber,
        sku: item.sku,
        name: item.name,
        price: Number(item.price) || 0,
        imageUrl: item.imageUrl || item.image,
        quantity: 1,
        verified: item.verified !== false,
      },
    });
    navigate('/buyer/checkout');
  };

  const handleClearAll = () => {
    wishlist.forEach((item) => {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: item.id });
    });
  };

  return (
    <div className="marketplace-home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />

      <main className="page-container" style={{ flex: 1, padding: 'var(--space-xl) var(--space-md)' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-xl)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 'var(--space-xs)' }}>
              <span className="marketplace-eyebrow">Saved Items</span>
              <span className="bx-count-badge" style={{ marginLeft: 4 }}>
                {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'}
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              My Wishlist
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.95rem' }}>
              Track authentic products you love and purchase when ready.
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleClearAll}
              style={{ color: 'var(--color-danger)' }}
            >
              <Trash2 size={15} /> Clear All Items
            </button>
          )}
        </div>

        {addedMessage && (
          <div
            style={{
              marginBottom: 'var(--space-md)',
              padding: '12px 16px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#059669',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ShieldCheck size={16} />
            {addedMessage}
          </div>
        )}

        {wishlist.length === 0 ? (
          <div
            className="glass-card"
            style={{
              textAlign: 'center',
              padding: 'var(--space-3xl) var(--space-lg)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--accent-bg)',
                color: 'var(--accent-purple)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-md)',
              }}
            >
              <Heart size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Your wishlist is currently empty
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 420, margin: '0.5rem auto var(--space-lg)' }}>
              Explore our marketplace to save authentic products with verified blockchain provenance.
            </p>
            <ActionButton variant="primary" size="md" onClick={() => navigate('/dashboard/marketplace')}>
              <ShoppingBag size={16} /> Discover Products
            </ActionButton>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--space-lg)',
            }}
          >
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-default)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                }}
              >
                <div style={{ position: 'relative', height: 200, background: 'var(--bg-secondary)' }}>
                  <img
                    src={item.imageUrl || (item as any).image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    title="Remove from wishlist"
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 0,
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#EF4444',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ padding: 'var(--space-md)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#059669',
                          background: 'rgba(16, 185, 129, 0.12)',
                          padding: '2px 6px',
                          borderRadius: '999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <ShieldCheck size={11} /> Verified
                      </span>
                    </div>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block', lineHeight: 1.3 }}>
                      {item.name}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-xs)' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
                      ${(Number(item.price) || 0).toFixed(2)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-xs)' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddToCart(item)}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleBuyNow(item)}
                      style={{ padding: '0 12px', fontSize: '0.8rem', fontWeight: 600 }}
                      title="Buy now"
                    >
                      Buy Now
                    </button>
                    <Link
                      to={`/product/${item.productId || item.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0 10px' }}
                      title="View Details"
                    >
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
