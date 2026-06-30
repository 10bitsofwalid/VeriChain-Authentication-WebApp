import { ArrowRight, CheckCircle2, PackageSearch, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import ActionButton from './ui/ActionButton';

export default function HeroBanner() {
  const navigate = useNavigate();

  return (
    <section className="marketplace-hero">
      <div className="marketplace-hero-copy">
        <div className="marketplace-hero-badge">
          <ShieldCheck size={16} />
          Blockchain product authentication
        </div>
        <h1>Shop products with verifiable proof of origin.</h1>
        <p>
          VeriChain connects buyers, sellers, and manufacturers through authenticated product records,
          ownership history, and trust signals backed by a blockchain ledger.
        </p>

        <div className="marketplace-hero-search" role="search">
          <Search size={20} aria-hidden="true" />
          <input placeholder="Search serial, product, seller, or category" aria-label="Search marketplace" />
          <ActionButton variant="primary" size="md" onClick={() => navigate('/verify')}>
            Verify
          </ActionButton>
        </div>

        <div className="marketplace-hero-actions">
          <ActionButton variant="primary" size="lg" onClick={() => navigate('/dashboard/marketplace')}>
            Browse Marketplace
            <ArrowRight size={18} />
          </ActionButton>
          <ActionButton variant="secondary" size="lg" onClick={() => navigate('/verify')}>
            <PackageSearch size={18} />
            Quick Verify
          </ActionButton>
        </div>

        <div className="marketplace-hero-metrics" aria-label="Platform metrics">
          <span><strong>98.7%</strong> Trust score</span>
          <span><strong>2.4k</strong> Verified today</span>
          <span><strong>42k</strong> Products verified</span>
          <span><strong>860</strong> Manufacturers</span>
        </div>
      </div>

      <div className="marketplace-hero-visual" aria-hidden="true">
        <img src={heroImage} alt="" />
        <div className="hero-float-card hero-float-card-top">
          <CheckCircle2 size={18} />
          <span>Certificate matched</span>
        </div>
        <div className="hero-float-card hero-float-card-bottom">
          <Sparkles size={18} />
          <span>Low counterfeit risk</span>
        </div>
      </div>
    </section>
  );
}
