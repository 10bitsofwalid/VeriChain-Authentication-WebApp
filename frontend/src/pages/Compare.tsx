import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useShopping } from '../context/ShoppingContext';
import client from '../api/client';
import {
  Scale,
  ShoppingBag,
  Trash2,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Plus,
} from 'lucide-react';
import ActionButton from '../components/ui/ActionButton';
import type { ListedItem } from './Marketplace';
import './MarketplaceHome.css';

export default function Compare() {
  const { compare, dispatch } = useShopping();
  const navigate = useNavigate();
  const [catalogItems, setCatalogItems] = useState<ListedItem[]>([]);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await client.get('/items/marketplace');
        if (res.data?.items && Array.isArray(res.data.items)) {
          setCatalogItems(res.data.items.slice(0, 8));
        }
      } catch {
        setCatalogItems([]);
      }
    }
    loadCatalog();
  }, []);

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_COMPARE', payload: id });
  };

  const handleClearAll = () => {
    compare.forEach((item) => {
      dispatch({ type: 'REMOVE_FROM_COMPARE', payload: item.id });
    });
  };

  const handleAddToCart = (item: any) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: item.id,
        productId: item.productId || item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: 1,
        verified: item.verified !== false,
      },
    });
  };

  const handleAddToCompare = (item: ListedItem) => {
    dispatch({
      type: 'ADD_TO_COMPARE',
      payload: {
        id: item._id,
        productId: item.product?._id || item.product?.id || item._id,
        name: item.product?.name || 'Verified Product',
        price: Number(item.product?.price) || 100,
        imageUrl: item.product?.imageUrl || '',
        sku: item.product?.sku,
        serialNumber: item.serialNumber,
        verified: item.product?.verifiedStatus === 'verified',
      },
    });
  };

  return (
    <div className="marketplace-home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />

      <main className="page-container" style={{ flex: 1, padding: 'var(--space-xl) var(--space-md)' }}>
        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-xl)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 'var(--space-xs)' }}>
              <span className="marketplace-eyebrow">Cryptographic Comparison</span>
              <span className="bx-count-badge" style={{ marginLeft: 4 }}>
                {compare.length} {compare.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Product Comparison Matrix
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.95rem' }}>
              Compare authentic specifications, pricing, supply chain provenance, and counterfeit risk metrics side-by-side.
            </p>
          </div>

          {compare.length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleClearAll}
                style={{ color: 'var(--color-danger)' }}
              >
                <Trash2 size={15} /> Clear All
              </button>
              <ActionButton variant="primary" size="sm" onClick={() => navigate('/dashboard/marketplace')}>
                <Plus size={15} /> Add Products
              </ActionButton>
            </div>
          )}
        </div>

        {compare.length === 0 ? (
          /* Empty Comparison State */
          <div>
            <div
              className="glass-card"
              style={{
                textAlign: 'center',
                padding: 'var(--space-3xl) var(--space-lg)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-default)',
                marginBottom: 'var(--space-2xl)',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'var(--accent-bg)',
                  color: 'var(--accent-purple)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-md)',
                }}
              >
                <Scale size={32} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                No Products in Comparison
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: 460, margin: '0.5rem auto var(--space-lg)' }}>
                Select products while browsing the marketplace by clicking the comparison scale icon to evaluate technical specs, authenticity status, and pricing.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
                <ActionButton variant="primary" size="md" onClick={() => navigate('/dashboard/marketplace')}>
                  <ShoppingBag size={16} /> Browse Marketplace
                </ActionButton>
                <ActionButton variant="secondary" size="md" onClick={() => navigate('/verify')}>
                  <ShieldCheck size={16} /> Verify Product Serial
                </ActionButton>
              </div>
            </div>

            {/* Quick-add recommendations */}
            {catalogItems.length > 0 && (
              <section style={{ marginTop: 'var(--space-xl)' }}>
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <span className="marketplace-eyebrow">Quick Add</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0 0' }}>
                    Recommended Products to Compare
                  </h3>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: 'var(--space-md)',
                  }}
                >
                  {catalogItems.map((item) => {
                    const isAlreadyCompared = compare.some((p) => p.id === item._id || p.id === item.product?._id);
                    return (
                      <div
                        key={item._id}
                        className="glass-card"
                        style={{
                          padding: 'var(--space-md)',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--border-default)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 'var(--space-sm)',
                        }}
                      >
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                          <img
                            src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'}
                            alt={item.product?.name}
                            style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <strong
                              style={{
                                display: 'block',
                                fontSize: '0.9rem',
                                color: 'var(--text-primary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.product?.name}
                            </strong>
                            <small style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>
                              ${(Number(item.product?.price) || 100).toFixed(2)}
                            </small>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleAddToCompare(item)}
                          disabled={isAlreadyCompared}
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          {isAlreadyCompared ? 'Added to Compare' : '+ Add to Compare'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* Side-by-Side Comparison Matrix */
          <div
            className="glass-card"
            style={{
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)',
              padding: 'var(--space-lg)',
              overflowX: 'auto',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: Math.max(600, compare.length * 240 + 180),
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      width: 180,
                      padding: 'var(--space-md)',
                      textAlign: 'left',
                      verticalAlign: 'bottom',
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      borderBottom: '2px solid var(--border-default)',
                    }}
                  >
                    Feature / Attribute
                  </th>
                  {compare.map((item) => (
                    <th
                      key={item.id}
                      style={{
                        padding: 'var(--space-md)',
                        textAlign: 'center',
                        borderBottom: '2px solid var(--border-default)',
                        verticalAlign: 'top',
                      }}
                    >
                      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 'var(--space-xs)' }}>
                        <img
                          src={item.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'}
                          alt={item.name}
                          style={{
                            width: 120,
                            height: 120,
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-default)',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          title="Remove product"
                          style={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            background: '#EF4444',
                            color: '#FFFFFF',
                            border: 0,
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {item.name}
                      </div>
                      <div style={{ color: 'var(--accent-purple)', fontWeight: 800, fontSize: '1.1rem', margin: '4px 0' }}>
                        ${(Number(item.price) || 0).toFixed(2)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* SKU / Model */}
                <tr>
                  <td style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                    SKU Identifier
                  </td>
                  {compare.map((item) => (
                    <td key={item.id} style={{ padding: 'var(--space-md)', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      {item.sku || 'VC-GEN-PROD'}
                    </td>
                  ))}
                </tr>

                {/* Serial Number */}
                <tr>
                  <td style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                    Serial Number
                  </td>
                  {compare.map((item) => (
                    <td key={item.id} style={{ padding: 'var(--space-md)', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-cyan)', borderBottom: '1px solid var(--border-subtle)' }}>
                      {item.serialNumber || 'VRC-BATCH-SER'}
                    </td>
                  ))}
                </tr>

                {/* Verification Status */}
                <tr>
                  <td style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                    Ledger Status
                  </td>
                  {compare.map((item) => {
                    const isVerified = item.verified !== false;
                    return (
                      <td key={item.id} style={{ padding: 'var(--space-md)', textAlign: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: isVerified ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 166, 35, 0.12)',
                            color: isVerified ? '#059669' : '#D97706',
                          }}
                        >
                          {isVerified ? <ShieldCheck size={13} /> : <AlertTriangle size={13} />}
                          {isVerified ? 'Verified Authentic' : 'Pending Audit'}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Consensus Engine */}
                <tr>
                  <td style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                    Consensus Standard
                  </td>
                  {compare.map((item) => (
                    <td key={item.id} style={{ padding: 'var(--space-md)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>
                      {item.category === 'Luxury Goods' ? 'VRC-721 Immutable Token' : item.category === 'Pharmaceuticals' ? 'VRC-1155 Batch Protocol' : 'VRC-721 Mainnet Standard'}
                    </td>
                  ))}
                </tr>

                {/* Counterfeit Risk */}
                <tr>
                  <td style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                    Counterfeit Risk
                  </td>
                  {compare.map((item) => {
                    const risk = item.counterfeitRisk || (item.verified === false ? 'medium' : 'low');
                    const isLow = risk === 'low';
                    const isMed = risk === 'medium';
                    const riskBg = isLow ? 'rgba(16, 185, 129, 0.12)' : isMed ? 'rgba(245, 166, 35, 0.15)' : 'rgba(239, 68, 68, 0.15)';
                    const riskColor = isLow ? '#059669' : isMed ? '#D97706' : '#DC2626';
                    const riskLabel = isLow ? 'Low Risk (99.8%)' : isMed ? 'Moderate Risk (84.2%)' : 'Elevated Risk (62.0%)';

                    return (
                      <td key={item.id} style={{ padding: 'var(--space-md)', textAlign: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: riskBg,
                            color: riskColor,
                          }}
                        >
                          {isLow ? <CheckCircle size={13} /> : <AlertTriangle size={13} />} {riskLabel}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Direct Actions */}
                <tr>
                  <td style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Actions
                  </td>
                  {compare.map((item) => (
                    <td key={item.id} style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAddToCart(item)}
                          style={{ width: '100%', maxWidth: 160, justifyContent: 'center' }}
                        >
                          <ShoppingBag size={14} /> Add to Cart
                        </button>
                        <Link
                          to={`/product/${item.productId || item.id}`}
                          className="btn btn-ghost btn-sm"
                          style={{ width: '100%', maxWidth: 160, justifyContent: 'center', fontSize: '0.8rem' }}
                        >
                          <ExternalLink size={13} /> View Details
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
