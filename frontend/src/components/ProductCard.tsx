import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IconRosetteDiscountCheck as BadgeCheck,
  IconExternalLink as ExternalLink,
  IconHeart as Heart,
  IconMessage as MessageSquare,
  IconScale as Scale,
  IconShoppingBag as ShoppingBag,
  IconTag as Tag,
  IconUser as User,
} from '@tabler/icons-react';
import LazyImage from './LazyImage';
import { useShopping } from '../context/ShoppingContext';
import { riskBadge, verificationBadge } from '../utils/badges';
import { useProductPlaceholder } from '../hooks/useProductPlaceholder';
import ContactSellerModal from './ContactSellerModal';
import '../pages/MarketplaceHome.css';

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
  const [showContactModal, setShowContactModal] = useState(false);
  const { dispatch, wishlist, compare } = useShopping();
  const itemInstanceId = item._id;
  const productId = item.product?._id || item.product?.id || item._id;
  const placeholder = useProductPlaceholder(item);

  const inWishlist = wishlist.some((p) => p.id === itemInstanceId || p.id === productId);
  const inCompare = compare.some((p) => p.id === itemInstanceId || p.id === productId);
  const riskTone = toneFromBadge(riskBadge(item.counterfeitRisk));
  const verificationTone = toneFromBadge(verificationBadge(item.product?.verifiedStatus));

  const isVerifiedStatus = item.product?.verifiedStatus === 'verified' || item.status === 'listed';
  const effectiveVerificationTone = isVerifiedStatus ? 'success' : verificationTone;

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: itemInstanceId,
        productId,
        itemInstanceId: item._id,
        serialNumber: item.serialNumber,
        sku: item.product?.sku,
        name: placeholder.name,
        price: Number(placeholder.price) || 100,
        imageUrl: placeholder.imageUrl,
        quantity: 1,
        verified: isVerifiedStatus,
      },
    });
  };

  const handleToggleWishlist = () => {
    if (inWishlist) {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: itemInstanceId });
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
    } else {
      dispatch({
        type: 'ADD_TO_WISHLIST',
        payload: {
          id: itemInstanceId,
          productId,
          itemInstanceId: item._id,
          serialNumber: item.serialNumber,
          sku: item.product?.sku,
          name: placeholder.name,
          price: Number(placeholder.price) || 100,
          imageUrl: placeholder.imageUrl,
          verified: isVerifiedStatus,
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
          productId: item.product?._id || productId,
          name: placeholder.name,
          price: Number(placeholder.price) || 100,
          imageUrl: placeholder.imageUrl,
          category: placeholder.category,
          sku: item.product?.sku || 'SKU-001',
          serialNumber: item.serialNumber,
          counterfeitRisk: item.counterfeitRisk || 'low',
          verified: isVerifiedStatus,
        },
      });
    }
  };

  return (
    <article className="product-card">
      <Link to={`/product/${item._id}`} className="product-card-media" aria-label={`View ${placeholder.name}`}>
        <LazyImage
          src={placeholder.imageUrl}
          alt={placeholder.name}
        />
        <span className={`product-status product-status-${effectiveVerificationTone}`}>
          <BadgeCheck size={14} />
          {isVerifiedStatus ? 'Blockchain verified' : 'Pending review'}
        </span>
      </Link>

      <div className="product-card-body">
        <div className="product-card-kicker">
          <span><Tag size={13} /> {placeholder.category}</span>
          <span className={`product-risk product-risk-${riskTone}`}>{item.counterfeitRisk || 'low'} risk</span>
        </div>

        <Link to={`/product/${item._id}`} className="product-card-title">
          {placeholder.name}
        </Link>
        <p>{placeholder.description}</p>

        <div className="product-trust-row">
          <div>
            <span>Trust score</span>
            <strong>{placeholder.trustScore}%</strong>
          </div>
          <div>
            <span>Price</span>
            <strong>${Number(placeholder.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
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
          className="product-icon-button"
          title="Contact Seller"
          type="button"
          onClick={() => setShowContactModal(true)}
        >
          <MessageSquare size={16} />
        </button>
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

      <ContactSellerModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        item={item}
      />
    </article>
  );
};

export default memo(ProductCard);
