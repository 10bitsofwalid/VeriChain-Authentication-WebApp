import React from 'react';
import { CheckCircle, Award, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  product: any;
}

export default function HeroSection({ product }: HeroSectionProps) {
  const price = product.product?.price ?? 'N/A';
  const authenticity = product.product?.verifiedStatus ?? 'unknown';
  const trustScore = product.factory?.trustScore ?? product.seller?.trustScore ?? 0;
  const factoryName = product.factory?.name ?? 'Unknown Factory';
  const sellerName = product.seller?.name ?? 'Unknown Seller';
  const verificationStatus = authenticity === 'verified' ? 'Authentic' : 'Pending';

  return (
    <section className="hero-section glass-card">
      <div className="hero-grid">
        <img
          src={product.product?.imageUrl || 'https://via.placeholder.com/400'}
          alt={product.product?.name}
          className="hero-image"
        />
        <div className="hero-details">
          <h1 className="product-name">{product.product?.name}</h1>
          <p className="brand-category">
            <strong>Brand:</strong> {product.product?.brand || 'N/A'} &nbsp;|&nbsp;
            <strong>Category:</strong> {product.product?.category || 'N/A'}
          </p>
          <p className="price">${price}</p>
          <div className="badges">
            <span className={`badge ${authenticity === 'verified' ? 'badge-success' : 'badge-warning'}`}>
              <ShieldCheck size={16} /> {verificationStatus}
            </span>
            <span className="badge badge-info">
              <Award size={16} /> Trust Score: {trustScore}%
            </span>
          </div>
          <p className="factory-seller">
            <strong>Factory:</strong> {factoryName}<br />
            <strong>Seller:</strong> {sellerName}
          </p>
          <button className="btn btn-primary verify-btn">
            <CheckCircle size={14} /> Verify Authenticity
          </button>
        </div>
      </div>
    </section>
  );
}
