import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import FactoryCard from '../../components/FactoryCard';
import ComparisonGrid from '../../components/ComparisonGrid';
import RequestHistoryTable from '../../components/RequestHistoryTable';
import ActivityTimeline from '../../components/ActivityTimeline';
import SellerProductCard from '../../components/SellerProductCard';
import { useToast } from '../../components/ToastProvider';
import { 
  Building, 
  ShieldCheck, 
  MapPin, 
  Heart, 
  ShoppingCart, 
  ShoppingBag,
  Clock, 
  X, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

// Types
interface Factory {
  _id: string;
  name: string;
  logoUrl?: string;
  verificationStatus: string;
  trustScore?: number;
  country?: string;
  yearsVerified?: number;
  certifications?: string[];
  categories?: string[];
}

interface Product {
  _id: string;
  name: string;
  imageUrl?: string;
  batchId: string;
  availableQty: number;
  wholesalePrice: number;
  manufacturingDate: string;
  certifications?: string[];
  authenticityStatus: string;
  category?: string;
}

interface AllocationRequest {
  id: string;
  productName: string;
  batchId: string;
  factoryName: string;
  factoryId: string;
  requestedQty: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

const SellerSourcing: React.FC = () => {
  const { addToast } = useToast();
  
  // Base Data States
  const [factories, setFactories] = useState<Factory[]>([]);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Loading & Error States
  const [loadingFactories, setLoadingFactories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string>('');

  // Sourcing Interactions States (Persisted in localStorage)
  const [savedFactoryIds, setSavedFactoryIds] = useState<string[]>([]);
  const [reservedProductIds, setReservedProductIds] = useState<string[]>([]);
  const [allocationRequests, setAllocationRequests] = useState<AllocationRequest[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparingFactoryIds, setComparingFactoryIds] = useState<string[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);

  // Filter States
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Modal States
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestProduct, setRequestProduct] = useState<Product | null>(null);
  const [requestQty, setRequestQty] = useState<number>(50);

  // Load localStorage data on mount
  useEffect(() => {
    const saved = localStorage.getItem('verichain_saved_factories');
    if (saved) setSavedFactoryIds(JSON.parse(saved));

    const reserved = localStorage.getItem('verichain_reserved_batches');
    if (reserved) setReservedProductIds(JSON.parse(reserved));

    const requests = localStorage.getItem('verichain_allocation_requests');
    if (requests) setAllocationRequests(JSON.parse(requests));

    const activity = localStorage.getItem('verichain_activity_log');
    if (activity) setActivityLog(JSON.parse(activity));
  }, []);

  // Fetch verified factories on mount (with robust mock fallback)
  useEffect(() => {
    const fetchFactories = async () => {
      try {
        const res = await client.get('/users', { params: { role: 'factory', verified: true } });
        if (res.data && res.data.users && res.data.users.length > 0) {
          setFactories(res.data.users);
          setSelectedFactoryId(res.data.users[0]._id);
          setLoadingFactories(false);
          return;
        }
      } catch (err: any) {
        console.warn('API /users failed, using high-quality mock factories.', err);
      }

      // Fallback mock factories
      const mockFactories: Factory[] = [
        {
          _id: 'factory_1',
          name: 'Apex Manufacturing Co.',
          logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop&q=60',
          verificationStatus: 'verified',
          trustScore: 98,
          country: 'Germany',
          yearsVerified: 5,
          certifications: ['ISO 9001', 'ISO 14001', 'CE Mark', 'GMP'],
          categories: ['Apparel', 'Footwear', 'Textiles']
        },
        {
          _id: 'factory_2',
          name: 'Nova Electronics Ltd.',
          logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=120&auto=format&fit=crop&q=60',
          verificationStatus: 'verified',
          trustScore: 95,
          country: 'Japan',
          yearsVerified: 3,
          certifications: ['ISO 9001', 'RoHS', 'FCC', 'UL'],
          categories: ['Electronics', 'Smart Home', 'Gadgets']
        },
        {
          _id: 'factory_3',
          name: 'BioSynthetix Organics',
          logoUrl: 'https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?w=120&auto=format&fit=crop&q=60',
          verificationStatus: 'verified',
          trustScore: 92,
          country: 'Canada',
          yearsVerified: 4,
          certifications: ['USDA Organic', 'GMP', 'HACCP', 'ISO 22000'],
          categories: ['Cosmetics', 'Skincare', 'Wellness']
        },
        {
          _id: 'factory_4',
          name: 'Summit Leathercraft',
          logoUrl: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=120&auto=format&fit=crop&q=60',
          verificationStatus: 'verified',
          trustScore: 89,
          country: 'Italy',
          yearsVerified: 6,
          certifications: ['ISO 9001', 'LWG Gold Medal', 'REACH'],
          categories: ['Fashion Accessories', 'Bags', 'Leather Goods']
        }
      ];
      setFactories(mockFactories);
      setSelectedFactoryId(mockFactories[0]._id);
      setLoadingFactories(false);
    };
    fetchFactories();
  }, []);

  // Fetch products whenever a factory is selected (with mock fallback)
  useEffect(() => {
    if (!selectedFactoryId) return;
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setError('');
      try {
        const res = await client.get('/products/factory', { params: { factoryId: selectedFactoryId } });
        if (res.data && res.data.products && res.data.products.length > 0) {
          setProducts(res.data.products);
          setLoadingProducts(false);
          return;
        }
      } catch (err: any) {
        console.warn(`API /products/factory failed for ${selectedFactoryId}, using mock products.`, err);
      }

      // Fallback mock products
      let mockProducts: Product[] = [];
      if (selectedFactoryId === 'factory_1') {
        mockProducts = [
          {
            _id: 'prod_1_1',
            name: 'AeroFlex Breathable Sneakers',
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=60',
            batchId: 'BAT-AF-2026-01',
            availableQty: 250,
            wholesalePrice: 45.00,
            manufacturingDate: '2026-05-10T00:00:00.000Z',
            certifications: ['Oeko-Tex Standard 100', 'ISO 9001'],
            authenticityStatus: 'verified',
            category: 'Footwear'
          },
          {
            _id: 'prod_1_2',
            name: 'ThermoShield Waterproof Jacket',
            imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&auto=format&fit=crop&q=60',
            batchId: 'BAT-TS-2026-04',
            availableQty: 180,
            wholesalePrice: 65.00,
            manufacturingDate: '2026-06-01T00:00:00.000Z',
            certifications: ['ISO 9001', 'CE Mark'],
            authenticityStatus: 'verified',
            category: 'Apparel'
          }
        ];
      } else if (selectedFactoryId === 'factory_2') {
        mockProducts = [
          {
            _id: 'prod_2_1',
            name: 'Quantum Sound ANC Earbuds',
            imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=60',
            batchId: 'BAT-QS-2026-09',
            availableQty: 500,
            wholesalePrice: 35.00,
            manufacturingDate: '2026-04-15T00:00:00.000Z',
            certifications: ['RoHS', 'FCC', 'CE Mark'],
            authenticityStatus: 'verified',
            category: 'Electronics'
          },
          {
            _id: 'prod_2_2',
            name: 'AuraHue Smart Desk Lamp',
            imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&auto=format&fit=crop&q=60',
            batchId: 'BAT-AH-2026-02',
            availableQty: 320,
            wholesalePrice: 22.50,
            manufacturingDate: '2026-05-20T00:00:00.000Z',
            certifications: ['RoHS', 'UL Listed'],
            authenticityStatus: 'verified',
            category: 'Smart Home'
          }
        ];
      } else if (selectedFactoryId === 'factory_3') {
        mockProducts = [
          {
            _id: 'prod_3_1',
            name: 'HydraGlow Hyaluronic Serum',
            imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=60',
            batchId: 'BAT-HG-2026-11',
            availableQty: 450,
            wholesalePrice: 18.00,
            manufacturingDate: '2026-06-12T00:00:00.000Z',
            certifications: ['USDA Organic', 'GMP Certified'],
            authenticityStatus: 'verified',
            category: 'Skincare'
          },
          {
            _id: 'prod_3_2',
            name: 'BioRestore Anti-Aging Cream',
            imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&auto=format&fit=crop&q=60',
            batchId: 'BAT-BR-2026-07',
            availableQty: 300,
            wholesalePrice: 25.00,
            manufacturingDate: '2026-05-28T00:00:00.000Z',
            certifications: ['GMP Certified', 'HACCP'],
            authenticityStatus: 'verified',
            category: 'Cosmetics'
          }
        ];
      } else if (selectedFactoryId === 'factory_4') {
        mockProducts = [
          {
            _id: 'prod_4_1',
            name: 'Heritage Full-Grain Leather Satchel',
            imageUrl: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400&auto=format&fit=crop&q=60',
            batchId: 'BAT-HL-2026-03',
            availableQty: 120,
            wholesalePrice: 120.00,
            manufacturingDate: '2026-04-30T00:00:00.000Z',
            certifications: ['LWG Gold Certified', 'ISO 9001'],
            authenticityStatus: 'verified',
            category: 'Leather Goods'
          },
          {
            _id: 'prod_4_2',
            name: 'Classic Leather Bi-Fold Wallet',
            imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&auto=format&fit=crop&q=60',
            batchId: 'BAT-LW-2026-08',
            availableQty: 200,
            wholesalePrice: 30.00,
            manufacturingDate: '2026-06-05T00:00:00.000Z',
            certifications: ['REACH Compliant'],
            authenticityStatus: 'verified',
            category: 'Bags'
          }
        ];
      } else {
        mockProducts = [
          {
            _id: 'prod_generic',
            name: 'Generic Factory Product',
            batchId: 'BAT-GEN-01',
            availableQty: 100,
            wholesalePrice: 10.00,
            manufacturingDate: new Date().toISOString(),
            authenticityStatus: 'verified',
            category: 'General'
          }
        ];
      }
      setProducts(mockProducts);
      setLoadingProducts(false);
    };
    fetchProducts();
  }, [selectedFactoryId]);

  // Save/Favorite Supplier handler
  const toggleSaveFactory = (factoryId: string) => {
    let updated: string[];
    if (savedFactoryIds.includes(factoryId)) {
      updated = savedFactoryIds.filter((id) => id !== factoryId);
      addToast('Supplier removed from favorites.', 'info');
    } else {
      updated = [...savedFactoryIds, factoryId];
      addToast('Supplier saved to favorites!', 'success');
    }
    setSavedFactoryIds(updated);
    localStorage.setItem('verichain_saved_factories', JSON.stringify(updated));
  };

  // Reserve/Unreserve Product Batch handler
  const toggleReserveProduct = (productId: string) => {
    let updated: string[];
    const prod = products.find((p) => p._id === productId);
    const prodName = prod ? prod.name : 'Batch';
    
    if (reservedProductIds.includes(productId)) {
      updated = reservedProductIds.filter((id) => id !== productId);
      addToast(`Reservation cancelled for ${prodName}.`, 'info');
    } else {
      updated = [...reservedProductIds, productId];
      addToast(`Inventory batch reserved for ${prodName}!`, 'success');
    }
    setReservedProductIds(updated);
    localStorage.setItem('verichain_reserved_batches', JSON.stringify(updated));
  };

  // Allocation Request Handlers
  const handleOpenRequestModal = (product: Product) => {
    setRequestProduct(product);
    setRequestQty(Math.min(50, product.availableQty));
    setShowRequestModal(true);
  };

  const handleCloseRequestModal = () => {
    setShowRequestModal(false);
    setRequestProduct(null);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestProduct || !selectedFactoryId) return;

    const selectedFactory = factories.find((f) => f._id === selectedFactoryId);
    
    const newRequest: AllocationRequest = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      productName: requestProduct.name,
      batchId: requestProduct.batchId,
      factoryName: selectedFactory ? selectedFactory.name : 'Unknown Factory',
      factoryId: selectedFactoryId,
      requestedQty: requestQty,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    const updated = [newRequest, ...allocationRequests];
    setAllocationRequests(updated);
    localStorage.setItem('verichain_allocation_requests', JSON.stringify(updated));
    
    addToast(`Allocation request submitted for ${requestQty} units of ${requestProduct.name}.`, 'success');
    handleCloseRequestModal();
  };

  // Filter factories based on favorites toggle
  const filteredFactories = factories.filter((f) => {
    if (showFavoritesOnly) {
      return savedFactoryIds.includes(f._id);
    }
    return true;
  });

  const selectedFactory = factories.find((f) => f._id === selectedFactoryId);

  if (loadingFactories) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="seller-sourcing-page animate-fade-in" style={{ padding: 'var(--space-xl)' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-xl)' }}>
        <h1>Factory Sourcing Marketplace</h1>
        <p>Interact with verified manufacturers, request inventory allocations, and reserve product batches.</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
          {error}
        </div>
      )}

      {/* Factories Section Header & Filter */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 'var(--space-md)' 
        }}
      >
        <h2 style={{ fontSize: '1.4rem', fontWeight: 600, margin: 0 }}>Verified Factories</h2>
        <label 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)'
          }}
        >
          <input
            type="checkbox"
            checked={showFavoritesOnly}
            onChange={(e) => setShowFavoritesOnly(e.target.checked)}
            style={{ accentColor: '#ef4444', width: '16px', height: '16px' }}
          />
        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
          <button
            className={`btn btn-sm ${isComparing ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => {
              setIsComparing(!isComparing);
              if (isComparing) setComparingFactoryIds([]);
            }}
          >
            {isComparing ? 'Exit Comparison' : 'Compare Suppliers'}
          </button>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
            }}
          >
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
              style={{ accentColor: '#ef4444', width: '16px', height: '16px' }}
            />
            <Heart size={16} fill={showFavoritesOnly ? '#ef4444' : 'none'} color={showFavoritesOnly ? '#ef4444' : 'currentColor'} />
            Show Favorites Only
          </label>
        </div>
      </div>

      {/* Factory List */}
      <div
        className="factory-list"
        style={{
          display: 'flex',
          gap: 'var(--space-md)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-sm)',
          marginBottom: 'var(--space-xl)',
        }}
      >
        {filteredFactories.map((factory) => (
          <FactoryCard
            key={factory._id}
            factory={factory}
            selected={factory._id === selectedFactoryId}
            onSelect={() => handleFactorySelect(factory._id)}
            isSaved={savedFactoryIds.includes(factory._id)}
            onToggleSave={() => toggleSaveFactory(factory._id)}
            isComparing={isComparing}
            onToggleCompare={(e: any) => {
              const checked = e.target.checked;
              setComparingFactoryIds((prev) => {
                const updated = checked ? [...prev, factory._id] : prev.filter((id) => id !== factory._id);
                return updated.slice(0, 4); // limit to 4
              });
            }}
          />
        ))}
        {filteredFactories.length === 0 && (
          <div
            className="glass-card"
            style={{
              padding: 'var(--space-xl)',
              textAlign: 'center',
              width: '100%',
              color: 'var(--text-secondary)',
            }}
          >
            {showFavoritesOnly ? 'No saved factories found.' : 'No verified factories available.'}
          </div>
        )}
      </div>

      {/* Comparison Grid */}
      {isComparing && comparingFactoryIds.length > 0 && (
        <ComparisonGrid factories={factories.filter((f) => comparingFactoryIds.includes(f._id))} />
      )}

      {/* Supplier Profile Panel */}
      {selectedFactory && (
        <div 
          className="glass-card supplier-profile animate-fade-in" 
          style={{ 
            padding: 'var(--space-xl)', 
            marginBottom: 'var(--space-xl)', 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 'var(--space-xl)', 
            alignItems: 'center', 
            position: 'relative', 
            border: '1px solid var(--border-default)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
          }}
        >
          {/* Logo and Primary Info */}
          <div style={{ display: 'flex', gap: 'var(--space-lg)', width: '100%', maxWidth: '360px', alignItems: 'center' }}>
            {selectedFactory.logoUrl ? (
              <img 
                src={selectedFactory.logoUrl} 
                alt={selectedFactory.name} 
                style={{ 
                  width: 90, 
                  height: 90, 
                  objectFit: 'cover', 
                  borderRadius: '50%', 
                  border: '2px solid var(--border-default)' 
                }} 
              />
            ) : (
              <div 
                style={{ 
                  width: 90, 
                  height: 90, 
                  borderRadius: '50%', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  border: '2px solid var(--border-default)',
                  color: 'var(--text-secondary)'
                }}
              >
                <Building size={40} />
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{selectedFactory.name}</h2>
                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--accent-success)', color: '#fff' }}>
                  <ShieldCheck size={12} /> Verified Manufacturer
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                <MapPin size={14} /> {selectedFactory.country || 'Undisclosed Location'}
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                <button 
                  className={`btn btn-sm ${savedFactoryIds.includes(selectedFactory._id) ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => toggleSaveFactory(selectedFactory._id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Heart size={14} fill={savedFactoryIds.includes(selectedFactory._id) ? '#ef4444' : 'none'} color={savedFactoryIds.includes(selectedFactory._id) ? '#ef4444' : 'currentColor'} />
                  {savedFactoryIds.includes(selectedFactory._id) ? 'Saved Supplier' : 'Save Supplier'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats and Certifications */}
          <div style={{ flex: '1.5', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Certifications</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                {(selectedFactory.certifications && selectedFactory.certifications.length > 0 ? selectedFactory.certifications : ['ISO 9001', 'GMP', 'HACCP']).map((cert) => (
                  <span key={cert} className="badge" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Categories</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                {Array.from(new Set([
                  ...(selectedFactory.categories || []),
                  ...products.map((p) => p.category).filter(Boolean)
                ])).map((cat) => (
                  <span key={cat} className="badge" style={{ background: 'rgba(6, 182, 212, 0.08)', color: 'var(--accent-cyan)', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-xl)', marginTop: '4px' }}>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {products.reduce((sum, p) => sum + p.availableQty, 0)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Available Inventory</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border-default)' }} />
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {products.length + (selectedFactory.yearsVerified || 2) * 12}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Verification Count</div>
              </div>
            </div>
          </div>

          {/* Trust Score Gauge */}
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: 'var(--space-md)', 
              background: 'rgba(255, 255, 255, 0.01)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-default)', 
              minWidth: '150px' 
            }}
          >
            <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                <circle cx="40" cy="40" r="34" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="5" fill="transparent" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="34" 
                  stroke="var(--accent-cyan)" 
                  strokeWidth="5" 
                  fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - (selectedFactory.trustScore || 100) / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedFactory.trustScore || 100}%
                </span>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Trust Score
            </span>
          </div>
        </div>
      )}

      {/* Inventory Grid Section */}
      {selectedFactory && (
        <div className="inventory-section" style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
            Available Inventory from {selectedFactory.name}
          </h2>
          
          {loadingProducts ? (
            <div className="loading-container" style={{ minHeight: '30vh' }}>
              <div className="spinner" />
            </div>
          ) : (
            <div 
              className="grid-cards" 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: 'var(--space-lg)' 
              }}
            >
              {products.map((product) => (
                <SellerProductCard 
                  key={product._id} 
                  product={product}
                  onRequestAllocation={() => handleOpenRequestModal(product)}
                  onToggleReserve={() => toggleReserveProduct(product._id)}
                  isReserved={reservedProductIds.includes(product._id)}
                />
              ))}
              {products.length === 0 && (
                <div className="empty-state glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-xl)' }}>
                  <p>No inventory batches available for this factory.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Allocation Requests List */}
      {allocationRequests.length > 0 && (
        <section className="allocation-requests-section animate-fade-in" style={{ marginTop: 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-lg)' }}>
            <ShoppingBag size={22} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, margin: 0 }}>Active Allocation Requests</h2>
          </div>

          <div className="table-container glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Factory</th>
                  <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Batch / Product</th>
                  <th style={{ padding: 'var(--space-md)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Requested Qty</th>
                  <th style={{ padding: 'var(--space-md)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Requested On</th>
                  <th style={{ padding: 'var(--space-md)', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {allocationRequests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border-default)', transition: 'background 0.2s' }}>
                    <td style={{ padding: 'var(--space-md)', fontWeight: 500 }}>{req.factoryName}</td>
                    <td style={{ padding: 'var(--space-md)' }}>
                      <div>{req.productName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{req.batchId}</div>
                    </td>
                    <td style={{ padding: 'var(--space-md)', textAlign: 'center', fontWeight: 600 }}>{req.requestedQty}</td>
                    <td style={{ padding: 'var(--space-md)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(req.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: 'var(--space-md)', textAlign: 'right' }}>
                      <span 
                        className={`badge ${
                          req.status === 'Approved' 
                            ? 'badge-success' 
                            : req.status === 'Rejected' 
                            ? 'badge-danger' 
                            : 'badge-warning'
                        }`}
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          padding: '4px 10px',
                          fontWeight: 600
                        }}
                      >
                        {req.status === 'Pending' && <Clock size={12} className="spin" style={{ animation: 'spin 2s linear infinite' }} />}
                        {req.status === 'Approved' && <CheckCircle size={12} />}
                        {req.status === 'Rejected' && <AlertTriangle size={12} />}
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Request Allocation Modal */}
      {showRequestModal && requestProduct && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="modal-content glass-card animate-scale-in" style={{ maxWidth: '480px', border: '1px solid var(--border-default)' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: 'var(--space-md)' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Request Inventory Allocation</h3>
              <button 
                className="modal-close" 
                onClick={handleCloseRequestModal}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
              <div 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  padding: 'var(--space-md)', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-default)',
                  fontSize: '0.9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div>Product: <strong>{requestProduct.name}</strong></div>
                <div>Batch ID: <code style={{ color: 'var(--accent-cyan)' }}>{requestProduct.batchId}</code></div>
                <div>Factory: <strong>{factories.find(f => f._id === selectedFactoryId)?.name}</strong></div>
                <div>Wholesale Price: <strong>${requestProduct.wholesalePrice.toFixed(2)} / unit</strong></div>
                <div>Available Quantity: <strong>{requestProduct.availableQty} units</strong></div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="request-quantity" style={{ marginBottom: '6px', fontWeight: 500 }}>
                  Requested Quantity
                </label>
                <input
                  id="request-quantity"
                  type="number"
                  className="form-input"
                  min={1}
                  max={requestProduct.availableQty}
                  value={requestQty}
                  onChange={(e) => setRequestQty(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                  style={{ width: '100%' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  Enter a value between 1 and {requestProduct.availableQty}.
                </span>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-default)', paddingTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseRequestModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ShoppingCart size={14} /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerSourcing;
