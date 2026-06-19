// src/components/LazyImage.tsx
import React from 'react';
import { useLazyImage } from '../hooks/useLazyImage';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  /** Optional placeholder while loading */
  placeholder?: string;
}

/**
 * LazyImage component that loads the image when it enters the viewport.
 * It uses the useLazyImage hook for IntersectionObserver handling.
 */
const LazyImage: React.FC<LazyImageProps> = ({ src, placeholder, alt = '', ...rest }) => {
  const { source, loading, imgRef } = useLazyImage(src);
  const displaySrc = loading ? placeholder ?? '' : source;

  return (
    <img
      ref={imgRef as React.RefObject<HTMLImageElement>}
      src={displaySrc}
      alt={alt}
      {...rest}
    />
  );
};

export default LazyImage;
