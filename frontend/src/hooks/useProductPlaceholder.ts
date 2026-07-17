import { useMemo } from 'react';

/**
 * Hook to generate placeholder data for a product based on its serial number.
 * Extracted from ProductCard component for reuse and readability.
 */
export const useProductPlaceholder = (item: any) => {
  return useMemo(() => {
    const hash = item.serialNumber
      ? item.serialNumber.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
      : 0;
    return {
      factoryName: item.product?.manufacturer || 'Verified Factory',
      trustScore: 70 + (hash % 30),
      rating: (4.0 + (hash % 11) / 10).toFixed(1),
      stock: 5 + (hash % 95),
      price: Number(item.product?.price || 20 + (hash % 480)).toFixed(2),
    };
  }, [item]);
};
