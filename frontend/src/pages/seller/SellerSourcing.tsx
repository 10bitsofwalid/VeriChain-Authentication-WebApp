import React, { useEffect, useState } from 'react';
import PageLoader from '../../components/ui/PageLoader';
import AlertBanner from '../../components/ui/AlertBanner';
import Modal from '../../components/ui/Modal';
import client from '../../api/client';
import FactoryCard from '../../components/FactoryCard';
import ComparisonGrid from '../../components/ComparisonGrid';
import SellerProductCard from '../../components/SellerProductCard';
import { useToast } from '../../components/ToastProvider';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import {
  IconBuilding as Building,
  IconShieldCheck as ShieldCheck,
  IconMapPin as MapPin,
  IconHeart as Heart,
  IconShoppingCart as ShoppingCart,
  IconShoppingBag as ShoppingBag,
  IconClock as Clock,
  IconCircleCheck as CheckCircle,
  IconAlertTriangle as AlertTriangle,
} from '@tabler/icons-react';

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

  // Sourcing Interactions States (Persisted in localStorage via useLocalStorage)
  const [savedFactoryIds, setSavedFactoryIds] = useLocalStorage<string[]>(STORAGE_KEYS.SAVED_FACTORIES, []);
  const [reservedProductIds, setReservedProductIds] = useLocalStorage<string[]>(STORAGE_KEYS.RESERVED_BATCHES, []);
  const [allocationRequests, setAllocationRequests] = useLocalStorage<AllocationRequest[]>(STORAGE_KEYS.ALLOCATION_REQUESTS, []);
  const [isComparing, setIsComparing] = useState(false);
  const [comparingFactoryIds, setComparingFactoryIds] = useState<string[]>([]);

  // Filter States
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Modal States
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestProduct, setRequestProduct] = useState<Product | null>(null);
  const [requestQty, setRequestQty] = useState<number>(50);



  // Fetch verified factories on mount
  useEffect(() => {
    const fetchFactories = async () => {
      try {
        const res = await client.get('/users', { params: { role: 'factory', verified: true } });
        const factoryList = Array.isArray(res.data) ? res.data : res.data?.users;
        if (factoryList && factoryList.length > 0) {
          setFactories(factoryList);
          setSelectedFactoryId(factoryList[0]._id);
        } else {
          setFactories([]);
          setSelectedFactoryId('');
        }
      } catch (err: any) {
        console.warn('API /users failed to load factories', err);
        setFactories([]);
        setSelectedFactoryId('');
      } finally {
        setLoadingFactories(false);
      }
    };
    fetchFactories();
  }, []);

  // Fetch products whenever a factory is selected
  useEffect(() => {
    if (!selectedFactoryId) {
      setProducts([]);
      setLoadingProducts(false);
      return;
    }
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setError('');
      try {
        const res = await client.get('/products/factory', { params: { factoryId: selectedFactoryId } });
        if (res.data && res.data.products && Array.isArray(res.data.products)) {
          setProducts(res.data.products);
        } else {
          setProducts([]);
        }
      } catch (err: any) {
        console.warn(`API /products/factory failed for ${selectedFactoryId}`, err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [selectedFactoryId]);

  // Save/Favorite Supplier handler
  const handleFactorySelect = (factoryId: string) => {
    setSelectedFactoryId(factoryId);
  };

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

    setAllocationRequests((prev) => [newRequest, ...prev]);
    
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
    return <PageLoader minHeight="60vh" />;
  }

  return (
    <div className="seller-sourcing-page animate-fade-in" style={{ padding: 'var(--space-xl)' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-xl)' }}>
        <h1>Factory Sourcing Marketplace</h1>
        <p>Interact with verified manufacturers, request inventory allocations, and reserve product batches.</p>
      </div>

      {error && (
        <AlertBanner
          type="error"
          message={error}
          onDismiss={() => setError('')}
          style={{ marginBottom: 'var(--space-lg)' }}
        />
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
          Favorites only
        </label>
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
            <PageLoader minHeight="30vh" />
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
      <Modal
        open={showRequestModal && !!requestProduct}
        onClose={handleCloseRequestModal}
        title="Request Inventory Allocation"
        maxWidth="500px"
      >
        {requestProduct && (
          <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
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

            <div className="modal-footer">
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
        )}
      </Modal>
    </div>
  );
};

export default SellerSourcing;
