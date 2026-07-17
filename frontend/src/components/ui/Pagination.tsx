import React from 'react';
import './ui.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ariaLabel?: string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, ariaLabel = 'Pagination' }: PaginationProps) {
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <nav aria-label={ariaLabel} className="flex items-center justify-center gap-2 mt-4">
      <button
        className="btn btn-sm btn-secondary"
        onClick={handlePrev}
        disabled={currentPage === 1}
        aria-disabled={currentPage === 1}
        aria-label="Previous page"
      >
        Prev
      </button>
      {pages.map((page) => (
        <button
          key={page}
          className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      <button
        className="btn btn-sm btn-secondary"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
}
