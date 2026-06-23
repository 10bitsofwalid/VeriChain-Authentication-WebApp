import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import HeroSection from '../components/HeroSection';
import ImageGallery from '../components/ImageGallery';
import ProductInfoCard from '../components/ProductInfoCard';
import DigitalBirthCertificateCard from '../components/DigitalBirthCertificateCard';
import OriginStoryTimeline from '../components/OriginStoryTimeline';
import ProductSpecsPanel from '../components/ProductSpecsPanel';
import FactoryInfoCard from '../components/FactoryInfoCard';
import SellerInfoCard from '../components/SellerInfoCard';
import VerificationHistoryTimeline from '../components/VerificationHistoryTimeline';
import RelatedProductsSection from '../components/RelatedProductsSection';
import SimilarProductsSection from '../components/SimilarProductsSection';
import StickyInfoPanel from '../components/StickyInfoPanel';
import './ProductDetailsPage.css';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await client.get(`/items/${encodeURIComponent(id || '')}`);
        setProduct(res.data);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) return <div className="loading-spinner" />;
  if (error) return <div className="error-message">{error}</div>;
  if (!product) return null;

  return (
    <div className="product-details-page">
      <StickyInfoPanel product={product} />
      <div className="main-content">
        <div className="left-column">
          <section className="glass-card"><HeroSection product={product} /></section>
          <section className="glass-card"><ImageGallery images={product.product?.imageGallery || []} /></section>
          <section className="glass-card"><ProductSpecsPanel specs={product.product?.specifications || {}} /></section>
          <section className="glass-card"><OriginStoryTimeline journey={product.item?.journey || []} /></section>
          <section className="glass-card"><RelatedProductsSection category={product.product?.category} /></section>
          <section className="glass-card"><SimilarProductsSection productId={product._id} /></section>
        </div>
        <div className="right-sidebar">
          <section className="glass-card"><ProductInfoCard product={product} /></section>
          <section className="glass-card"><DigitalBirthCertificateCard product={product} /></section>
          <section className="glass-card"><FactoryInfoCard factory={product.factory} /></section>
          <section className="glass-card"><SellerInfoCard seller={product.seller} /></section>
          <section className="glass-card"><VerificationHistoryTimeline history={product.item?.journey || []} /></section>
        </div>
      </div>
    </div>
  );
}
