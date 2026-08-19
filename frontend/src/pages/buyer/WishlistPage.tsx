import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  IconHeart as Heart,
  IconShoppingBag as ShoppingBag,
  IconTrash as Trash2,
  IconShieldCheck as ShieldCheck,
  IconArrowRight as ArrowRight,
} from '@tabler/icons-react';
import './BuyerExperience.css';
import BuyerNav from './BuyerNav';
import { useShopping } from '../../context/ShoppingContext';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { wishlist, dispatch } = useShopping();
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const removeItem = (id: string) => {
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

  const clearAll = () => {
    wishlist.forEach(item => {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: item.id });
    });
  };

  return (
    <div className="buyer-page">
      <BuyerNav wishlistCount={wishlist.length} />

      <div className="bx-header">
        <div className="bx-header-left">
          <h1>
            My Wishlist
            <span className="bx-count-badge">{wishlist.length}</span>
          </h1>
          <p>Saved authentic products you're watching</p>
        </div>
        {wishlist.length > 0 && (
          <button 
            className="bx-btn-ghost"
            onClick={clearAll}
          >
            Clear All Items
          </button>
        )}
      </div>

      {addedMessage && (
        <div style={{
          marginBottom: 'var(--space-md)',
          padding: '12px 16px',
          background: 'rgba(0, 88, 188, 0.1)',
          border: '1px solid rgba(0, 88, 188, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--accent-cyan)',
          fontWeight: 600,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <ShieldCheck size={16} />
          {addedMessage}
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="bx-empty">
          <div className="bx-empty-icon">
            <Heart size={36} />
          </div>
          <h2>Your wishlist is empty</h2>
          <p>Save items you like while browsing to easily track and purchase authentic products.</p>
          <Link to="/dashboard/marketplace" className="bx-btn-primary">
            <ShoppingBag size={16} /> Discover Products
          </Link>
        </div>
      ) : (
        <div className="bx-product-grid">
          {wishlist.map(item => (
            <div key={item.id} className="bx-wish-card">
              <div className="bx-wish-img-wrap">
                <img src={item.imageUrl || (item as any).image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'} alt={item.name} className="bx-wish-img" />
                <button
                  className="bx-wish-remove-btn"
                  onClick={() => removeItem(item.id)}
                  title="Remove from wishlist"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="bx-wish-body">
                <div className="bx-wish-name">{item.name}</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0' }}>
                  <span className="bx-verified">
                    <ShieldCheck size={10} /> Verified Authentic
                  </span>
                </div>

                <div className="bx-wish-price-row">
                  <span className="bx-wish-price">${(Number(item.price) || 0).toFixed(2)}</span>
                </div>

                <div className="bx-wish-footer">
                  <button
                    className="bx-btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingBag size={14} /> Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBuyNow(item)}
                    className="bx-btn-ghost"
                    style={{ padding: '8px 10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Buy now"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
