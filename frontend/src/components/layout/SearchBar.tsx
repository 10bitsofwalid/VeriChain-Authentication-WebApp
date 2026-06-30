import { Search } from 'lucide-react';
import './layout.css';

interface SearchBarProps {
  onFocus?: () => void;
  placeholder?: string;
}

export default function SearchBar({ onFocus, placeholder = 'Search products, sellers, serials...' }: SearchBarProps) {
  return (
    <button className="vc-search-bar" onClick={onFocus} type="button" aria-label="Open global search">
      <Search size={18} aria-hidden="true" />
      <span>{placeholder}</span>
      <kbd>Ctrl K</kbd>
    </button>
  );
}
