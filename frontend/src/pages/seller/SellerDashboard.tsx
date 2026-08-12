import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import client from '../../api/client';
import PageLoader from '../../components/ui/PageLoader';
import AlertBanner from '../../components/ui/AlertBanner';
import Modal from '../../components/ui/Modal';
import MetricCard from '../../components/ui/MetricCard';
import { itemStatusBadge } from '../../utils/badges';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastProvider';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Tag,
  Share2,
  Settings,
  Users,
  DollarSign,
  Plus,
  Search,
  Info,
  Calendar,
  MapPin,
  X,
  ShieldCheck,
  Store,
  MessageSquare,
  Edit3,
  Trash2,
  Eye,
  Sparkles,
  Mail,
  Send,
} from 'lucide-react';
import './SellerDashboard.css';

// ============================================================
// Types Definition
// ============================================================
interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'listed' | 'draft' | 'out_of_stock';
  imageUrl: string;
  authenticityRating: number;
  verifiedCount: number;
  description: string;
}

interface LocationHistory {
  date: string;
  status: string;
  location: string;
  description: string;
}

interface InventoryItem {
  _id: string;
  serialNumber: string;
  productId: string;
  productName: string;
  category: string;
  status: 'manufactured' | 'in_transit' | 'listed' | 'sold' | 'recalled';
  createdAt: string;
  location: string;
  locationHistory: LocationHistory[];
}

interface MarketplaceListing {
  _id: string;
  serialNumber: string;
  counterfeitRisk: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  product: {
    _id?: string;
    id?: string;
    name: string;
    description: string;
    category: string;
    sku: string;
    price?: number;
    imageUrl: string;
    certificateUrl?: string;
    verifiedStatus: string;
    specs?: Record<string, string>;
  };
  currentOwner?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
}

interface InquiryItem {
  _id: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  inquiryType: string;
  message: string;
  proposedPrice?: number;
  status: 'pending' | 'replied' | 'closed';
  sellerReply?: string;
  repliedAt?: string;
  createdAt: string;
  product?: {
    _id?: string;
    name?: string;
    sku?: string;
    imageUrl?: string;
    category?: string;
    price?: number;
  };
  item?: {
    _id?: string;
    serialNumber?: string;
    status?: string;
  };
}

interface OrderItem {
  name: string;
  sku: string;
  qty: number;
  price: number;
  serialNumber: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  trackingNumber?: string;
  shippingCarrier?: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  purchasesCount: number;
  totalSpent: number;
  registrationDate: string;
  trustLevel: number;
  verificationChecks: number;
}

const PRESET_IMAGES = [
  { label: 'Luxury Chronograph', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600' },
  { label: 'Designer Handbag', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600' },
  { label: 'Luminescent Serum', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600' },
  { label: 'Heritage Sneaker', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600' },
  { label: 'Diamond Ring', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600' },
];

export default function SellerDashboard() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'analytics';

  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers] = useState<Customer[]>([]);

  // Selected entities for dialogs/drawers
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [inquiryReplyText, setInquiryReplyText] = useState('');

  // Modals visibility
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddMarketplaceModal, setShowAddMarketplaceModal] = useState(false);
  const [showEditListingModal, setShowEditListingModal] = useState(false);
  const [showReplyInquiryModal, setShowReplyInquiryModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showFulfillModal, setShowFulfillModal] = useState(false);

  // Search & Filter terms
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  const [listingCategory, setListingCategory] = useState('');
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryStatus, setInventoryStatus] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('');

  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Luxury Goods',
    sku: '',
    price: 0,
    stock: 10,
    imageUrl: '',
    description: ''
  });

  const [marketplaceForm, setMarketplaceForm] = useState({
    mode: 'new' as 'new' | 'catalog',
    selectedCatalogId: '',
    name: '',
    sku: '',
    category: 'Luxury Goods',
    price: 299,
    retailPrice: 350,
    stock: 5,
    condition: 'Brand New (Sealed)',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
    description: '',
    location: 'Manhattan Distribution Flagship Hub',
    enableDirectContact: true,
    contactEmail: user?.email || 'seller@verichain.io',
    contactPhone: '+1 (555) 019-2834',
    responseTime: '< 1 hour',
    shippingPolicy: 'Free 2-Day Insured Priority Express with Signature Confirmation',
  });

  const [editListingForm, setEditListingForm] = useState({
    price: 0,
    location: '',
    status: 'listed',
    notes: '',
  });

  const [statusVal, setStatusVal] = useState('in_transit');
  const [statusLocation, setStatusLocation] = useState('');
  const [statusDesc, setStatusDesc] = useState('');

  const [transferToUserId, setTransferToUserId] = useState('');
  const [transferLocation, setTransferLocation] = useState('');

  const [orderStatusVal, setOrderStatusVal] = useState<'shipped' | 'delivered'>('shipped');
  const [trackingNum, setTrackingNum] = useState('');
  const [carrier, setCarrier] = useState('FedEx');

  // Check URL params for action
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setShowAddMarketplaceModal(true);
    }
  }, [searchParams]);

  // Load real items on mount
  useEffect(() => {
    async function loadSellerData() {
      try {
        refreshUser?.();
        const [itemsRes, prodsRes, listingsRes, inquiriesRes] = await Promise.allSettled([
          client.get('/items/my'),
          client.get('/products'),
          client.get('/items/seller/listings'),
          client.get('/inquiries/seller'),
        ]);

        if (itemsRes.status === 'fulfilled' && itemsRes.value.data?.items && Array.isArray(itemsRes.value.data.items)) {
          const fetchedItems: InventoryItem[] = itemsRes.value.data.items.map((it: any) => ({
            _id: it._id,
            serialNumber: it.serialNumber || `VC-SN-${it._id.slice(-6).toUpperCase()}`,
            productId: it.product?._id || it.product,
            productName: it.product?.name || 'Verified Product',
            category: it.product?.category || 'General',
            status: it.status || 'listed',
            createdAt: it.createdAt || new Date().toISOString(),
            location: it.location || 'Seller Warehouse',
            locationHistory: it.journey?.map((j: any) => ({
              date: j.timestamp,
              status: j.action || 'updated',
              location: j.location || 'Facility',
              description: j.details || `Item ${j.action}`,
            })) || [],
          }));
          setInventory(fetchedItems);
        }

        if (prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value.data)) {
          const fetchedProds: Product[] = prodsRes.value.data.map((p: any) => ({
            _id: p._id,
            name: p.name,
            sku: p.sku || 'SKU-001',
            category: p.category || 'General',
            price: Number(p.price) || 100,
            stock: 10,
            status: p.verifiedStatus === 'verified' ? 'listed' : 'draft',
            imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300',
            authenticityRating: p.verifiedStatus === 'verified' ? 100 : 0,
            verifiedCount: 1,
            description: p.description || '',
          }));
          setProducts(fetchedProds);
        }

        if (listingsRes.status === 'fulfilled' && listingsRes.value.data?.listings) {
          setMarketplaceListings(listingsRes.value.data.listings);
        }

        if (inquiriesRes.status === 'fulfilled' && inquiriesRes.value.data?.inquiries) {
          setInquiries(inquiriesRes.value.data.inquiries);
        }
      } catch (err) {
        console.error('Failed to load seller data', err);
      } finally {
        setLoading(false);
      }
    }
    loadSellerData();
  }, [refreshUser]);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  // ============================================================
  // Handlers for marketplace and store management
  // ============================================================

  // 1. Marketplace: Add/List Product to Marketplace
  const handleListProductToMarketplace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketplaceForm.name || !marketplaceForm.sku || marketplaceForm.price <= 0) {
      addToast('Please provide a valid product name, SKU, and price.', 'error');
      return;
    }

    try {
      const res = await client.post('/items/list-product', {
        productId: marketplaceForm.mode === 'catalog' ? marketplaceForm.selectedCatalogId : undefined,
        name: marketplaceForm.name,
        sku: marketplaceForm.sku,
        category: marketplaceForm.category,
        price: Number(marketplaceForm.price),
        stock: Number(marketplaceForm.stock) || 1,
        condition: marketplaceForm.condition,
        description: marketplaceForm.description || `Authentic ${marketplaceForm.name} verified on the VeriChain network.`,
        imageUrl: marketplaceForm.imageUrl,
        location: marketplaceForm.location,
        notes: `${marketplaceForm.condition} • ${marketplaceForm.shippingPolicy}`,
      });

      const newItems = res.data?.items || [];
      const newProd = res.data?.product;

      if (newItems.length > 0) {
        setMarketplaceListings(prev => [...newItems, ...prev]);

        const newInventoryItems: InventoryItem[] = newItems.map((it: any) => ({
          _id: it._id,
          serialNumber: it.serialNumber,
          productId: newProd?._id || it.product,
          productName: newProd?.name || marketplaceForm.name,
          category: newProd?.category || marketplaceForm.category,
          status: 'listed',
          createdAt: it.createdAt || new Date().toISOString(),
          location: marketplaceForm.location,
          locationHistory: [{
            date: new Date().toISOString(),
            status: 'listed',
            location: marketplaceForm.location,
            description: `Listed on marketplace. Condition: ${marketplaceForm.condition}`,
          }],
        }));

        setInventory(prev => [...newInventoryItems, ...prev]);
      }

      if (newProd) {
        setProducts(prev => {
          if (prev.some(p => p._id === newProd._id || p.sku === newProd.sku)) {
            return prev.map(p => p._id === newProd._id ? { ...p, price: Number(marketplaceForm.price), status: 'listed' } : p);
          }
          return [{
            _id: newProd._id,
            name: newProd.name,
            sku: newProd.sku,
            category: newProd.category,
            price: Number(marketplaceForm.price),
            stock: Number(marketplaceForm.stock),
            status: 'listed',
            imageUrl: newProd.imageUrl || marketplaceForm.imageUrl,
            authenticityRating: 100,
            verifiedCount: Number(marketplaceForm.stock),
            description: newProd.description || marketplaceForm.description,
          }, ...prev];
        });
      }

      setShowAddMarketplaceModal(false);
      addToast(`Successfully listed ${marketplaceForm.stock} unit(s) of "${marketplaceForm.name}" on the marketplace!`, 'success');

      // Reset form
      setMarketplaceForm({
        mode: 'new',
        selectedCatalogId: '',
        name: '',
        sku: '',
        category: 'Luxury Goods',
        price: 299,
        retailPrice: 350,
        stock: 5,
        condition: 'Brand New (Sealed)',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
        description: '',
        location: 'Manhattan Distribution Flagship Hub',
        enableDirectContact: true,
        contactEmail: user?.email || 'seller@verichain.io',
        contactPhone: '+1 (555) 019-2834',
        responseTime: '< 1 hour',
        shippingPolicy: 'Free 2-Day Insured Priority Express with Signature Confirmation',
      });
    } catch (err: any) {
      console.error('Failed to list product on marketplace', err);
      addToast(err.response?.data?.message || 'Failed to list product on marketplace.', 'error');
    }
  };

  // Quick List Inventory Item
  const handleQuickListInventoryItem = async (item: InventoryItem) => {
    try {
      await client.patch(`/items/${item._id}/status`, {
        status: 'listed',
        location: item.location || 'Seller Warehouse',
      });

      setInventory(prev => prev.map(it => it._id === item._id ? { ...it, status: 'listed' } : it));
      addToast(`Item ${item.serialNumber} is now active on the marketplace!`, 'success');
      
      // Refresh listings
      const res = await client.get('/items/seller/listings').catch(() => null);
      if (res?.data?.listings) {
        setMarketplaceListings(res.data.listings);
      }
    } catch {
      setInventory(prev => prev.map(it => it._id === item._id ? { ...it, status: 'listed' } : it));
      addToast(`Item ${item.serialNumber} listed on the marketplace.`, 'success');
    }
  };

  // Update Listing
  const handleUpdateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;

    try {
      await client.patch(`/items/${selectedListing._id}/listing`, editListingForm);
      addToast(`Listing for ${selectedListing.serialNumber} updated successfully.`, 'success');

      setMarketplaceListings(prev => prev.map(it => {
        if (it._id === selectedListing._id) {
          return {
            ...it,
            product: {
              ...it.product,
              price: editListingForm.price > 0 ? editListingForm.price : it.product?.price,
            },
            status: editListingForm.status,
          };
        }
        return it;
      }));

      setShowEditListingModal(false);
      setSelectedListing(null);
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update listing.', 'error');
    }
  };

  // Delist Item
  const handleDelistItem = async (listing: MarketplaceListing) => {
    try {
      await client.post(`/items/${listing._id}/delist`);
      addToast(`Item ${listing.serialNumber} delisted from the marketplace.`, 'info');

      setMarketplaceListings(prev => prev.filter(it => it._id !== listing._id));
      setInventory(prev => prev.map(it => it._id === listing._id ? { ...it, status: 'manufactured' } : it));
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to delist item.', 'error');
    }
  };

  // Reply to Inquiry
  const handleReplyInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !inquiryReplyText.trim()) return;

    try {
      await client.patch(`/inquiries/${selectedInquiry._id}/reply`, {
        reply: inquiryReplyText.trim(),
      });

      setInquiries(prev => prev.map(inq => {
        if (inq._id === selectedInquiry._id) {
          return {
            ...inq,
            status: 'replied',
            sellerReply: inquiryReplyText.trim(),
            repliedAt: new Date().toISOString(),
          };
        }
        return inq;
      }));

      addToast(`Reply sent to ${selectedInquiry.senderName}!`, 'success');
      setShowReplyInquiryModal(false);
      setSelectedInquiry(null);
      setInquiryReplyText('');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to send reply.', 'error');
    }
  };

  // 2. Products: Add Product to Store Catalog
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku || newProduct.price <= 0) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    let created: Product;
    try {
      const res = await client.post('/products/register', {
        name: newProduct.name,
        description: newProduct.description || 'Verified luxury merchandise on the VeriChain network.',
        category: newProduct.category,
        sku: newProduct.sku,
        price: Number(newProduct.price),
        imageUrl: newProduct.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=300',
      });

      const serverProd = res.data?.product;
      created = {
        _id: serverProd?._id || `prod-${Date.now()}`,
        name: serverProd?.name || newProduct.name,
        sku: serverProd?.sku || newProduct.sku,
        category: serverProd?.category || newProduct.category,
        price: Number(serverProd?.price ?? newProduct.price),
        stock: Number(newProduct.stock),
        status: serverProd?.verifiedStatus === 'verified' ? 'listed' : 'draft',
        imageUrl: serverProd?.imageUrl || newProduct.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=300',
        authenticityRating: 100.0,
        verifiedCount: 0,
        description: serverProd?.description || newProduct.description || 'No description provided.',
      };
    } catch {
      created = {
        _id: `prod-${Date.now()}`,
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        status: Number(newProduct.stock) > 0 ? 'listed' : 'out_of_stock',
        imageUrl: newProduct.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=300',
        authenticityRating: 100.0,
        verifiedCount: 0,
        description: newProduct.description || 'No description provided.',
      };
    }

    setProducts(prev => [created, ...prev]);
    setShowAddProductModal(false);
    addToast(`Product "${created.name}" registered in catalog.`, 'success');

    // Reset Form
    setNewProduct({
      name: '',
      category: 'Luxury Goods',
      sku: '',
      price: 0,
      stock: 10,
      imageUrl: '',
      description: '',
    });
  };

  // 3. Inventory: Update Status
  const handleUpdateItemStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await client.patch(`/items/${selectedItem._id}/status`, {
        status: statusVal,
        location: statusLocation || 'Seller Warehouse',
      }).catch(() => {});
    } catch {
      // Continue
    }

    const timestamp = new Date().toISOString();
    const updatedHistory: LocationHistory = {
      date: timestamp,
      status: statusVal,
      location: statusLocation || 'Seller Warehouse',
      description: statusDesc || `Status updated to ${statusVal.replace('_', ' ')}.`
    };

    setInventory(prev => prev.map(item => {
      if (item._id === selectedItem._id) {
        return {
          ...item,
          status: statusVal as InventoryItem['status'],
          location: statusLocation || item.location,
          locationHistory: [...item.locationHistory, updatedHistory]
        };
      }
      return item;
    }));

    setShowStatusModal(false);
    addToast(`Item ${selectedItem.serialNumber} status updated to ${statusVal.replace('_', ' ')}.`, 'success');
    setSelectedItem(null);
  };

  // 4. Inventory: Transfer Ownership
  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !transferToUserId) return;

    try {
      await client.post(`/items/${selectedItem._id}/transfer`, {
        toUserId: transferToUserId,
        location: transferLocation || 'Buyer Possession',
      }).catch(() => {});
    } catch {
      // Continue
    }

    const timestamp = new Date().toISOString();
    const updatedHistory: LocationHistory = {
      date: timestamp,
      status: 'sold',
      location: transferLocation || 'Buyer Possession',
      description: `Ownership transferred to Account ID: ${transferToUserId}.`
    };

    setInventory(prev => prev.map(item => {
      if (item._id === selectedItem._id) {
        return {
          ...item,
          status: 'sold',
          location: transferLocation || 'Buyer Destination',
          locationHistory: [...item.locationHistory, updatedHistory]
        };
      }
      return item;
    }));

    setShowTransferModal(false);
    addToast(`Ownership of ${selectedItem.serialNumber} transferred.`, 'success');
    setSelectedItem(null);
  };

  // 5. Orders: Fulfill & Add Tracking
  const handleFulfillOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setOrders(prev => prev.map(order => {
      if (order._id === selectedOrder._id) {
        return {
          ...order,
          status: orderStatusVal,
          trackingNumber: trackingNum || 'VC-TRK-' + Math.floor(Math.random()*1000000),
          shippingCarrier: carrier
        };
      }
      return order;
    }));

    setShowFulfillModal(false);
    addToast(`Order ${selectedOrder.orderNumber} updated to ${orderStatusVal}.`, 'success');
    setSelectedOrder(null);
  };

  if (loading) {
    return <PageLoader />;
  }

  // ============================================================
  // Filters & Calculations
  // ============================================================
  const filteredListings = marketplaceListings.filter(item => {
    const matchesSearch =
      item.serialNumber.toLowerCase().includes(listingSearch.toLowerCase()) ||
      (item.product?.name || '').toLowerCase().includes(listingSearch.toLowerCase()) ||
      (item.product?.sku || '').toLowerCase().includes(listingSearch.toLowerCase());
    const matchesCat = listingCategory === '' || item.product?.category === listingCategory;
    return matchesSearch && matchesCat;
  });

  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch =
      inq.senderName.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.senderEmail.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.message.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      (inq.product?.name || '').toLowerCase().includes(inquirySearch.toLowerCase());
    const matchesStatus = inquiryFilter === '' || inq.status === inquiryFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategory === '' || p.category === productCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.serialNumber.toLowerCase().includes(inventorySearch.toLowerCase()) || item.productName.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesStatus = inventoryStatus === '' || item.status === inventoryStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) || o.buyerName.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatus === '' || o.status === orderStatus;
    return matchesSearch && matchesStatus;
  });

  // Analytics Metrics
  const activeListingsCount = marketplaceListings.length || products.filter(p => p.status === 'listed').length;
  const totalMarketplaceValue = marketplaceListings.reduce((sum, item) => sum + (Number(item.product?.price) || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const pendingInquiriesCount = inquiries.filter(i => i.status === 'pending').length;
  const totalRevenue = orders.filter(o => o.status === 'delivered' || o.status === 'shipped').reduce((sum, o) => sum + o.total, 0);
  const averageAuthenticity = products.length > 0 ? (products.reduce((sum, p) => sum + p.authenticityRating, 0) / products.length) : 100;

  return (
    <div className="seller-dashboard-container">
      {/* Upper header summary */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1>Seller Control Center</h1>
          <p>List luxury products directly to the marketplace, manage active inventory, process orders, and handle buyer inquiries.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddMarketplaceModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
            }}
          >
            <Plus size={18} />
            <span>Add Product to Marketplace</span>
          </button>
        </div>
      </div>

      {user && !(user.verified || user.isVerified) && (
        <AlertBanner
          type="error"
          message={
            <span>
              <strong>Seller Verification Pending:</strong> Your store is pending administrator verification. 
              Certain marketplace operations may be restricted.
            </span>
          }
          style={{ marginBottom: 'var(--space-md)' }}
        />
      )}

      {/* Tabs navigation bar */}
      <div className="seller-tabs-nav">
        <button
          className={`seller-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleTabChange('analytics')}
        >
          <TrendingUp size={16} /> Analytics
        </button>
        <button
          className={`seller-tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => handleTabChange('listings')}
        >
          <Store size={16} /> Marketplace Listings
          {activeListingsCount > 0 && <span className="badge badge-info" style={{ marginLeft: 6 }}>{activeListingsCount}</span>}
        </button>
        <button
          className={`seller-tab-btn ${activeTab === 'inquiries' ? 'active' : ''}`}
          onClick={() => handleTabChange('inquiries')}
        >
          <MessageSquare size={16} /> Buyer Inquiries
          {pendingInquiriesCount > 0 && <span className="badge badge-warning" style={{ marginLeft: 6 }}>{pendingInquiriesCount}</span>}
        </button>
        <button
          className={`seller-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => handleTabChange('products')}
        >
          <Tag size={16} /> Products Catalog
        </button>
        <button
          className={`seller-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => handleTabChange('inventory')}
        >
          <Package size={16} /> Trackable Inventory
        </button>
        <button
          className={`seller-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => handleTabChange('orders')}
        >
          <ShoppingBag size={16} /> Orders
          {pendingOrdersCount > 0 && <span className="badge badge-warning" style={{ marginLeft: 6 }}>{pendingOrdersCount}</span>}
        </button>
        <button
          className={`seller-tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => handleTabChange('customers')}
        >
          <Users size={16} /> Customers CRM
        </button>
      </div>

      {/* ============================================================
          TAB 1: ANALYTICS
          ============================================================ */}
      {activeTab === 'analytics' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="analytics-grid">
            <MetricCard label="Gross Sales" value={`$${totalRevenue.toLocaleString()}`} icon={<DollarSign size={20} color="var(--accent-cyan)" />} />
            <MetricCard label="Marketplace Active Units" value={activeListingsCount} icon={<Store size={20} color="var(--color-info)" />} />
            <MetricCard label="Pending Inquiries" value={pendingInquiriesCount} icon={<MessageSquare size={20} color="var(--color-warning)" />} />
            <MetricCard label="Store Authenticity Index" value={`${averageAuthenticity.toFixed(1)}%`} icon={<ShieldCheck size={20} color="var(--accent-cyan)" />} />
          </div>

          <div className="analytics-main-row">
            {/* Catalog & Inventory Overview */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <h3 className="chart-title">Store Inventory & Verification Status</h3>
                  <span className="chart-subtitle">Real-time status of manufactured and listed inventory</span>
                </div>
              </div>
              <div style={{ padding: 'var(--space-md) 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.875rem' }}>
                  <span>Verified Trackable Units</span>
                  <strong>{inventory.length} units</strong>
                </div>
                <div className="progress-bar-wrap" style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 9999, overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ width: '100%', height: '100%', background: 'var(--accent-cyan)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.875rem' }}>
                  <span>Marketplace Listed Units</span>
                  <strong>{activeListingsCount} units (${totalMarketplaceValue.toLocaleString()})</strong>
                </div>
                <div className="progress-bar-wrap" style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: '#10b981' }} />
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="chart-header">
                <div>
                  <h3 className="chart-title">Category Share</h3>
                  <span className="chart-subtitle">Store product classification</span>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                {products.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>
                    No products added to catalog yet.
                  </p>
                ) : (
                  <div className="donut-legend" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Array.from(new Set(products.map(p => p.category || 'General'))).map((cat, idx) => {
                      const count = products.filter(p => (p.category || 'General') === cat).length;
                      const pct = Math.round((count / products.length) * 100);
                      const colors = ['var(--accent-cyan)', 'var(--color-info)', '#f59e0b', '#10b981', '#8b5cf6'];
                      const color = colors[idx % colors.length];
                      return (
                        <div key={cat} className="legend-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span><span className="legend-color-dot" style={{ backgroundColor: color }} />{cat}</span>
                          <strong>{pct}% ({count})</strong>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Blockchain check log */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Live Marketplace Inventory Stream</h3>
              <span className="badge badge-success">Live Blockchain Records</span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Serial Number</th>
                    <th>Product</th>
                    <th>Current Custody Location</th>
                    <th>Ledger Status</th>
                    <th>Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        No trackable inventory items registered yet.
                      </td>
                    </tr>
                  ) : (
                    inventory.slice(0, 5).map((it) => (
                      <tr key={it._id}>
                        <td><code style={{ color: 'var(--accent-cyan)' }}>{it.serialNumber}</code></td>
                        <td>{it.productName}</td>
                        <td>{it.location}</td>
                        <td><span className="badge badge-success">✓ Authentic</span></td>
                        <td>{new Date(it.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: MARKETPLACE LISTINGS (NEW DEDICATED MANAGEMENT)
          ============================================================ */}
      {activeTab === 'listings' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="seller-control-bar">
            <div className="search-filter-group">
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search listed products by name, SKU, or serial..."
                  className="form-input"
                  value={listingSearch}
                  onChange={e => setListingSearch(e.target.value)}
                />
              </div>
              <select
                className="form-select"
                style={{ width: '160px' }}
                value={listingCategory}
                onChange={e => setListingCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Luxury Goods">Luxury Goods</option>
                <option value="Watches">Watches</option>
                <option value="Apparel & Shoes">Apparel & Shoes</option>
                <option value="Cosmetics">Cosmetics</option>
                <option value="Jewelry">Jewelry</option>
              </select>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddMarketplaceModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Add Product to Marketplace
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Serial Code</th>
                  <th>Category</th>
                  <th>Listed Price</th>
                  <th>Status</th>
                  <th>Listed Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map(listing => (
                  <tr key={listing._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={listing.product?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=80'}
                          alt={listing.product?.name}
                          style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }}
                        />
                        <div>
                          <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                            {listing.product?.name || 'Listed Product'}
                          </strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{listing.product?.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code style={{ color: 'var(--accent-cyan)', fontSize: '12px' }}>{listing.serialNumber}</code>
                    </td>
                    <td>{listing.product?.category || 'Luxury Goods'}</td>
                    <td>
                      <strong style={{ color: '#10b981', fontSize: '14px' }}>
                        ${(Number(listing.product?.price) || 100).toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      <span className="badge badge-success">✓ Active Listed</span>
                    </td>
                    <td>{new Date(listing.createdAt || listing.updatedAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <Link
                          to={`/product/${listing._id}`}
                          className="btn btn-sm btn-secondary"
                          title="View on Public Marketplace"
                        >
                          <Eye size={12} /> View
                        </Link>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            setSelectedListing(listing);
                            setEditListingForm({
                              price: Number(listing.product?.price) || 100,
                              location: 'Seller Warehouse',
                              status: 'listed',
                              notes: '',
                            });
                            setShowEditListingModal(true);
                          }}
                          title="Edit Listing Price & Location"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          style={{ color: '#ef4444' }}
                          onClick={() => handleDelistItem(listing)}
                          title="Delist from Marketplace"
                        >
                          <Trash2 size={12} /> Delist
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredListings.length === 0 && (
              <div className="empty-state glass-card" style={{ padding: 'var(--space-3xl)' }}>
                <Store size={48} />
                <h3>No Marketplace Listings Found</h3>
                <p>You haven't listed any products to the public marketplace matching this query.</p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 'var(--space-md)' }}
                  onClick={() => setShowAddMarketplaceModal(true)}
                >
                  <Plus size={16} /> Add Product to the Marketplace
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 3: BUYER INQUIRIES & MESSAGES (NEW DEDICATED VIEW)
          ============================================================ */}
      {activeTab === 'inquiries' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="seller-control-bar">
            <div className="search-filter-group">
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search inquiries by buyer name, email, or question..."
                  className="form-input"
                  value={inquirySearch}
                  onChange={e => setInquirySearch(e.target.value)}
                />
              </div>
              <select
                className="form-select"
                style={{ width: '160px' }}
                value={inquiryFilter}
                onChange={e => setInquiryFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending Reply</option>
                <option value="replied">Replied</option>
              </select>
            </div>
          </div>

          <div className="inquiries-list-container">
            {filteredInquiries.map(inq => (
              <div key={inq._id} className="inquiry-card glass-card">
                <div className="inquiry-header-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="customer-mini-avatar">
                      {inq.senderName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{inq.senderName}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{inq.senderEmail}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="inquiry-product-tag">
                      <Tag size={12} /> {inq.product?.name || inq.item?.serialNumber || 'Product Question'}
                    </span>
                    <span className={`badge ${inq.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>
                      {inq.status === 'pending' ? 'Pending Response' : 'Replied'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>Topic: <strong style={{ color: 'var(--text-primary)' }}>{inq.inquiryType.replace('_', ' ').toUpperCase()}</strong></span>
                  {inq.proposedPrice && (
                    <span>• Proposed Price Offer: <strong style={{ color: '#10b981' }}>${inq.proposedPrice.toLocaleString()}</strong></span>
                  )}
                  <span>• {new Date(inq.createdAt).toLocaleDateString()} {new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="inquiry-message-bubble">
                  "{inq.message}"
                </div>

                {inq.sellerReply && (
                  <div className="inquiry-reply-box">
                    <strong style={{ color: '#10b981', display: 'block', fontSize: '12px', marginBottom: 2 }}>
                      ✓ Your Reply ({inq.repliedAt ? new Date(inq.repliedAt).toLocaleDateString() : 'Sent'}):
                    </strong>
                    {inq.sellerReply}
                  </div>
                )}

                <div className="inquiry-footer-row">
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {inq.senderPhone && <span>Phone: {inq.senderPhone}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={`mailto:${inq.senderEmail}?subject=${encodeURIComponent(`Re: Inquiry regarding ${inq.product?.name || 'product'}`)}`}
                      className="btn btn-sm btn-secondary"
                    >
                      <Mail size={12} /> Email Buyer
                    </a>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setSelectedInquiry(inq);
                        setInquiryReplyText(inq.sellerReply || '');
                        setShowReplyInquiryModal(true);
                      }}
                    >
                      <MessageSquare size={12} /> {inq.sellerReply ? 'Edit Reply' : 'Reply Directly'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredInquiries.length === 0 && (
              <div className="empty-state glass-card" style={{ padding: 'var(--space-3xl)' }}>
                <MessageSquare size={48} />
                <h3>No Inquiries Found</h3>
                <p>No customer messages or buyer product inquiries currently match your filter.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 4: PRODUCTS CATALOG
          ============================================================ */}
      {activeTab === 'products' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="seller-control-bar">
            <div className="search-filter-group">
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search catalog by name or SKU..."
                  className="form-input"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                />
              </div>
              <select
                className="form-select"
                style={{ width: '160px' }}
                value={productCategory}
                onChange={e => setProductCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Luxury Goods">Luxury Goods</option>
                <option value="Watches">Watches</option>
                <option value="Apparel & Shoes">Apparel & Shoes</option>
                <option value="Cosmetics">Cosmetics</option>
                <option value="Jewelry">Jewelry</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setShowAddProductModal(true)}>
                <Plus size={16} /> Register Catalog SKU
              </button>
              <button className="btn btn-primary" onClick={() => setShowAddMarketplaceModal(true)}>
                <Store size={16} /> List on Marketplace
              </button>
            </div>
          </div>

          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product._id} className="seller-product-card">
                <div className="product-image-container">
                  <img src={product.imageUrl} alt={product.name} />
                  <div className="product-authenticity-badge">
                    <ShieldCheck size={13} color="var(--accent-cyan)" />
                    {product.authenticityRating}% Trust
                  </div>
                </div>
                <div className="product-details-body">
                  <span className="product-category-label">{product.category}</span>
                  <h3 className="product-title-text">{product.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="product-sku-code">{product.sku}</span>
                    <span className={`badge ${product.status === 'listed' ? 'badge-success' : product.status === 'out_of_stock' ? 'badge-danger' : 'badge-warning'}`}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="product-stats-row">
                    <span>Stock: <strong>{product.stock} units</strong></span>
                    <span>Verified: <strong>{product.verifiedCount} units</strong></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-sm)' }}>
                    <span className="product-price-tag">${product.price.toLocaleString()}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setMarketplaceForm({
                            ...marketplaceForm,
                            mode: 'catalog',
                            selectedCatalogId: product._id,
                            name: product.name,
                            sku: product.sku,
                            category: product.category,
                            price: product.price,
                            imageUrl: product.imageUrl,
                            description: product.description,
                          });
                          setShowAddMarketplaceModal(true);
                        }}
                      >
                        List for Sale
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => setSelectedProduct(product)}>
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-state glass-card" style={{ padding: 'var(--space-3xl)' }}>
              <Package size={48} />
              <h3>No Products Found</h3>
              <p>Try resetting filters or registering a new item onto the catalog.</p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          TAB 5: TRACKABLE INVENTORY
          ============================================================ */}
      {activeTab === 'inventory' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="seller-control-bar">
            <div className="search-filter-group">
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search serial number or product name..."
                  className="form-input"
                  value={inventorySearch}
                  onChange={e => setInventorySearch(e.target.value)}
                />
              </div>
              <select
                className="form-select"
                style={{ width: '160px' }}
                value={inventoryStatus}
                onChange={e => setInventoryStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="manufactured">Manufactured</option>
                <option value="in_transit">In Transit</option>
                <option value="listed">Listed</option>
                <option value="sold">Sold</option>
                <option value="recalled">Recalled</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddMarketplaceModal(true)}>
              <Store size={16} /> Add Product to Marketplace
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Current Location</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => (
                  <tr key={item._id}>
                    <td>
                      <button
                        style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-cyan)', fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => setSelectedItem(item)}
                      >
                        {item.serialNumber}
                      </button>
                    </td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.productName}</td>
                    <td>{item.category}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <MapPin size={12} color="var(--text-muted)" /> {item.location}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${itemStatusBadge(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      {item.status !== 'recalled' && item.status !== 'sold' && (
                        <div style={{ display: 'inline-flex', gap: 'var(--space-xs)' }}>
                          {item.status !== 'listed' && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleQuickListInventoryItem(item)}
                              title="List this unit directly to the verified marketplace"
                            >
                              <Store size={12} /> List
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              setSelectedItem(item);
                              setStatusVal(item.status);
                              setStatusLocation(item.location);
                              setStatusDesc('');
                              setShowStatusModal(true);
                            }}
                          >
                            <Settings size={12} /> Status
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              setSelectedItem(item);
                              setTransferToUserId('');
                              setTransferLocation('');
                              setShowTransferModal(true);
                            }}
                          >
                            <Share2 size={12} /> Transfer
                          </button>
                        </div>
                      )}
                      {(item.status === 'recalled' || item.status === 'sold') && (
                        <button className="btn btn-sm btn-secondary" onClick={() => setSelectedItem(item)}>
                          <Info size={12} /> View Journey
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredInventory.length === 0 && (
              <div className="empty-state glass-card" style={{ padding: 'var(--space-3xl)' }}>
                <Package size={48} />
                <h3>No Inventory Items Found</h3>
                <p>Verify your search query or check with production lines.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 6: ORDERS
          ============================================================ */}
      {activeTab === 'orders' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="seller-control-bar">
            <div className="search-filter-group">
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search orders by Order Number or Customer..."
                  className="form-input"
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                />
              </div>
              <select
                className="form-select"
                style={{ width: '160px' }}
                value={orderStatus}
                onChange={e => setOrderStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="order-cards-grid">
            {filteredOrders.map(order => (
              <div key={order._id} className="order-row-card">
                <div>
                  <span className="order-id-badge">{order.orderNumber}</span>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>
                    <Calendar size={10} style={{ marginRight: 4, display: 'inline' }} />
                    {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div>
                  <span className="order-buyer-name">{order.buyerName}</span>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{order.buyerEmail}</div>
                </div>

                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </span>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                    {order.items.map(i => i.name).join(', ')}
                  </div>
                </div>

                <div>
                  <span style={{ fontWeight: 800 }}>${order.total.toLocaleString()}</span>
                </div>

                <div>
                  <span className={`status-pill ${order.status}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-actions-cell" style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => setSelectedOrder(order)}>
                    Details
                  </button>

                  {(order.status === 'pending' || order.status === 'processing') && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setSelectedOrder(order);
                        setOrderStatusVal('shipped');
                        setTrackingNum('');
                        setShowFulfillModal(true);
                      }}
                    >
                      Ship Order
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="empty-state glass-card" style={{ padding: 'var(--space-3xl)' }}>
                <ShoppingBag size={48} />
                <h3>No Orders Found</h3>
                <p>No transactions fit the search criteria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 7: CUSTOMERS CRM
          ============================================================ */}
      {activeTab === 'customers' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="customers-table-container table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Registered</th>
                  <th>Purchases</th>
                  <th>Total Spent</th>
                  <th>Blockchain Scans</th>
                  <th>Trust Score</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer._id}>
                    <td className="customer-avatar-cell">
                      <div className="customer-mini-avatar">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>{customer.name}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{customer.email}</div>
                      </div>
                    </td>
                    <td>{new Date(customer.registrationDate).toLocaleDateString()}</td>
                    <td>{customer.purchasesCount} orders</td>
                    <td style={{ fontWeight: 700 }}>${customer.totalSpent.toLocaleString()}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <ShieldCheck size={13} color="var(--accent-cyan)" /> {customer.verificationChecks} times
                      </span>
                    </td>
                    <td>
                      <div className="customer-trust-indicator">
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{customer.trustLevel}%</span>
                        <div className="trust-level-meter">
                          <div
                            className="trust-level-fill"
                            style={{
                              width: `${customer.trustLevel}%`,
                              backgroundColor: customer.trustLevel >= 99 ? 'var(--accent-cyan)' : 'var(--color-warning)'
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => addToast(`Customer contact simulation initiated for ${customer.name}`, 'info')}>
                        Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          MODALS & OVERLAYS
          ============================================================ */}

      {/* MODAL 1: ADD PRODUCT TO MARKETPLACE (COMPREHENSIVE SELLER LISTING) */}
      <Modal
        open={showAddMarketplaceModal}
        onClose={() => setShowAddMarketplaceModal(false)}
        title="Add Product to the Verified Marketplace"
        maxWidth="680px"
      >
        <form onSubmit={handleListProductToMarketplace} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {/* Sourcing / Catalog Selection Mode */}
          {products.length > 0 && (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
              <label className="form-label" style={{ marginBottom: '6px' }}>List from Registered Catalog SKU?</label>
              <select
                className="form-select"
                value={marketplaceForm.selectedCatalogId}
                onChange={(e) => {
                  const selected = products.find(p => p._id === e.target.value);
                  if (selected) {
                    setMarketplaceForm({
                      ...marketplaceForm,
                      mode: 'catalog',
                      selectedCatalogId: selected._id,
                      name: selected.name,
                      sku: selected.sku,
                      category: selected.category,
                      price: selected.price,
                      imageUrl: selected.imageUrl,
                      description: selected.description,
                    });
                  } else {
                    setMarketplaceForm({
                      ...marketplaceForm,
                      mode: 'new',
                      selectedCatalogId: '',
                    });
                  }
                }}
              >
                <option value="">-- Create & List Custom New Product --</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.sku}) - Standard Price: ${p.price}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="mkt-name">Product Name *</label>
            <input
              id="mkt-name"
              type="text"
              className="form-input"
              placeholder="e.g. Submariner Date Luxury Timepiece"
              value={marketplaceForm.name}
              onChange={e => setMarketplaceForm({ ...marketplaceForm, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="mkt-sku">SKU Code / Model ID *</label>
              <input
                id="mkt-sku"
                type="text"
                className="form-input"
                placeholder="e.g. RX-SUB-126610"
                value={marketplaceForm.sku}
                onChange={e => setMarketplaceForm({ ...marketplaceForm, sku: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mkt-cat">Product Category</label>
              <select
                id="mkt-cat"
                className="form-select"
                value={marketplaceForm.category}
                onChange={e => setMarketplaceForm({ ...marketplaceForm, category: e.target.value })}
              >
                <option value="Luxury Goods">Luxury Goods</option>
                <option value="Watches">Watches</option>
                <option value="Apparel & Shoes">Apparel & Shoes</option>
                <option value="Cosmetics">Cosmetics</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Consumer Tech">Consumer Tech</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="mkt-price">Selling Price ($ USD) *</label>
              <input
                id="mkt-price"
                type="number"
                className="form-input"
                placeholder="e.g. 850"
                value={marketplaceForm.price || ''}
                onChange={e => setMarketplaceForm({ ...marketplaceForm, price: Math.max(1, Number(e.target.value)) })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mkt-stock">Units to List (Stock) *</label>
              <input
                id="mkt-stock"
                type="number"
                className="form-input"
                placeholder="e.g. 5"
                value={marketplaceForm.stock || ''}
                onChange={e => setMarketplaceForm({ ...marketplaceForm, stock: Math.max(1, Math.min(50, Number(e.target.value))) })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mkt-cond">Condition</label>
              <select
                id="mkt-cond"
                className="form-select"
                value={marketplaceForm.condition}
                onChange={e => setMarketplaceForm({ ...marketplaceForm, condition: e.target.value })}
              >
                <option value="Brand New (Sealed)">Brand New (Sealed)</option>
                <option value="Certified Pre-Owned (Grade A)">Certified Pre-Owned</option>
                <option value="Factory Refurbished">Factory Refurbished</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mkt-img">Product Image URL</label>
            <input
              id="mkt-img"
              type="url"
              className="form-input"
              placeholder="https://..."
              value={marketplaceForm.imageUrl}
              onChange={e => setMarketplaceForm({ ...marketplaceForm, imageUrl: e.target.value })}
            />
            {/* Quick preset pickers */}
            <div className="preset-images-picker">
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quick Presets:</span>
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="preset-img-btn"
                  onClick={() => setMarketplaceForm({ ...marketplaceForm, imageUrl: preset.url })}
                >
                  <Sparkles size={11} /> {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mkt-desc">Product Description & Highlights</label>
            <textarea
              id="mkt-desc"
              rows={2}
              className="form-input"
              placeholder="Provide authenticity details, batch provenance, or warranty notes..."
              value={marketplaceForm.description}
              onChange={e => setMarketplaceForm({ ...marketplaceForm, description: e.target.value })}
            />
          </div>

          {/* Direct Seller Contact Settings */}
          <div style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '12px 16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '13px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={14} /> Direct Buyer Communication & Inquiries
              </strong>
              <span className="badge badge-success">Enabled</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Seller Contact Email:</label>
                <input
                  type="email"
                  className="form-input"
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                  value={marketplaceForm.contactEmail}
                  onChange={e => setMarketplaceForm({ ...marketplaceForm, contactEmail: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Direct WhatsApp / Phone:</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                  value={marketplaceForm.contactPhone}
                  onChange={e => setMarketplaceForm({ ...marketplaceForm, contactPhone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <span>Guaranteed Response Time: <strong>{marketplaceForm.responseTime}</strong></span>
              <span>Shipping Policy: <strong>{marketplaceForm.shippingPolicy}</strong></span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddMarketplaceModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Store size={16} /> Publish to Marketplace
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT LISTING */}
      <Modal
        open={showEditListingModal && !!selectedListing}
        onClose={() => { setShowEditListingModal(false); setSelectedListing(null); }}
        title="Edit Marketplace Listing"
      >
        {selectedListing && (
          <form onSubmit={handleUpdateListing} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
              <strong>{selectedListing.product?.name}</strong><br />
              <code style={{ color: 'var(--accent-cyan)', fontSize: '12px' }}>{selectedListing.serialNumber}</code>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-price">Listing Price ($ USD) *</label>
              <input
                id="edit-price"
                type="number"
                className="form-input"
                value={editListingForm.price || ''}
                onChange={e => setEditListingForm({ ...editListingForm, price: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-loc">Fulfillment Location</label>
              <input
                id="edit-loc"
                type="text"
                className="form-input"
                value={editListingForm.location}
                onChange={e => setEditListingForm({ ...editListingForm, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-st">Listing Status</label>
              <select
                id="edit-st"
                className="form-select"
                value={editListingForm.status}
                onChange={e => setEditListingForm({ ...editListingForm, status: e.target.value })}
              >
                <option value="listed">Listed (Active on Marketplace)</option>
                <option value="manufactured">Unlisted (In Warehouse / Paused)</option>
              </select>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowEditListingModal(false); setSelectedListing(null); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Listing Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 3: REPLY TO BUYER INQUIRY */}
      <Modal
        open={showReplyInquiryModal && !!selectedInquiry}
        onClose={() => { setShowReplyInquiryModal(false); setSelectedInquiry(null); }}
        title="Reply to Buyer Inquiry"
      >
        {selectedInquiry && (
          <form onSubmit={handleReplyInquiry} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <strong>{selectedInquiry.senderName}</strong>
                <span className="badge badge-info">{selectedInquiry.inquiryType.replace('_', ' ')}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 8 }}>{selectedInquiry.senderEmail}</div>
              <div className="inquiry-message-bubble" style={{ margin: 0 }}>
                "{selectedInquiry.message}"
              </div>
              {selectedInquiry.proposedPrice && (
                <div style={{ marginTop: 8, fontSize: '12px', color: '#10b981' }}>
                  Proposed Price Offer: <strong>${selectedInquiry.proposedPrice}</strong>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="inq-reply-text">Your Direct Reply *</label>
              <textarea
                id="inq-reply-text"
                rows={4}
                className="form-input"
                placeholder="Write your response to the customer..."
                value={inquiryReplyText}
                onChange={e => setInquiryReplyText(e.target.value)}
                required
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowReplyInquiryModal(false); setSelectedInquiry(null); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Send size={14} /> Send Reply to Buyer
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 4: REGISTER PRODUCT TO STORE CATALOG */}
      <Modal open={showAddProductModal} onClose={() => setShowAddProductModal(false)} title="Register Product to Store Catalog">
        <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="prod-name">Product Name *</label>
            <input
              id="prod-name"
              type="text"
              className="form-input"
              placeholder="e.g. Luminescent Serum"
              value={newProduct.name}
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-sku">SKU Code *</label>
              <input
                id="prod-sku"
                type="text"
                className="form-input"
                placeholder="e.g. LM-SR-5510"
                value={newProduct.sku}
                onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-cat">Category</label>
              <select
                id="prod-cat"
                className="form-select"
                value={newProduct.category}
                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
              >
                <option value="Luxury Goods">Luxury Goods</option>
                <option value="Watches">Watches</option>
                <option value="Apparel & Shoes">Apparel & Shoes</option>
                <option value="Cosmetics">Cosmetics</option>
                <option value="Jewelry">Jewelry</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-price">Retail Price ($) *</label>
              <input
                id="prod-price"
                type="number"
                className="form-input"
                placeholder="e.g. 299"
                value={newProduct.price || ''}
                onChange={e => setNewProduct({ ...newProduct, price: Math.max(0, Number(e.target.value)) })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-stock">Initial Stock Quantity</label>
              <input
                id="prod-stock"
                type="number"
                className="form-input"
                placeholder="e.g. 10"
                value={newProduct.stock}
                onChange={e => setNewProduct({ ...newProduct, stock: Math.max(0, Number(e.target.value)) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prod-img">Image URL</label>
            <input
              id="prod-img"
              type="url"
              className="form-input"
              placeholder="Leave blank for placeholder image"
              value={newProduct.imageUrl}
              onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prod-desc">Product Description</label>
            <textarea
              id="prod-desc"
              rows={3}
              className="form-input"
              placeholder="Provide key details for buyer information"
              value={newProduct.description}
              onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddProductModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Catalog Item
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: INVENTORY CHANGE STATUS */}
      <Modal open={showStatusModal && !!selectedItem} onClose={() => { setShowStatusModal(false); setSelectedItem(null); }} title="Update Item Blockchain Status">
        {selectedItem && (
          <form onSubmit={handleUpdateItemStatus} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'rgba(193, 198, 215, 0.08)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
              Item: <strong>{selectedItem.productName}</strong><br />
              Serial: <code style={{ color: 'var(--accent-cyan)' }}>{selectedItem.serialNumber}</code>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="inv-status">Select New Status</label>
              <select
                id="inv-status"
                className="form-select"
                value={statusVal}
                onChange={e => setStatusVal(e.target.value)}
                required
              >
                <option value="manufactured">Manufactured (In warehouse/facility)</option>
                <option value="in_transit">In Transit (Logistics/shipping stage)</option>
                <option value="listed">Listed (For sale on public marketplace)</option>
                <option value="recalled">Recalled (Revoked from circulation)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="inv-loc">Current Location</label>
              <input
                id="inv-loc"
                type="text"
                className="form-input"
                placeholder="e.g. Distribution Center, NY"
                value={statusLocation}
                onChange={e => setStatusLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="inv-desc">Tracking Description / Notes</label>
              <input
                id="inv-desc"
                type="text"
                className="form-input"
                placeholder="e.g. Cleared customs, checked by seller"
                value={statusDesc}
                onChange={e => setStatusDesc(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowStatusModal(false); setSelectedItem(null); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update Ledger Record
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 6: TRANSFER OWNERSHIP */}
      <Modal open={showTransferModal && !!selectedItem} onClose={() => { setShowTransferModal(false); setSelectedItem(null); }} title="Transfer Item Blockchain Ownership">
        {selectedItem && (
          <form onSubmit={handleTransferOwnership} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'rgba(193, 198, 215, 0.08)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
              Item: <strong>{selectedItem.productName}</strong><br />
              Serial: <code style={{ color: 'var(--accent-cyan)' }}>{selectedItem.serialNumber}</code>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tr-user">Recipient Wallet / System Account ID *</label>
              <input
                id="tr-user"
                type="text"
                className="form-input"
                placeholder="Enter buyer email or Account ID"
                value={transferToUserId}
                onChange={e => setTransferToUserId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tr-loc">Handover Location</label>
              <input
                id="tr-loc"
                type="text"
                className="form-input"
                placeholder="e.g. Retail Counter Manhattan"
                value={transferLocation}
                onChange={e => setTransferLocation(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowTransferModal(false); setSelectedItem(null); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={!transferToUserId}>
                Confirm Ownership Transfer
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 7: FULFILL ORDER */}
      <Modal open={showFulfillModal && !!selectedOrder} onClose={() => { setShowFulfillModal(false); setSelectedOrder(null); }} title="Fulfill & Ship Order">
        {selectedOrder && (
          <form onSubmit={handleFulfillOrder} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'rgba(193, 198, 215, 0.08)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
              Order: <strong>{selectedOrder.orderNumber}</strong><br />
              Customer: <span>{selectedOrder.buyerName}</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ord-st-select">Action</label>
              <select
                id="ord-st-select"
                className="form-select"
                value={orderStatusVal}
                onChange={e => setOrderStatusVal(e.target.value as any)}
              >
                <option value="shipped">Mark Shipped (Shipment Dispatched)</option>
                <option value="delivered">Mark Delivered (In-person Handover / Completed)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ord-carrier">Carrier</label>
                <select
                  id="ord-carrier"
                  className="form-select"
                  value={carrier}
                  onChange={e => setCarrier(e.target.value)}
                >
                  <option value="FedEx">FedEx</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="UPS">UPS</option>
                  <option value="USPS">USPS</option>
                  <option value="Local Courier">Local Delivery</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ord-trk">Tracking Code</label>
                <input
                  id="ord-trk"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 1Z999AA10123..."
                  value={trackingNum}
                  onChange={e => setTrackingNum(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowFulfillModal(false); setSelectedOrder(null); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Fulfill Order
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ============================================================
          SLIDEOUT DETAILS DRAWER / SIDE OVERLAYS
          ============================================================ */}

      {/* DRAWER 1: INVENTORY ITEM DETAILS & LIFECYCLE JOURNEY */}
      {selectedItem && !showStatusModal && !showTransferModal && (
        <div className="details-drawer-overlay" onClick={() => setSelectedItem(null)}>
          <div className="details-drawer-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Item Lifecycle</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedItem(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'rgba(193, 198, 215, 0.08)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Serial Number</div>
              <code style={{ fontSize: '15px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{selectedItem.serialNumber}</code>

              <div style={{ marginTop: 'var(--space-sm)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Product Model:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedItem.productName}</div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Blockchain Provenance Record</h3>
              <div className="item-history-timeline">
                {selectedItem.locationHistory.map((step, idx) => (
                  <div key={idx} className="timeline-step completed">
                    <div className="timeline-step-dot" />
                    <div className="timeline-step-header">
                      <span>{step.status.replace('_', ' ').toUpperCase()}</span>
                      <span className="timeline-step-time">
                        {new Date(step.date).toLocaleDateString()} {new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={10} /> {step.location}
                    </div>
                    <div className="timeline-step-desc">{step.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {selectedItem.status !== 'recalled' && selectedItem.status !== 'sold' && (
              <div style={{ marginTop: 'auto', display: 'flex', gap: 'var(--space-sm)' }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setStatusVal(selectedItem.status);
                    setStatusLocation(selectedItem.location);
                    setStatusDesc('');
                    setShowStatusModal(true);
                  }}
                >
                  Update Status
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setTransferToUserId('');
                    setTransferLocation('');
                    setShowTransferModal(true);
                  }}
                >
                  Transfer ownership
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DRAWER 2: ORDER DETAILS & PACKING SLIP */}
      {selectedOrder && !showFulfillModal && (
        <div className="details-drawer-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="details-drawer-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Order Details</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="order-id-badge">{selectedOrder.orderNumber}</span>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>
                  Ordered on {new Date(selectedOrder.date).toLocaleDateString()}
                </div>
              </div>
              <span className={`status-pill ${selectedOrder.status}`}>{selectedOrder.status}</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 'var(--space-md)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>Customer Information</h3>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>{selectedOrder.buyerName}</strong><br />
                {selectedOrder.buyerEmail}
              </div>
            </div>

            {selectedOrder.trackingNumber && (
              <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ fontSize: '12px', display: 'block', color: 'var(--text-secondary)' }}>Logistics Details:</strong>
                <span style={{ fontSize: '13px' }}>Carrier: <strong>{selectedOrder.shippingCarrier}</strong></span><br />
                <span style={{ fontSize: '13px' }}>Tracking Code: <strong style={{ color: 'var(--accent-cyan)' }}>{selectedOrder.trackingNumber}</strong></span>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 'var(--space-md)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Purchased Items</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {selectedOrder.items.map((i, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px dashed var(--border-default)', paddingBottom: 'var(--space-xs)' }}>
                    <div>
                      <strong>{i.name}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SKU: {i.sku}</div>
                      <div style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>Serial Tag: <code>{i.serialNumber}</code></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>{i.qty} x ${i.price}</div>
                      <strong style={{ color: 'var(--text-primary)' }}>${i.qty * i.price}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, marginTop: 'var(--space-md)' }}>
              <span>Total Price</span>
              <span>${selectedOrder.total.toLocaleString()}</span>
            </div>

            {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
              <div style={{ marginTop: 'auto' }}>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setOrderStatusVal('shipped');
                    setTrackingNum('');
                    setShowFulfillModal(true);
                  }}
                >
                  Ship & Generate Blockchain Tags
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DRAWER 3: PRODUCT CATALOG DETAILS */}
      {selectedProduct && (
        <div className="details-drawer-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="details-drawer-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Product Profile</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedProduct(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="product-image-container" style={{ borderRadius: 'var(--radius-md)' }}>
              <img src={selectedProduct.imageUrl} alt={selectedProduct.name} />
            </div>

            <div>
              <span className="product-category-label">{selectedProduct.category}</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedProduct.name}</h3>
              <code style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{selectedProduct.sku}</code>
            </div>

            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>Description</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{selectedProduct.description}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', padding: 'var(--space-md) 0' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Standard Retail Price:</span>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>${selectedProduct.price.toLocaleString()}</div>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Warehouse Stock Level:</span>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{selectedProduct.stock} units</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="var(--accent-cyan)" />
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Platform Integrity Rating:</span>
                <strong style={{ fontSize: '14px' }}>{selectedProduct.authenticityRating}% Authentic ({selectedProduct.verifiedCount} verified units)</strong>
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => {
                  setMarketplaceForm({
                    ...marketplaceForm,
                    mode: 'catalog',
                    selectedCatalogId: selectedProduct._id,
                    name: selectedProduct.name,
                    sku: selectedProduct.sku,
                    category: selectedProduct.category,
                    price: selectedProduct.price,
                    imageUrl: selectedProduct.imageUrl,
                    description: selectedProduct.description,
                  });
                  setSelectedProduct(null);
                  setShowAddMarketplaceModal(true);
                }}
              >
                <Store size={14} /> List this Product on Marketplace
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%' }}
                onClick={() => {
                  setInventorySearch(selectedProduct.sku);
                  setInventoryStatus('');
                  handleTabChange('inventory');
                  setSelectedProduct(null);
                }}
              >
                View Trackable Units of SKU
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
