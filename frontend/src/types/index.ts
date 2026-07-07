export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  sku: string;
  imageUrl: string;
  verifiedStatus: 'pending' | 'verified' | 'rejected';
  certificateUrl?: string;
  specs?: Record<string, string>;
  price?: number;
  manufacturer?: string;
  imageGallery?: string[];
  specifications?: Record<string, string>;
}

export interface UserRef {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'factory' | 'moderator' | 'admin';
  verified: boolean;
}

export interface ItemInstance {
  _id: string;
  serialNumber: string;
  counterfeitRisk: 'low' | 'medium' | 'high';
  status: 'manufactured' | 'listed' | 'sold' | 'recalled';
  product: Product;
  currentOwner: UserRef;
  manufacturedAt: string;
  location?: string;
  journey?: JourneyStep[];
}

export interface JourneyStep {
  action: string;
  actor: UserRef;
  timestamp: string;
  location?: string;
  txHash?: string;
  details?: string;
}

export interface Complaint {
  _id: string;
  productInstance: ItemInstance;
  buyer: UserRef;
  seller: UserRef;
  reason: string;
  description: string;
  evidenceUrl?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  transactionHash?: string;
}

export interface FactoryProfileInfo {
  _id: string;
  name: string;
  email: string;
  factoryLocation: string;
  factoryCapacity: string;
  factoryCertificateNo: string;
  trustScore?: number;
}

export interface SellerProfileInfo {
  _id: string;
  name: string;
  email: string;
  trustScore?: number;
}

export interface AuditLogEntry {
  _id: string;
  action: string;
  actor: UserRef;
  details: string;
  timestamp: string;
}

export interface ItemDetailResponse {
  _id: string;
  product: Product;
  item: ItemInstance;
  factory: FactoryProfileInfo;
  seller: SellerProfileInfo;
}

