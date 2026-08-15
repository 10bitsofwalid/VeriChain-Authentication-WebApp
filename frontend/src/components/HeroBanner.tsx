import { useState } from 'react';
import { ArrowRight, CheckCircle2, PackageSearch, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoSvg from '../assets/logo.svg';
import ActionButton from './ui/ActionButton';

export default function HeroBanner() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const term = query.trim();
    if (!term) {
      navigate('/verify');
      return;
    }
    if (/^SN-|\d{5,}/i.test(term)) {
      navigate(`/verify?serial=${encodeURIComponent(term)}`);
    } else {
      navigate(`/dashboard/marketplace?search=${encodeURIComponent(term)}`);
    }
  };

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

        <form className="marketplace-hero-search" role="search" onSubmit={handleSearch}>
          <Search size={20} aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search serial, product, seller, or category"
            aria-label="Search marketplace"
          />
          <ActionButton variant="primary" size="md" type="submit">
            Verify
          </ActionButton>
        </form>

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

        <div className="marketplace-hero-metrics" aria-label="Platform assurances">
          <span><strong>Ledger Backed</strong> Cryptographic Proof</span>
          <span><strong>Instant</strong> Serial Verification</span>
          <span><strong>Authentic</strong> Direct Sourcing</span>
          <span><strong>Protected</strong> Buyer Escrow</span>
        </div>
      </div>

      <div className="marketplace-hero-visual" aria-hidden="true">
        <div className="hero-emblem-halo" />
        <div className="hero-emblem-rings" />
        <div className="hero-emblem-core">
          <img src={logoSvg} alt="VeriChain Emblem" className="hero-svg-emblem" />
        </div>
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

