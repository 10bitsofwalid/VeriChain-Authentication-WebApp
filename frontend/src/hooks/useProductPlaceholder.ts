import { useMemo } from 'react';

const CURATED_FALLBACK_PRODUCTS = [
  {
    name: 'TitanChronos Tourbillon Watch',
    category: 'Luxury Goods',
    description: 'Handcrafted luxury chronometer with sapphire crystal casing and certified movement.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    price: 8900,
    factoryName: 'Swiss Horology Precision Lab',
  },
  {
    name: 'AeroGlide Pro Carbon Road Bike',
    category: 'Sports & Outdoors',
    description: 'Ultra-lightweight aerodynamic carbon fiber frame engineered for professional road racing.',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80',
    price: 2499,
    factoryName: 'Veloce Velocity Carbon Works',
  },
  {
    name: 'AirPods Max Space Gray',
    category: 'Electronics',
    description: 'High-fidelity acoustic audio headphones with computational audio and cryptographic digital birth certificates.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    price: 549,
    factoryName: 'Acoustics Cupertino Manufacturing',
  },
  {
    name: 'Sovereign Full-Grain Leather Briefcase',
    category: 'Luxury Goods',
    description: 'Vegetable-tanned full-grain artisan leather with laser-etched cryptographic provenance chip.',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
    price: 680,
    factoryName: 'Florence Leather Atelier',
  },
  {
    name: 'Leica M11 Rangefinder Camera',
    category: 'Electronics',
    description: 'Precision German engineered 60MP full-frame rangefinder camera with immutable hardware provenance seal.',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    price: 8995,
    factoryName: 'Wetzlar Optics & Sensor Lab',
  },
  {
    name: 'Château Margaux Premier Grand Cru',
    category: 'Luxury Goods',
    description: 'Authenticated vintage estate bottled red wine with encrypted temperature logging NFC seal.',
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80',
    price: 1250,
    factoryName: 'Bordeaux Grand Cru Cellars',
  },
  {
    name: 'Jordan 1 Retro High Chicago Lost & Found',
    category: 'Sports & Outdoors',
    description: 'Iconic high-top vintage basketball sneaker verified against factory mold and material spectral scans.',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80',
    price: 420,
    factoryName: 'Nike Heritage Special Projects',
  },
  {
    name: 'Montblanc Meisterstück 149 Fountain Pen',
    category: 'Luxury Goods',
    description: 'Precious black resin with gold-coated details and hand-crafted Au 750 / 18 K gold nib with rhodium-coated inlay.',
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=900&q=80',
    price: 990,
    factoryName: 'Hamburg Writing Instruments Manufactory',
  },
];

/**
 * Hook to generate realistic placeholder and fallback data for a product
 * based on its serial number hash and product attributes.
 */
export const useProductPlaceholder = (item: any) => {
  return useMemo(() => {
    const rawStr = item.serialNumber || item._id || '0';
    const hash = rawStr.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const fallback = CURATED_FALLBACK_PRODUCTS[Math.abs(hash) % CURATED_FALLBACK_PRODUCTS.length];

    const hasRealName =
      Boolean(item.product?.name) &&
      item.product.name.toLowerCase() !== 'authenticated product' &&
      item.product.name.trim() !== '';

    const hasRealImg =
      Boolean(item.product?.imageUrl) &&
      !item.product.imageUrl.includes('photo-1531403009284-440f080d1e12') &&
      item.product.imageUrl.trim() !== '';

    const hasRealDesc =
      Boolean(item.product?.description) &&
      !item.product.description.toLowerCase().includes('traceable ownership and provenance') &&
      item.product.description.trim() !== '';

    return {
      name: hasRealName ? item.product.name : fallback.name,
      description: hasRealDesc ? item.product.description : fallback.description,
      category: item.product?.category && item.product.category !== 'General' ? item.product.category : fallback.category,
      imageUrl: hasRealImg ? item.product.imageUrl : fallback.imageUrl,
      factoryName: item.product?.manufacturer || fallback.factoryName,
      trustScore: 85 + (hash % 15),
      rating: (4.5 + (hash % 6) / 10).toFixed(1),
      stock: 3 + (hash % 18),
      price:
        item.product?.price != null && Number(item.product.price) > 0
          ? Number(item.product.price).toFixed(2)
          : Number(fallback.price).toFixed(2),
    };
  }, [item]);
};
