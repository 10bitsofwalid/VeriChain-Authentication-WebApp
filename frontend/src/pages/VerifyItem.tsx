import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import {
  Search,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Package,
  ArrowLeft,
} from 'lucide-react';
import './VerifyItem.css';

interface VerifyResult {
  verified: boolean;
  item: {
    serialNumber: string;
    status: string;
    counterfeitRisk: string;
    manufacturedAt: string;
    product: {
      name: string;
      description: string;
      category: string;
      sku: string;
      imageUrl: string;
      certificateUrl: string;
      verifiedStatus: string;
    };
    currentOwner: { name: string; role: string };
    journey: Array<{
      location: string;
      action: string;
      actor: { name: string; role: string };
      timestamp: string;
      txHash: string;
    }>;
  };
}

export default function VerifyItem() {
  const [serial, setSerial] = useState('');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!serial.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await client.get(`/items/verify/${encodeURIComponent(serial.trim())}`);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Item not found or an error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'high': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'manufactured': return 'badge-info';
      case 'in_transit': return 'badge-warning';
      case 'listed': return 'badge-neutral';
      case 'sold': return 'badge-success';
      case 'recalled': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-glow" />

      <header className="verify-header">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      </header>

      <div className="verify-content animate-fade-in-up">
        <div className="verify-title-section">
          <Shield size={36} className="verify-shield-icon" />
          <h1>Verify Product Authenticity</h1>
          <p>Enter the serial number to check if a product is genuine and view its supply chain history.</p>
        </div>

        <form onSubmit={handleSearch} className="verify-search-form">
          <div className="verify-search-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              className="verify-search-input"
              placeholder="Enter serial number (e.g. VC-SKU001-100001)"
              value={serial}
              onChange={e => setSerial(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !serial.trim()}>
              {loading ? 'Searching...' : 'Verify'}
            </button>
          </div>
        </form>

        {error && (
          <div className="verify-result-card glass-card verify-error animate-fade-in-up">
            <XCircle size={48} />
            <h2>Not Found</h2>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="verify-results animate-fade-in-up">
            {/* Verification status banner */}
            <div className={`verify-banner ${result.verified ? 'banner-verified' : 'banner-unverified'}`}>
              {result.verified ? (
                <>
                  <CheckCircle size={28} />
                  <div>
                    <h2>Authentic Product</h2>
                    <p>This product has been verified by VeriChain</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle size={28} />
                  <div>
                    <h2>Verification Pending</h2>
                    <p>This product has not yet been verified by our team</p>
                  </div>
                </>
              )}
            </div>

            {/* Product details */}
            <div className="verify-details glass-card">
              <div className="detail-header">
                <Package size={20} />
                <h3>Product Details</h3>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Product</span>
                  <span className="detail-value">{result.item.product.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">{result.item.product.category}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">SKU</span>
                  <span className="detail-value" style={{ fontFamily: 'var(--font-mono)' }}>{result.item.product.sku}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Serial Number</span>
                  <span className="detail-value" style={{ fontFamily: 'var(--font-mono)' }}>{result.item.serialNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`badge ${statusColor(result.item.status)}`}>{result.item.status.replace('_', ' ')}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Counterfeit Risk</span>
                  <span className={`badge ${riskColor(result.item.counterfeitRisk)}`}>{result.item.counterfeitRisk}</span>
                </div>
              </div>
              {result.item.product.description && (
                <p className="detail-description">{result.item.product.description}</p>
              )}
            </div>

            {/* Journey timeline */}
            {result.item.journey.length > 0 && (
              <div className="verify-journey glass-card">
                <div className="detail-header">
                  <Clock size={20} />
                  <h3>Supply Chain Journey</h3>
                </div>
                <div className="journey-timeline">
                  {result.item.journey.map((step, index) => (
                    <div key={index} className="journey-step">
                      <div className="journey-dot" />
                      {index < result.item.journey.length - 1 && <div className="journey-line" />}
                      <div className="journey-content">
                        <div className="journey-action">{step.action.replace(/_/g, ' ')}</div>
                        <div className="journey-meta">
                          <span><MapPin size={12} /> {step.location}</span>
                          <span><Clock size={12} /> {new Date(step.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="journey-hash" title={step.txHash}>
                          TX: {step.txHash.slice(0, 10)}...{step.txHash.slice(-6)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
