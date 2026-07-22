// ─── Buyer Experience Mock Data ───────────────────────────────────────────────

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  verified: boolean;
  serialNumber: string;
  category: string;
  inStock: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total: number;
  items: { name: string; qty: number; price: number; image: string; verified: boolean }[];
  trackingNumber?: string;
  estimatedDelivery?: string;
  carrier?: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  verified: boolean;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
}

export interface PurchaseRecord {
  id: string;
  orderNumber: string;
  date: string;
  product: string;
  brand: string;
  category: string;
  price: number;
  status: 'completed' | 'refunded' | 'disputed';
  verified: boolean;
  serialNumber: string;
  image: string;
}

// ─── Cart Items ───────────────────────────────────────────────────────────────
export const mockCartItems: CartItem[] = [
  {
    id: 'cart-1',
    name: 'Nike Air Max 270 React',
    brand: 'Nike',
    price: 149.99,
    originalPrice: 189.99,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    verified: true,
    serialNumber: 'NK-AM270-2024-001',
    category: 'Footwear',
    inStock: true,
  },
  {
    id: 'cart-2',
    name: 'Samsung Galaxy Watch 6',
    brand: 'Samsung',
    price: 299.99,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    verified: true,
    serialNumber: 'SM-GW6-2024-042',
    category: 'Electronics',
    inStock: true,
  },
  {
    id: 'cart-3',
    name: 'Levi\'s 501 Original Jeans',
    brand: 'Levi\'s',
    price: 69.99,
    originalPrice: 89.99,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
    verified: false,
    serialNumber: 'LV-501-2024-118',
    category: 'Apparel',
    inStock: true,
  },
];

// ─── Orders ───────────────────────────────────────────────────────────────────
export const mockOrders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'VC-2024-00891',
    date: '2024-12-15',
    status: 'delivered',
    total: 324.97,
    trackingNumber: '1Z999AA10123456784',
    carrier: 'UPS',
    estimatedDelivery: '2024-12-18',
    items: [
      { name: 'Adidas Ultraboost 23', qty: 1, price: 189.99, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80', verified: true },
      { name: 'Sport Socks Pack', qty: 2, price: 24.99, image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400&q=80', verified: false },
    ],
  },
  {
    id: 'ord-2',
    orderNumber: 'VC-2024-00756',
    date: '2024-11-28',
    status: 'shipped',
    total: 549.00,
    trackingNumber: 'TBA123456789000',
    carrier: 'FedEx',
    estimatedDelivery: '2024-12-02',
    items: [
      { name: 'Sony WH-1000XM5 Headphones', qty: 1, price: 349.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', verified: true },
      { name: 'Headphone Case Premium', qty: 1, price: 49.99, image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80', verified: true },
    ],
  },
  {
    id: 'ord-3',
    orderNumber: 'VC-2024-00612',
    date: '2024-10-10',
    status: 'processing',
    total: 89.95,
    estimatedDelivery: '2024-10-15',
    items: [
      { name: 'Ray-Ban Wayfarer Classic', qty: 1, price: 89.95, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80', verified: true },
    ],
  },
  {
    id: 'ord-4',
    orderNumber: 'VC-2024-00441',
    date: '2024-09-03',
    status: 'cancelled',
    total: 219.00,
    items: [
      { name: 'Apple AirPods Pro 2nd Gen', qty: 1, price: 249.00, image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&q=80', verified: true },
    ],
  },
];

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const mockWishlist: WishlistItem[] = [
  {
    id: 'wish-1',
    name: 'Apple Watch Ultra 2',
    brand: 'Apple',
    price: 799.00,
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&q=80',
    verified: true,
    category: 'Electronics',
    rating: 4.9,
    reviews: 2341,
    inStock: true,
  },
  {
    id: 'wish-2',
    name: 'Hermès Birkin 30 Togo',
    brand: 'Hermès',
    price: 12500.00,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    verified: true,
    category: 'Luxury Bags',
    rating: 5.0,
    reviews: 89,
    inStock: false,
  },
  {
    id: 'wish-3',
    name: 'Rolex Submariner Date',
    brand: 'Rolex',
    price: 14500.00,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400&q=80',
    verified: true,
    category: 'Watches',
    rating: 4.9,
    reviews: 512,
    inStock: true,
  },
  {
    id: 'wish-4',
    name: 'Nike Dunk Low Panda',
    brand: 'Nike',
    price: 110.00,
    originalPrice: 150.00,
    image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&q=80',
    verified: true,
    category: 'Footwear',
    rating: 4.7,
    reviews: 8901,
    inStock: true,
  },
  {
    id: 'wish-5',
    name: 'Dyson V15 Detect',
    brand: 'Dyson',
    price: 749.99,
    originalPrice: 899.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    verified: true,
    category: 'Home Appliances',
    rating: 4.6,
    reviews: 3217,
    inStock: true,
  },
  {
    id: 'wish-6',
    name: 'Gucci GG Marmont Mini Bag',
    brand: 'Gucci',
    price: 1150.00,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
    verified: true,
    category: 'Luxury Bags',
    rating: 4.8,
    reviews: 423,
    inStock: true,
  },
];

// ─── Purchase History ─────────────────────────────────────────────────────────
export const mockPurchaseHistory: PurchaseRecord[] = [
  {
    id: 'ph-1',
    orderNumber: 'VC-2024-00891',
    date: '2024-12-15',
    product: 'Adidas Ultraboost 23',
    brand: 'Adidas',
    category: 'Footwear',
    price: 189.99,
    status: 'completed',
    verified: true,
    serialNumber: 'AD-UB23-2024-009',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80',
  },
  {
    id: 'ph-2',
    orderNumber: 'VC-2024-00756',
    date: '2024-11-28',
    product: 'Sony WH-1000XM5 Headphones',
    brand: 'Sony',
    category: 'Electronics',
    price: 349.99,
    status: 'completed',
    verified: true,
    serialNumber: 'SN-WH1M5-2024-033',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
  },
  {
    id: 'ph-3',
    orderNumber: 'VC-2024-00441',
    date: '2024-09-03',
    product: 'Apple AirPods Pro 2nd Gen',
    brand: 'Apple',
    category: 'Electronics',
    price: 249.00,
    status: 'refunded',
    verified: true,
    serialNumber: 'AP-APP2-2024-071',
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&q=80',
  },
  {
    id: 'ph-4',
    orderNumber: 'VC-2024-00312',
    date: '2024-08-20',
    product: 'Louis Vuitton Neverfull MM',
    brand: 'Louis Vuitton',
    category: 'Luxury Bags',
    price: 1700.00,
    status: 'completed',
    verified: true,
    serialNumber: 'LV-NF-MM-2024-006',
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&q=80',
  },
  {
    id: 'ph-5',
    orderNumber: 'VC-2024-00188',
    date: '2024-06-11',
    product: 'Off-White x Nike Air Force 1',
    brand: 'Off-White',
    category: 'Footwear',
    price: 380.00,
    status: 'disputed',
    verified: false,
    serialNumber: 'OW-AF1-2024-029',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
  },
  {
    id: 'ph-6',
    orderNumber: 'VC-2024-00077',
    date: '2024-04-05',
    product: 'Balenciaga Triple S Sneaker',
    brand: 'Balenciaga',
    category: 'Footwear',
    price: 895.00,
    status: 'completed',
    verified: true,
    serialNumber: 'BLG-TS-2024-015',
    image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&q=80',
  },
];

// ─── User Profile ─────────────────────────────────────────────────────────────
export const mockProfile = {
  name: 'Walid Al-Rasheed',
  username: '@walid_ar',
  email: 'walid@verichain.io',
  phone: '+966 50 123 4567',
  location: 'Riyadh, Saudi Arabia',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
  joinDate: 'March 2023',
  totalPurchases: 6,
  totalSpent: 3763.98,
  verifiedItems: 5,
  trustScore: 98,
  addresses: [
    {
      id: 'addr-1',
      label: 'Home',
      name: 'Walid Al-Rasheed',
      line1: 'King Fahd Road, Building 14',
      line2: 'Apt 7B',
      city: 'Riyadh',
      country: 'Saudi Arabia',
      zip: '12211',
      isDefault: true,
    },
    {
      id: 'addr-2',
      label: 'Office',
      name: 'Walid Al-Rasheed',
      line1: 'Al Olaya Business District, Tower 3',
      line2: 'Floor 12',
      city: 'Riyadh',
      country: 'Saudi Arabia',
      zip: '12244',
      isDefault: false,
    },
  ],
  paymentMethods: [
    { id: 'pm-1', type: 'visa', last4: '4242', expiry: '12/26', isDefault: true },
    { id: 'pm-2', type: 'mastercard', last4: '8910', expiry: '03/27', isDefault: false },
  ],
};
