// ─── Buyer Experience Types ───────────────────────────────────────────────────

export interface CartItem {
  id: string;
  name: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image?: string;
  imageUrl?: string;
  verified?: boolean;
  serialNumber?: string;
  category?: string;
  inStock?: boolean;
}

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  image?: string;
  verified?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
  estimatedDelivery?: string;
  carrier?: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  imageUrl?: string;
  verified?: boolean;
  category?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
}

export interface PurchaseRecord {
  id: string;
  orderNumber: string;
  date: string;
  product: string;
  brand?: string;
  category?: string;
  price: number;
  status: 'completed' | 'refunded' | 'disputed';
  verified?: boolean;
  serialNumber?: string;
  image?: string;
}

export interface UserAddress {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  country: string;
  zip: string;
  isDefault?: boolean;
}

export interface UserPaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  isDefault?: boolean;
}

export interface UserProfile {
  name: string;
  username?: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string;
  joinDate?: string;
  totalPurchases?: number;
  totalSpent?: number;
  verifiedItems?: number;
  trustScore?: number;
  addresses?: UserAddress[];
  paymentMethods?: UserPaymentMethod[];
}
