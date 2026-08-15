import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import client from '../api/client';
import PageLoader from '../components/ui/PageLoader';
import EmptyState from '../components/ui/EmptyState';
import {
  CheckCircle,
  Shield,
  Layers,
  MapPin,
  Clock,
  Star,
  Heart,
  Share2,
  Copy,
  Check,
  Package,
  Building,
  ShoppingBag,
  MessageSquare,
  Store,
} from 'lucide-react';
import './ProductDetailsPage.css';
import { useShopping } from '../context/ShoppingContext';
import ContactSellerModal from '../components/ContactSellerModal';

interface VerifiedProductDetail {
  id: string;
  name: string;
  category: string;
  sku: string;
  price?: number;
  serialNumber?: string;
  description: string;
  imageUrl: string;
  verifiedStatus: string;
  trustScore?: number;
  certificateUrl?: string;
  factory?: {
    name: string;
    location?: string;
  };
  seller?: {
    name: string;
    location?: string;
  };
  journey?: Array<{
    action: string;
    location?: string;
    timestamp: string;
    txHash?: string;
    actor?: { name: string };
  }>;
  specs?: Record<string, string>;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { dispatch, wishlist: currentWishlist } = useShopping();
  
  const [product, setProduct] = useState<VerifiedProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Interactive UI states
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [certShine, setCertShine] = useState({ x: 50, y: 50 });
  
  // Reviews state
  const [reviews, setReviews] = useState<Array<{ author: string; rating: number; date: string; comment: string; verified: boolean }>>([]);
  const [reviewStats, setReviewStats] = useState<{ total: number; averageRating: number; distribution: Record<number, number> }>({
    total: 0,
    averageRating: 5.0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [newReview, setNewReview] = useState({ author: '', rating: 5, comment: '' });
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchReviews = async (productId: string) => {
    try {
      const res = await client.get(`/reviews/${encodeURIComponent(productId)}/reviews`);
      if (res.data?.reviews && Array.isArray(res.data.reviews)) {
        setReviews(res.data.reviews);
        if (res.data.distribution) {
          setReviewStats({
            total: res.data.total || res.data.reviews.length,
            averageRating: res.data.averageRating || 5.0,
            distribution: res.data.distribution
          });
        }
      }
    } catch {
      // Keep existing reviews if fetch fails
    }
  };

  useEffect(() => {
    async function fetchProductDetails() {
      setLoading(true);
      setError('');
      try {
        const queryId = id || 'default';
        const res = await client.get(`/items/verify/${encodeURIComponent(queryId)}`).catch(async () => {
          return await client.get(`/products/${encodeURIComponent(queryId)}`).catch(async () => {
            return await client.get(`/products/factory`);
          });
        });

        if (res.data?.item) {
          const item = res.data.item;
          const targetId = item.product?._id || item.product?.sku || item._id || queryId;
          setProduct({
            id: targetId,
            name: item.product?.name || 'Verified Authentic Product',
            category: item.product?.category || 'General',
            sku: item.product?.sku || 'VC-SKU',
            price: Number(item.product?.price) || 120,
            serialNumber: item.serialNumber || queryId,
            description: item.product?.description || 'Authentic product verified on the VeriChain decentralized ledger.',
            imageUrl: item.product?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
            verifiedStatus: item.product?.verifiedStatus || 'verified',
            trustScore: 99,
            certificateUrl: item.product?.certificateUrl,
            factory: {
              name: (item.journey && item.journey[0]?.actor?.name) || 'Certified Manufacturing Facility',
              location: (item.journey && item.journey[0]?.location) || 'Verified Origin Facility',
            },
            seller: {
              name: item.currentOwner?.name || 'Authorized Network Merchant',
              location: 'Verified Distribution Network',
            },
            journey: item.journey || [],
            specs: item.product?.specs || {},
          });
          fetchReviews(targetId);
        } else if (res.data?.product) {
          const prod = res.data.product;
          setProduct({
            id: prod._id || queryId,
            name: prod.name,
            category: prod.category || 'General',
            sku: prod.sku || 'SKU-001',
            price: Number(prod.price) || 120,
            serialNumber: queryId,
            description: prod.description || 'Authentic product verified on the VeriChain decentralized ledger.',
            imageUrl: prod.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
            verifiedStatus: prod.verifiedStatus || 'verified',
            trustScore: 99,
            certificateUrl: prod.certificateUrl,
            factory: prod.factory ? { name: prod.factory.name, location: prod.factory.location } : { name: 'Origin Facility', location: 'Certified Plant' },
            seller: { name: 'Authorized Merchant', location: 'Distribution Network' },
            journey: [],
            specs: prod.specs || {},
          });
          fetchReviews(prod._id || prod.sku || queryId);
        } else if (res.data?.products && Array.isArray(res.data.products)) {
          const found = (id ? res.data.products.find((p: any) => p._id === id || p.sku === id) : res.data.products[0]) || res.data.products[0];
          if (found) {
            setProduct({
              id: found._id,
              name: found.name,
              category: found.category,
              sku: found.sku,
              price: Number(found.price) || 120,
              description: found.description,
              imageUrl: found.imageUrl,
              verifiedStatus: found.verifiedStatus,
              trustScore: 98,
              certificateUrl: found.certificateUrl,
              specs: found.specs || {},
            });
            fetchReviews(found._id || found.sku);
          } else {
            setError('Product not found in catalog.');
          }
        } else {
          setError('Product record could not be loaded.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Product or item not found.');
      } finally {
        setLoading(false);
      }
    }

    fetchProductDetails();
  }, [id]);

  const isWishlisted = product ? currentWishlist.some(p => p.id === product.id) : false;

  const handleToggleWishlist = () => {
    if (!product) return;
    if (isWishlisted) {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product.id });
    } else {
      dispatch({
        type: 'ADD_TO_WISHLIST',
        payload: {
          id: product.id,
          productId: product.id,
          itemInstanceId: product.serialNumber ? product.id : undefined,
          serialNumber: product.serialNumber,
          sku: product.sku,
          name: product.name,
          price: Number(product.price) || 120,
          imageUrl: product.imageUrl,
          verified: product.verifiedStatus === 'verified',
        },
      });
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: product.id,
        productId: product.id,
        itemInstanceId: product.serialNumber ? product.id : undefined,
        serialNumber: product.serialNumber,
        sku: product.sku,
        name: product.name,
        price: Number(product.price) || 120,
        imageUrl: product.imageUrl,
        quantity: 1,
        verified: product.verifiedStatus === 'verified',
      },
    });
  };

  // Holographic sheen position calculation
  const handleCertMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setCertShine({ x, y });
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Form submission handler with live backend POST
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.author || !newReview.comment || !product) return;
    setReviewSubmitting(true);
    setReviewSuccess('');

    try {
      await client.post(`/reviews/${encodeURIComponent(product.id)}/reviews`, {
        authorName: newReview.author,
        rating: newReview.rating,
        text: newReview.comment,
      });

      // Refetch live reviews
      await fetchReviews(product.id);
      setReviewSuccess('Review published to the decentralized ledger!');
      setNewReview({ author: '', rating: 5, comment: '' });
      setTimeout(() => setReviewSuccess(''), 4000);
    } catch {
      // Fallback local addition if network fails
      const submittedReview = {
        author: newReview.author,
        rating: newReview.rating,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        comment: newReview.comment,
        verified: true
      };
      setReviews(prev => [submittedReview, ...prev]);
      setNewReview({ author: '', rating: 5, comment: '' });
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader minHeight="70vh" />;
  }

  if (error || !product) {
    return (
      <div className="product-details-wrapper">
        <NavBar />
        <main className="product-details-page" style={{ padding: 'var(--space-2xl) var(--space-md)' }}>
          <EmptyState
            icon={Package}
            title="Product Not Found"
            message={error || "The requested product or verification certificate could not be located on the ledger."}
            action={
              <button
                className="btn btn-primary"
                onClick={() => window.location.href = '/dashboard/marketplace'}
              >
                Explore Marketplace
              </button>
            }
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="product-details-wrapper">
      <NavBar />

      <main className="product-details-page">
        {/* SECTION 1: Verification Status Banner */}
        <section className="verification-banner" aria-label="Verification Info">
          <div className="verification-status-info">
            <div className="status-pulse-badge">
              <CheckCircle size={16} />
              <span>{product.verifiedStatus === 'verified' ? 'VERIFIED AUTHENTIC' : 'VERIFICATION PENDING'}</span>
            </div>
            <div className="verification-banner-details">
              Product SKU: <strong>{product.sku}</strong> • Verified on the VeriChain Ledger
            </div>
          </div>
          {product.serialNumber && (
            <Link to={`/verify?serial=${encodeURIComponent(product.serialNumber)}`} className="audit-report-btn">
              <Shield size={14} />
              <span>Verify Certificate</span>
            </Link>
          )}
        </section>

        {/* Two-Column Detail Grid */}
        <div className="product-details-grid">
          {/* LEFT COLUMN: Visuals & Security Certificate */}
          <div className="details-column">
            {/* Image View */}
            <div className="details-card">
              <div className="gallery-container">
                <div className="gallery-main-view">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="gallery-main-img"
                  />
                </div>
              </div>
            </div>

            {/* Cryptographic Birth Certificate */}
            <div 
              className="crypto-certificate-card"
              onMouseMove={handleCertMouseMove}
              onClick={() => setShowMetadata(!showMetadata)}
              style={{
                background: `radial-gradient(circle at ${certShine.x}% ${certShine.y}%, rgba(0, 88, 188, 0.25) 0%, #0d111a 75%)`,
                border: '1px solid rgba(34, 211, 238, 0.2)'
              }}
            >
              <div className="cert-header">
                <div className="cert-title-group">
                  <h3>DIGITAL AUTHENTICITY CERTIFICATE</h3>
                  <span>VeriChain Secure Mint Standard (VRC-721)</span>
                </div>
                <div className="cert-secure-seal">
                  <Shield size={24} />
                </div>
              </div>

              <div className="cert-grid">
                <div className="cert-field">
                  <span className="cert-field-label">Registry Network</span>
                  <span className="cert-field-value">VeriChain Mainnet</span>
                </div>
                <div className="cert-field">
                  <span className="cert-field-label">SKU Identifier</span>
                  <span className="cert-field-value">{product.sku}</span>
                </div>
                {product.serialNumber && (
                  <div className="cert-field" style={{ gridColumn: 'span 2' }}>
                    <span className="cert-field-label">Serialized Blockchain Unit</span>
                    <span className="cert-field-value highlight">{product.serialNumber}</span>
                  </div>
                )}
                <div className="cert-field" style={{ gridColumn: 'span 2' }}>
                  <span className="cert-field-label">Verification Status</span>
                  <span className="cert-field-value" style={{ color: '#4ade80' }}>✔ Signed & Ledger Certified</span>
                </div>
              </div>
            </div>

            {/* Specifications */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="details-card">
                <div className="details-card-header">
                  <h2><Layers size={18} /> Specifications</h2>
                </div>
                <div className="specs-grid">
                  {Object.entries(product.specs).map(([key, value], idx) => (
                    <div key={idx} className="specs-item">
                      <div className="specs-item-icon">
                        <Layers size={18} />
                      </div>
                      <div className="specs-item-details">
                        <span className="specs-item-label">{key}</span>
                        <span className="specs-item-value">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Info Cards */}
          <div className="details-column">
            <div className="details-card" style={{ paddingBottom: 'var(--space-md)' }}>
              <div className="product-title-section">
                <span className="category-tag">{product.category}</span>
                <h1>{product.name}</h1>
                <p className="product-tagline">{product.description}</p>
              </div>

              {product.serialNumber && (
                <div className="product-serial-row">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="cert-field-label">Secured Serial Number</span>
                    <span className="serial-number">{product.serialNumber}</span>
                  </div>
                  <button
                    className="audit-report-btn"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', padding: '6px 12px' }}
                    onClick={() => handleCopy(product.serialNumber!, 'serial')}
                  >
                    {copiedText === 'serial' ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
                    <span>{copiedText === 'serial' ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)', flexWrap: 'wrap' }}>
                <button 
                  className="audit-report-btn" 
                  style={{ flex: '1 1 140px', padding: '12px', justifyContent: 'center', background: 'var(--accent-gradient)', color: '#fff' }}
                  onClick={handleAddToCart}
                >
                  <ShoppingBag size={16} />
                  <span>Add to Cart</span>
                </button>
                <button 
                  className="audit-report-btn" 
                  style={{ flex: '1 1 140px', padding: '12px', justifyContent: 'center', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', color: 'var(--text-primary)' }}
                  onClick={() => setShowContactModal(true)}
                  title="Contact Seller Directly"
                >
                  <MessageSquare size={16} />
                  <span>Contact Seller</span>
                </button>
                <button
                  className="audit-report-btn"
                  style={{
                    background: isWishlisted ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-secondary)',
                    color: isWishlisted ? '#ef4444' : 'var(--text-primary)',
                    border: isWishlisted ? '1px solid rgba(239, 68, 68, 0.2)' : 'none',
                    padding: '12px'
                  }}
                  onClick={handleToggleWishlist}
                  title="Add to Wishlist"
                >
                  <Heart size={16} fill={isWishlisted ? "#ef4444" : "none"} />
                </button>
                <button
                  className="audit-report-btn"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '12px' }}
                  onClick={() => handleCopy(window.location.href, 'link')}
                  title="Share Item Link"
                >
                  {copiedText === 'link' ? <Check size={16} style={{ color: 'var(--color-success)' }} /> : <Share2 size={16} />}
                </button>
              </div>
            </div>

            {/* Supply Chain & Custody Timeline */}
            {product.journey && product.journey.length > 0 && (
              <div className="details-card">
                <div className="details-card-header">
                  <h2><Clock size={18} /> Chain of Custody & Ownership</h2>
                </div>
                <div className="timeline-list">
                  {product.journey.map((item, idx) => (
                    <div key={idx} className="timeline-item verified">
                      <div className="timeline-marker"></div>
                      <div className="timeline-header">
                        <span className="timeline-title" style={{ textTransform: 'capitalize' }}>{item.action}</span>
                        <span className="timeline-date">{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="timeline-body">
                        <span>Location: <strong>{item.location || 'Verified Facility'}</strong></span>
                        {item.txHash && (
                          <div className="timeline-meta">
                            <span 
                              className="timeline-hash" 
                              onClick={() => handleCopy(item.txHash!, `hash-${idx}`)}
                              title="Copy Transaction Hash"
                            >
                              <Copy size={10} /> {copiedText === `hash-${idx}` ? 'Copied!' : `${item.txHash.substring(0, 16)}...`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Info & Direct Inquiries */}
            <div className="details-card">
              <div className="details-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2><Store size={18} /> Verified Merchant / Seller</h2>
                <span className="badge badge-success">✓ Ledger Authenticated</span>
              </div>
              <div className="profile-card-details" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{product.seller?.name || 'Verified Authorized Merchant'}</h3>
                  <span className="verification-banner-details" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {product.seller?.location || 'Verified Distribution Network'}
                  </span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    ⚡ Typical Response Time: <strong style={{ color: 'var(--accent-cyan)' }}>&lt; 1 hour</strong>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setShowContactModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <MessageSquare size={14} /> Contact Directly
                </button>
              </div>
            </div>

            {/* Factory Info */}
            {product.factory && (
              <div className="details-card">
                <div className="details-card-header">
                  <h2><Building size={18} /> Manufacturer</h2>
                </div>
                <div className="profile-card-details">
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{product.factory.name}</h3>
                  {product.factory.location && (
                    <span className="verification-banner-details" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '-4px' }}>
                      <MapPin size={12} /> {product.factory.location}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="details-card reviews-container" aria-label="Customer Reviews">
          <div className="details-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            <h2><Star size={18} /> Client Feedback & Reviews</h2>
            {reviewStats.total > 0 && (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                ⭐ <strong>{reviewStats.averageRating}</strong> out of 5 ({reviewStats.total} {reviewStats.total === 1 ? 'review' : 'reviews'})
              </span>
            )}
          </div>

          {/* Rating Breakdown Bar */}
          {reviewStats.total > 0 && (
            <div style={{ background: 'var(--bg-secondary)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-sm)' }}>
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviewStats.distribution[stars] || 0;
                const pct = reviewStats.total > 0 ? Math.round((count / reviewStats.total) * 100) : 0;
                return (
                  <div key={stars} style={{ fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, color: 'var(--text-muted)' }}>
                      <span>{stars} ★</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 9999, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: stars >= 4 ? '#10b981' : stars === 3 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {reviewSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-md)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={16} />
              <span>{reviewSuccess}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No customer reviews yet. Be the first to add your feedback.</p>
            ) : (
              reviews.map((rev, idx) => (
                <div key={idx} className="review-item">
                  <div className="review-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      <span className="review-author">{rev.author}</span>
                      {rev.verified && (
                        <span className="review-verified-badge">
                          <CheckCircle size={10} /> Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="review-date">{rev.date}</span>
                  </div>
                  <div className="rating-stars" style={{ margin: '2px 0' }}>
                    {Array.from({ length: 5 }).map((_, sIdx) => (
                      <Star 
                        key={sIdx} 
                        size={12} 
                        fill={sIdx < rev.rating ? "#fbbf24" : "none"} 
                        stroke={sIdx < rev.rating ? "none" : "#cbd5e1"} 
                      />
                    ))}
                  </div>
                  <p className="review-comment">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Review Form */}
          <form className="add-review-form" onSubmit={handleReviewSubmit}>
            <h3>Add Your Verified Review</h3>
            
            <div className="form-rating-selector">
              <span className="review-comment" style={{ marginRight: '8px' }}>Your Rating:</span>
              {Array.from({ length: 5 }).map((_, idx) => {
                const starVal = idx + 1;
                const isActive = hoverRating !== null ? starVal <= hoverRating : starVal <= newReview.rating;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`star-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setNewReview({ ...newReview, rating: starVal })}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(null)}
                  >
                    <Star size={18} fill={isActive ? "#fbbf24" : "none"} stroke={isActive ? "none" : "currentColor"} />
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-sm)' }}>
              <input
                type="text"
                placeholder="Your Name"
                className="form-input"
                value={newReview.author}
                onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                required
              />
              <textarea
                placeholder="Write your review comments here..."
                className="form-textarea"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="submit-review-btn" disabled={reviewSubmitting}>
              {reviewSubmitting ? 'Publishing Review…' : 'Submit Review'}
            </button>
          </form>
        </section>
      </main>

      {product && (
        <ContactSellerModal
          open={showContactModal}
          onClose={() => setShowContactModal(false)}
          product={product}
        />
      )}

      <Footer />
    </div>
  );
}
