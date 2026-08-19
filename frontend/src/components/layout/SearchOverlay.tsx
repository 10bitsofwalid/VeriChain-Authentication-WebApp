import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const recentSearches = ['AirPods Max', 'SN-0482', 'Certified leather'];

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleExecuteSearch = (searchTerm?: string) => {
    const term = (searchTerm !== undefined ? searchTerm : query).trim();
    if (!term) return;

    onClose();
    if (/^SN-|\d{5,}/i.test(term)) {
      navigate(`/verify?serial=${encodeURIComponent(term)}`);
    } else {
      navigate(`/dashboard/marketplace?search=${encodeURIComponent(term)}`);
    }
  };

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus input
    const input = panelRef.current?.querySelector('input');
    if (input) {
      setTimeout(() => input.focus(), 50);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab') {
        if (!panelRef.current) return;
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'input, button, a, [href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="vc-search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="vc-search-panel" ref={panelRef} onClick={(e) => e.stopPropagation()}>
        <form
          className="vc-search-input-row"
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteSearch(query);
          }}
        >
          <Search size={20} aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, factories, sellers, categories..."
            aria-label="Search keywords"
          />
          <ActionButton variant="ghost" size="icon" onClick={onClose} aria-label="Close search" type="button">
            <X size={18} />
          </ActionButton>
        </form>

        <div className="vc-search-meta">
          <StatusChip tone="info">Recent searches</StatusChip>
          {recentSearches.map((item) => (
            <button
              key={item}
              type="button"
              className="vc-search-chip-btn"
              onClick={() => handleExecuteSearch(item)}
            >
              {item}
            </button>
          ))}
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

