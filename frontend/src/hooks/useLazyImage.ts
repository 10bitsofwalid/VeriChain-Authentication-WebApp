// src/hooks/useLazyImage.ts
import { useState, useEffect, useRef } from 'react';

/**
 * Hook to lazily load an image when it enters the viewport.
 * Returns the image source once loaded and a loading flag.
 */
export function useLazyImage(src: string) {
  const [source, setSource] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) return;
    let observer: IntersectionObserver | null = null;
    const imgElement = imgRef.current;

    const loadImage = () => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setSource(src);
        setLoading(false);
      };
      img.onerror = () => {
        // In case of error, keep placeholder empty and stop loading.
        setLoading(false);
      };
    };

    if (imgElement) {
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              observer?.disconnect();
            }
          });
        });
        observer.observe(imgElement);
      } else {
        // Fallback: load immediately if IntersectionObserver is unavailable.
        loadImage();
      }
    }
    return () => {
      observer?.disconnect();
    };
  }, [src]);

  return { source, loading, imgRef };
}
