// src/components/LazyImage.tsx
import React from 'react';
import { useLazyImage } from '../hooks/useLazyImage';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  /** Optional placeholder while loading */
  placeholder?: string;
}

const DEFAULT_SVG_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23e2e8f0'/></svg>";

/**
 * LazyImage component that loads the image when it enters the viewport.
 * It uses the useLazyImage hook for IntersectionObserver handling.
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  placeholder,
  alt = '',
  srcSet,
  sizes,
  className = '',
  style,
  ...rest
}) => {
  const { source, loading, imgRef } = useLazyImage(src);
  const displaySrc = loading ? (placeholder ?? DEFAULT_SVG_PLACEHOLDER) : source;

  return (
    <img
      ref={imgRef as React.RefObject<HTMLImageElement>}
      src={displaySrc}
      srcSet={loading ? undefined : srcSet}
      sizes={loading ? undefined : sizes}
      alt={alt}
      className={`${className} ${loading ? 'animate-pulse' : ''}`}
      style={{
        transition: 'filter 0.3s ease-out',
        filter: loading ? 'blur(4px)' : 'none',
        ...style
      }}
      {...rest}
    />
  );
};

export default LazyImage;
