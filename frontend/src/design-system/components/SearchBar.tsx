import React from 'react';
import './SearchBar.css';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="search-bar input-icon-wrapper" style={{ flex: '1', minWidth: '280px', maxWidth: '450px', display: 'flex', alignItems: 'center' }}>
    <Search size={16} className="input-icon" />
    <input
      type="text"
      className="form-input input-with-icon"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

export default SearchBar;
