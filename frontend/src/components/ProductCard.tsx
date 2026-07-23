import { memo } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, ExternalLink, Heart, Scale, ShoppingBag, Tag, User } from 'lucide-react';
import LazyImage from './LazyImage';
import { useShopping } from '../context/ShoppingContext';
import { riskBadge, verificationBadge } from '../utils/badges';
import { useProductPlaceholder } from '../hooks/useProductPlaceholder';

interface ProductCardProps {
  item: any;
}

function toneFromBadge(className: string) {
  if (className.includes('success')) return 'success';
  if (className.includes('warning')) return 'warning';
  if (className.includes('danger')) return 'danger';
  return 'neutral';
}

export const ProductCard = ({ item }: ProductCardProps) => {
  const { dispatch, wishlist, compare } = useShopping();
  const productId = item.product?._id || item.product?.id || item._id;
  const placeholder = useProductPlaceholder(item);

  const inWishlist = wishlist.some((p) => p.id === productId);
  const inCompare = compare.some((p) => p.id === productId);
  const riskTone = toneFromBadge(riskBadge(item.counterfeitRisk));
  const verificationTone = toneFromBadge(verificationBadge(item.product?.verifiedStatus));

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: productId,
        name: item.product?.name || 'Authenticated product',
        price: Number(placeholder.price),
        imageUrl: item.product?.imageUrl || '',
        quantity: 1,
      },
    });
  };

  const handleToggleWishlist = () => {
    if (inWishlist) {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
    } else {
      dispatch({
        type: 'ADD_TO_WISHLIST',
        payload: {
          id: productId,
          name: item.product?.name || 'Authenticated product',
          price: Number(placeholder.price),
          imageUrl: item.product?.imageUrl || '',
        },
      });
    }
  };

  const handleToggleCompare = () => {
    if (inCompare) {
      dispatch({ type: 'REMOVE_FROM_COMPARE', payload: productId });
    } else if (compare.length < 4) {
      dispatch({
        type: 'ADD_TO_COMPARE',
        payload: {
          id: productId,
          name: item.product?.name || 'Authenticated product',
          price: Number(placeholder.price),
        },
      });
    }
  };

  return (
    <article className="product-card">
      <Link to={`/product/${item._id}`} className="product-card-media" aria-label={`View ${item.product?.name || 'product'}`}>
        <LazyImage
          src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=900&q=80'}
          alt={item.product?.name || 'Verified product'}
        />
        <span className={`product-status product-status-${verificationTone}`}>
          <BadgeCheck size={14} />
          {item.product?.verifiedStatus === 'verified' ? 'Blockchain verified' : 'Pending review'}
        </span>
      </Link>

      <div className="product-card-body">
        <div className="product-card-kicker">
          <span><Tag size={13} /> {item.product?.category || 'Verified'}</span>
          <span className={`product-risk product-risk-${riskTone}`}>{item.counterfeitRisk || 'low'} risk</span>
        </div>

        <Link to={`/product/${item._id}`} className="product-card-title">
          {item.product?.name || 'Authenticated product'}
        </Link>
        <p>{item.product?.description || 'Verified product with traceable ownership and provenance history.'}</p>

        <div className="product-trust-row">
          <div>
            <span>Trust score</span>
            <strong>{placeholder.trustScore}%</strong>
          </div>
          <div>
            <span>Price</span>
            <strong>${placeholder.price}</strong>
          </div>
          <div>
            <span>Stock</span>
            <strong>{placeholder.stock}</strong>
          </div>
        </div>

        <div className="product-meta-list">
          <span><User size={14} /> {item.currentOwner?.name || 'Verified seller'}</span>
          <span>{placeholder.factoryName}</span>
          <span className="product-serial">{item.serialNumber}</span>
        </div>
      </div>

      <div className="product-card-actions">
        <button
          className="product-card-primary"
          onClick={handleAddToCart}
          type="button"
        >
          <ShoppingBag size={16} />
          Add
        </button>
        <Link to={`/verify?serial=${item.serialNumber}`} className="product-card-secondary">
          Verify
        </Link>
        <button
          className={`product-icon-button ${inWishlist ? 'product-icon-active' : ''}`}
          title="Add to Wishlist"
          type="button"
          onClick={handleToggleWishlist}
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
        <button
          className={`product-icon-button ${inCompare ? 'product-icon-active' : ''}`}
          title="Add to Compare"
          type="button"
          onClick={handleToggleCompare}
        >
          <Scale size={16} />
        </button>
        {item.product?.certificateUrl && (
          <a href={item.product.certificateUrl} target="_blank" rel="noreferrer" className="product-icon-button" title="View certificate">
            <ExternalLink size={16} />
          </a>
        )}
      </div>
    </article>
  );
};

export default memo(ProductCard);
