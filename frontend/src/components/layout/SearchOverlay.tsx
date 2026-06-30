import { Link } from 'react-router-dom';
import { Factory, PackageSearch, Search, ShieldCheck, Store, X } from 'lucide-react';
import ActionButton from '../ui/ActionButton';
import StatusChip from '../ui/StatusChip';
import './layout.css';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const resultGroups = [
  { label: 'Products', icon: PackageSearch, to: '/dashboard/marketplace', helper: 'Browse verified marketplace' },
  { label: 'Factories', icon: Factory, to: '/trust-center', helper: 'Trusted manufacturers and certificates' },
  { label: 'Sellers', icon: Store, to: '/dashboard/marketplace', helper: 'Verified storefronts and ownership' },
  { label: 'Verify Serial', icon: ShieldCheck, to: '/verify', helper: 'Run authenticity check' },
];

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  if (!open) return null;

  return (
    <div className="vc-search-overlay" role="dialog" aria-modal="true" aria-label="Global search">
      <div className="vc-search-panel">
        <div className="vc-search-input-row">
          <Search size={20} aria-hidden="true" />
          <input autoFocus placeholder="Search products, factories, sellers, categories..." />
          <ActionButton variant="ghost" size="icon" onClick={onClose} aria-label="Close search">
            <X size={18} />
          </ActionButton>
        </div>

        <div className="vc-search-meta">
          <StatusChip tone="info">Recent searches</StatusChip>
          <span>AirPods Max</span>
          <span>SN-0482</span>
          <span>Certified leather</span>
        </div>

        <div className="vc-search-results">
          {resultGroups.map((result) => (
            <Link key={result.label} to={result.to} onClick={onClose} className="vc-search-result">
              <span className="vc-search-result-icon">
                <result.icon size={18} aria-hidden="true" />
              </span>
              <span>
                <strong>{result.label}</strong>
                <small>{result.helper}</small>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
