import React from 'react';
import './CategoryFilter.css';

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selected, onSelect }) => {
  return (
    <div className="category-filter">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          className={`filter-button ${selected === cat ? 'active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
