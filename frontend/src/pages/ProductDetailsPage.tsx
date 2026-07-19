import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import {
  CheckCircle,
  Shield,
  Layers,
  MapPin,
  Clock,
  FileText,
  ChevronRight,
  ExternalLink,
  Award,
  Star,
  Cpu,
  Truck,
  Heart,
  Share2,
  Copy,
  Check,
  Package,
  Building,
  User
} from 'lucide-react';
import './ProductDetailsPage.css';

// Rich Mock Product Data for UI-only presentation
const MOCK_PRODUCT = {
  id: "chronos-voyager-s1",
  name: "Chronos Voyager S1",
  tagline: "Aerospace-Grade Chronograph with Quantum Security Chip",
  category: "Luxury Horology",
  serialNumber: "VC-88092-2026",
  trustScore: 99.8,
  consensusNodes: 24,
  lastAuditDate: "2026-07-15",
  blockchain: {
    network: "VeriChain Mainnet",
    contractAddress: "0x4f8ec8a6e872d4c0b6b21699fe51f8a846e71c22",
    tokenId: "89201",
    mintHash: "0x7a32d184bfde99327e5e110c9cde8a8ef5b47a19283d731b8162f275e478f8e2",
    blockHeight: "18,492,012",
    protocol: "VRC-721 Secure Asset"
  },
  images: [
    { url: "/product_watch_main.png", label: "Main View" },
    { url: "/product_watch_chip.png", label: "Cryptographic NFC Seal" },
    { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800", label: "Aesthetic White" },
    { url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800", label: "Smart Packaging" }
  ],
  specifications: [
    { label: "Case Material", value: "Grade 5 Titanium & Carbon Composite", icon: Shield },
    { label: "Movement", value: "Caliber VC-99 Automatic Co-Axial", icon: Cpu },
    { label: "Water Resistance", value: "300m (1000ft) Saturation Rating", icon: Layers },
    { label: "Crystal", value: "Anti-Reflective Curved Sapphire", icon: Award },
    { label: "Connectivity", value: "NFC Cryptographic Secure Element v3", icon: Cpu },
    { label: "Power Reserve", value: "72 Hours Chronometer Certified", icon: Clock }
  ],
  factory: {
    name: "AeroChron Precision Lab",
    location: "Schaffhausen, Switzerland",
    founded: "1988",
    employees: "142 Elite Artisans",
    sustainabilityRating: "A++ Eco-Certified",
    co2Footprint: "Net-Zero Carbon",
    certifications: ["ISO 9001", "ISO 14001", "COSC Certified", "Swiss Made Seal"]
  },
  seller: {
    name: "MontreLux Authorized Dealers",
    type: "Certified Retail Partner",
    location: "Geneva Flagship Store & Online",
    rating: 4.95,
    totalSales: "12,400+ Transactions",
    warrantyDetails: "5-Year International VeriChain Warranty"
  },
  trackingSteps: [
    { name: "Sourcing", status: "completed", desc: "Grade 5 Titanium sourced from Swiss Eco-Mines.", date: "June 10, 2026", icon: MapPin },
    { name: "Manufacturing", status: "completed", desc: "Assembled & movement calibrated by AeroChron Swiss artisans.", date: "June 25, 2026", icon: Building },
    { name: "QC & Minting", status: "completed", desc: "Passed 14-point pressure & NFC encryption test. Certificate minted.", date: "July 01, 2026", icon: Shield },
    { name: "Logistics", status: "completed", desc: "Secured transit via Swiss Post Vault logistics.", date: "July 05, 2026", icon: Truck },
    { name: "Retail Reception", status: "completed", desc: "Received and NFC-signature verified by MontreLux Genève.", date: "July 12, 2026", icon: Package },
    { name: "Current Custody", status: "active", desc: "Purchased by collector. Authenticity verified by customer scan.", date: "July 19, 2026", icon: User }
  ],
  timeline: [
    { title: "NFC Security Chip Embedded", event: "Manufactured", date: "June 22, 2026", actor: "AeroChron Swiss", hash: "0xbc3922d8e4119d", status: "verified" },
    { title: "Minted Digital Birth Certificate", event: "VRC-721 Mint", date: "July 01, 2026", actor: "VeriChain Node #4", hash: "0x7a32d184bfde99327e5e110c9cde8a8ef5b47a19", status: "verified" },
    { title: "Quality Audit Certification", event: "COSC Audit Passed", date: "July 03, 2026", actor: "Contrôle Officiel Suisse", hash: "0x8faec938b", status: "verified" },
    { title: "Shipped to Seller", event: "Transit Initiated", date: "July 05, 2026", actor: "Swiss Post Vault", hash: "0x9d2a4b01e", status: "verified" },
    { title: "Received by Authorized Dealer", event: "Inventory Check-in", date: "July 12, 2026", actor: "MontreLux Genève", hash: "0x3e4b5a2f8c", status: "verified" },
    { title: "Sold & Transferred Ownership", event: "Collector Purchase", date: "July 19, 2026", actor: "Walid (Buyer ID: 0x992a)", hash: "0x8b3ec722904b", status: "active" }
  ],
  initialReviews: [
    { author: "Alexander K.", rating: 5, date: "July 15, 2026", comment: "The NFC verification is incredibly seamless. I held my phone to the watch crystal and the VeriChain app immediately loaded the birth certificate. The design is absolutely beautiful.", verified: true },
    { author: "Sophia M.", rating: 5, date: "July 14, 2026", comment: "Exceptional Swiss craftsmanship combined with Web3 security. It gives me peace of mind knowing the serial number matches the blockchain record perfectly.", verified: true },
    { author: "Marcus V.", rating: 4, date: "July 09, 2026", comment: "Gorgeous titanium casing and super light on the wrist. Setup of the private key took a minute but the overall user experience is top-notch.", verified: true }
  ]
};

export default function ProductDetailsPage() {
  const { id } = useParams();
  
  // Interactive UI states
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [certShine, setCertShine] = useState({ x: 50, y: 50 });
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState(false);
  
  // Live local review list
  const [reviews, setReviews] = useState(MOCK_PRODUCT.initialReviews);
  const [newReview, setNewReview] = useState({ author: '', rating: 5, comment: '' });
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Dynamic calculations based on custom ID if present
  const productName = id ? id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : MOCK_PRODUCT.name;

  // Gallery magnifier coordinates calculation
  const handleGalleryMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
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

  // Form submission handler
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.author || !newReview.comment) return;
    
    const submittedReview = {
      author: newReview.author,
      rating: newReview.rating,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      comment: newReview.comment,
      verified: true
    };
    
    setReviews([submittedReview, ...reviews]);
    setNewReview({ author: '', rating: 5, comment: '' });
  };

  // Raw JSON-LD metadata for certificate
  const jsonLdMetadata = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productName,
    "identifier": MOCK_PRODUCT.serialNumber,
    "category": MOCK_PRODUCT.category,
    "manufacturer": {
      "@type": "Organization",
      "name": MOCK_PRODUCT.factory.name,
      "location": MOCK_PRODUCT.factory.location
    },
    "offers": {
      "@type": "Offer",
      "seller": {
        "@type": "Organization",
        "name": MOCK_PRODUCT.seller.name
      }
    },
    "blockchainMetadata": {
      "network": MOCK_PRODUCT.blockchain.network,
      "contractAddress": MOCK_PRODUCT.blockchain.contractAddress,
      "tokenId": MOCK_PRODUCT.blockchain.tokenId,
      "mintTxHash": MOCK_PRODUCT.blockchain.mintHash
    }
  };

  return (
    <div className="product-details-wrapper">
      <NavBar />

      <main className="product-details-page">
        {/* SECTION 1: Verification Status Banner */}
        <section className="verification-banner" aria-label="Verification Info">
          <div className="verification-status-info">
            <div className="status-pulse-badge">
              <CheckCircle size={16} />
              <span>VERIFIED AUTHENTIC</span>
            </div>
            <div className="verification-banner-details">
              VeriChain Score: <strong>{MOCK_PRODUCT.trustScore}%</strong> • Verified by <strong>{MOCK_PRODUCT.consensusNodes}</strong> independent consensus nodes • Last Audit: {MOCK_PRODUCT.lastAuditDate}
            </div>
          </div>
          <button 
            className="audit-report-btn"
            onClick={() => alert("Downloading PDF Cryptographic Audit Report...")}
          >
            <FileText size={14} />
            <span>Download Audit Report</span>
          </button>
        </section>

        {/* Two-Column Detail Grid */}
        <div className="product-details-grid">
          
          {/* LEFT COLUMN: Visuals & Security Certificate */}
          <div className="details-column">
            
            {/* SECTION 2: Image Gallery */}
            <div className="details-card">
              <div className="gallery-container">
                <div 
                  className="gallery-main-view"
                  onMouseMove={handleGalleryMouseMove}
                  onMouseEnter={() => setIsZooming(true)}
                  onMouseLeave={() => setIsZooming(false)}
                >
                  <img 
                    src={MOCK_PRODUCT.images[activeImgIndex].url} 
                    alt={productName} 
                    className="gallery-main-img"
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: isZooming ? 'scale(1.8)' : 'scale(1)'
                    }}
                  />
                  <div className="gallery-magnifier-indicator">
                    <ChevronRight size={12} /> Hover to zoom details
                  </div>
                </div>

                <div className="gallery-thumbnails">
                  {MOCK_PRODUCT.images.map((img, idx) => (
                    <button
                      key={idx}
                      className={`gallery-thumb ${idx === activeImgIndex ? 'active' : ''}`}
                      onClick={() => setActiveImgIndex(idx)}
                      title={img.label}
                    >
                      <img src={img.url} alt={img.label} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 3: Cryptographic Birth Certificate */}
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
                  <h3>DIGITAL BIRTH CERTIFICATE</h3>
                  <span>VeriChain Secure Mint Standard (VRC-721)</span>
                </div>
                <div className="cert-secure-seal">
                  <Shield size={24} />
                </div>
              </div>

              <div className="cert-grid">
                <div className="cert-field">
                  <span className="cert-field-label">Registry Network</span>
                  <span className="cert-field-value">{MOCK_PRODUCT.blockchain.network}</span>
                </div>
                <div className="cert-field">
                  <span className="cert-field-label">Token Standard</span>
                  <span className="cert-field-value">{MOCK_PRODUCT.blockchain.protocol}</span>
                </div>
                <div className="cert-field">
                  <span className="cert-field-label">Contract Address</span>
                  <span className="cert-field-value">{MOCK_PRODUCT.blockchain.contractAddress.substring(0, 16)}...</span>
                </div>
                <div className="cert-field">
                  <span className="cert-field-label">Token ID</span>
                  <span className="cert-field-value highlight">#{MOCK_PRODUCT.blockchain.tokenId}</span>
                </div>
                <div className="cert-field" style={{ gridColumn: 'span 2' }}>
                  <span className="cert-field-label">Cryptographic Mint Hash</span>
                  <span className="cert-field-value" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    {MOCK_PRODUCT.blockchain.mintHash}
                  </span>
                </div>
                <div className="cert-field">
                  <span className="cert-field-label">Block Height</span>
                  <span className="cert-field-value">Block {MOCK_PRODUCT.blockchain.blockHeight}</span>
                </div>
                <div className="cert-field">
                  <span className="cert-field-label">Verification Status</span>
                  <span className="cert-field-value" style={{ color: '#4ade80' }}>✔ Signed & Consensus Certified</span>
                </div>
              </div>

              <div className="cert-interactive-indicator">
                <ChevronRight size={14} style={{ transform: showMetadata ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform var(--transition-fast)' }} />
                <span>{showMetadata ? "Hide raw verification metadata" : "Click card to inspect JSON-LD authenticity manifest"}</span>
              </div>

              {showMetadata && (
                <div className="cert-raw-viewer" onClick={(e) => e.stopPropagation()}>
                  <pre>{JSON.stringify(jsonLdMetadata, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* SECTION 4: Supply Chain Tracking Map */}
            <div className="details-card">
              <div className="details-card-header">
                <h2><Truck size={18} /> Supply Chain Tracking</h2>
              </div>
              <div className="tracking-chain">
                {MOCK_PRODUCT.trackingSteps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className={`tracking-step ${step.status}`}>
                      <div className="tracking-node">
                        <Icon size={16} />
                      </div>
                      <span className="tracking-label">{step.name}</span>
                      <span className="tracking-desc">{step.desc}</span>
                      <span className="timeline-date" style={{ marginTop: '2px' }}>{step.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 5: Specifications Grid */}
            <div className="details-card">
              <div className="details-card-header">
                <h2><Layers size={18} /> Specifications</h2>
              </div>
              <div className="specs-grid">
                {MOCK_PRODUCT.specifications.map((spec, idx) => {
                  const SpecIcon = spec.icon;
                  return (
                    <div key={idx} className="specs-item">
                      <div className="specs-item-icon">
                        <SpecIcon size={18} />
                      </div>
                      <div className="specs-item-details">
                        <span className="specs-item-label">{spec.label}</span>
                        <span className="specs-item-value">{spec.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Info Cards & Sellers */}
          <div className="details-column">
            
            {/* Product Header details */}
            <div className="details-card" style={{ paddingBottom: 'var(--space-md)' }}>
              <div className="product-title-section">
                <span className="category-tag">{MOCK_PRODUCT.category}</span>
                <h1>{productName}</h1>
                <p className="product-tagline">{MOCK_PRODUCT.tagline}</p>
              </div>

              <div className="product-serial-row">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="cert-field-label">Secured Serial Number</span>
                  <span className="serial-number">{MOCK_PRODUCT.serialNumber}</span>
                </div>
                <button
                  className="audit-report-btn"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', padding: '6px 12px' }}
                  onClick={() => handleCopy(MOCK_PRODUCT.serialNumber, 'serial')}
                >
                  {copiedText === 'serial' ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
                  <span>{copiedText === 'serial' ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                <button 
                  className="audit-report-btn" 
                  style={{ flexGrow: 1, padding: '12px', justifyContent: 'center' }}
                  onClick={() => alert("Verification code initiated via device sensor scanner...")}
                >
                  <Cpu size={16} />
                  <span>Verify with Device NFC Scan</span>
                </button>
                <button
                  className="audit-report-btn"
                  style={{
                    background: wishlist ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-secondary)',
                    color: wishlist ? '#ef4444' : 'var(--text-primary)',
                    border: wishlist ? '1px solid rgba(239, 68, 68, 0.2)' : 'none',
                    padding: '12px'
                  }}
                  onClick={() => setWishlist(!wishlist)}
                  title="Add to Wishlist"
                >
                  <Heart size={16} fill={wishlist ? "#ef4444" : "none"} />
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

            {/* SECTION 6: Ownership & Verification Timeline */}
            <div className="details-card">
              <div className="details-card-header">
                <h2><Clock size={18} /> Chain of Custody & Ownership</h2>
              </div>
              <div className="timeline-list">
                {MOCK_PRODUCT.timeline.map((item, idx) => (
                  <div key={idx} className={`timeline-item ${item.status}`}>
                    <div className="timeline-marker"></div>
                    <div className="timeline-header">
                      <span className="timeline-title">{item.title}</span>
                      <span className="timeline-date">{item.date}</span>
                    </div>
                    <div className="timeline-body">
                      <span>Event: <strong>{item.event}</strong></span>
                      <div className="timeline-meta">
                        <span className="timeline-actor">By: {item.actor}</span>
                        <span 
                          className="timeline-hash" 
                          onClick={() => handleCopy(item.hash, `hash-${idx}`)}
                          title="Copy Transaction Hash"
                        >
                          <Copy size={10} /> {copiedText === `hash-${idx}` ? 'Copied!' : item.hash}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 7: Factory Profile */}
            <div className="details-card">
              <div className="details-card-header">
                <h2><Building size={18} /> Factory Manufacturer</h2>
              </div>
              <div className="profile-card-details">
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{MOCK_PRODUCT.factory.name}</h3>
                <span className="verification-banner-details" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '-4px' }}>
                  <MapPin size={12} /> {MOCK_PRODUCT.factory.location}
                </span>
                
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="profile-meta-row">
                    <span className="profile-meta-label">Founded</span>
                    <span className="profile-meta-value">{MOCK_PRODUCT.factory.founded}</span>
                  </div>
                  <div className="profile-meta-row">
                    <span className="profile-meta-label">Artisan Workforce</span>
                    <span className="profile-meta-value">{MOCK_PRODUCT.factory.employees}</span>
                  </div>
                  <div className="profile-meta-row">
                    <span className="profile-meta-label">Sustainability Rating</span>
                    <span className="profile-meta-value" style={{ color: '#4ade80', fontWeight: 'bold' }}>{MOCK_PRODUCT.factory.sustainabilityRating}</span>
                  </div>
                  <div className="profile-meta-row">
                    <span className="profile-meta-label">CO2 Impact</span>
                    <span className="profile-meta-value">{MOCK_PRODUCT.factory.co2Footprint}</span>
                  </div>
                </div>

                <div className="badge-row">
                  {MOCK_PRODUCT.factory.certifications.map((cert, idx) => (
                    <span key={idx} className="certified-badge">{cert}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 8: Seller Profile */}
            <div className="details-card">
              <div className="details-card-header">
                <h2><User size={18} /> Authorized Seller</h2>
              </div>
              <div className="profile-card-details">
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{MOCK_PRODUCT.seller.name}</h3>
                <span className="verification-banner-details" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '-4px' }}>
                  <MapPin size={12} /> {MOCK_PRODUCT.seller.location}
                </span>

                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="profile-meta-row">
                    <span className="profile-meta-label">Seller License</span>
                    <span className="profile-meta-value">{MOCK_PRODUCT.seller.type}</span>
                  </div>
                  <div className="profile-meta-row">
                    <span className="profile-meta-label">Trust Score</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div className="rating-stars">
                        <Star size={12} fill="#fbbf24" stroke="none" />
                        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{MOCK_PRODUCT.seller.rating}</span>
                      </div>
                      <span className="profile-meta-value">/ 5.0</span>
                    </div>
                  </div>
                  <div className="profile-meta-row">
                    <span className="profile-meta-label">Total Sales Volume</span>
                    <span className="profile-meta-value">{MOCK_PRODUCT.seller.totalSales}</span>
                  </div>
                  <div className="profile-meta-row">
                    <span className="profile-meta-label">Secured Warranty</span>
                    <span className="profile-meta-value">{MOCK_PRODUCT.seller.warrantyDetails}</span>
                  </div>
                </div>

                <button
                  className="audit-report-btn"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', justifyContent: 'center', marginTop: 'var(--space-sm)' }}
                  onClick={() => alert("Connecting to Seller Secure Communication channel...")}
                >
                  <span>Contact Authorized Dealer</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 9: Customer Reviews */}
        <section className="details-card reviews-container" aria-label="Customer Reviews">
          <div className="details-card-header">
            <h2><Star size={18} /> Verification Reviews & Client Feedback</h2>
          </div>
          
          <div className="reviews-summary-grid">
            <div className="reviews-score-card">
              <span className="reviews-big-score">4.9</span>
              <div className="rating-stars" style={{ margin: '4px 0' }}>
                <Star size={14} fill="#fbbf24" stroke="none" />
                <Star size={14} fill="#fbbf24" stroke="none" />
                <Star size={14} fill="#fbbf24" stroke="none" />
                <Star size={14} fill="#fbbf24" stroke="none" />
                <Star size={14} fill="#fbbf24" stroke="none" />
              </div>
              <span className="verification-banner-details">Based on {reviews.length} Audited Reviews</span>
            </div>

            <div className="reviews-breakdown">
              <div className="breakdown-row">
                <span className="breakdown-label">5 Star</span>
                <div className="breakdown-bar-bg">
                  <div className="breakdown-bar-fill" style={{ width: '85%' }}></div>
                </div>
                <span className="breakdown-count">85%</span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">4 Star</span>
                <div className="breakdown-bar-bg">
                  <div className="breakdown-bar-fill" style={{ width: '15%' }}></div>
                </div>
                <span className="breakdown-count">15%</span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">3 Star</span>
                <div className="breakdown-bar-bg">
                  <div className="breakdown-bar-fill" style={{ width: '0%' }}></div>
                </div>
                <span className="breakdown-count">0%</span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">2 Star</span>
                <div className="breakdown-bar-bg">
                  <div className="breakdown-bar-fill" style={{ width: '0%' }}></div>
                </div>
                <span className="breakdown-count">0%</span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">1 Star</span>
                <div className="breakdown-bar-bg">
                  <div className="breakdown-bar-fill" style={{ width: '0%' }}></div>
                </div>
                <span className="breakdown-count">0%</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {reviews.map((rev, idx) => (
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
            ))}
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
                placeholder="Write your review comments here... Describe your NFC authenticity check experience."
                className="form-textarea"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="submit-review-btn">Submit Verified Review</button>
          </form>

        </section>

      </main>

      <Footer />
    </div>
  );
}
