import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import {
  Shield,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Package,
  ArrowLeft,
  QrCode,
  Camera,
  Copy,
  Check,
  FileText,
  Award,
  User,
  Building,
  Truck,
  Database,
  RefreshCw,
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

  // Scanner Simulator States
  const [showScanner, setShowScanner] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState<'idle' | 'searching' | 'decoding' | 'success'>('idle');

  // Copy Feedback States
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Holographic Sheen Coordinates
  const [certShine, setCertShine] = useState({ x: 50, y: 50 });

  // Verification method trigger
  const triggerVerify = async (serialNum: string) => {
    if (!serialNum.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await client.get(`/items/verify/${encodeURIComponent(serialNum.trim())}`);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Item not found or an error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // URL query verification on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const querySerial = params.get('id') || params.get('serial');
    if (querySerial) {
      setSerial(querySerial);
      triggerVerify(querySerial);
    }
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    triggerVerify(serial);
  };

  // Trigger Scanner Simulator
  const startScanning = () => {
    setShowScanner(true);
    setScanStep('searching');
    setScanProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setScanStep('decoding');
        setTimeout(() => {
          setScanStep('success');
          // Mock item serial from seed data
          const demoSerial = 'VC-SKU-10001';
          setSerial(demoSerial);
          setTimeout(() => {
            setShowScanner(false);
            triggerVerify(demoSerial);
          }, 600);
        }, 800);
      }
    }, 120);
  };

  // Holographic sheen position calculation
  const handleCertMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setCertShine({ x, y });
  };

  // Copy Helper for TX hash
  const handleCopyHash = (txHash: string) => {
    navigator.clipboard.writeText(txHash);
    setCopiedHash(txHash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Copy Verification Link Helper
  const handleCopyVerifyLink = (serialNum: string) => {
    const link = `${window.location.origin}/verify?id=${encodeURIComponent(serialNum)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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

  // Helper to determine actor icons in journey
  const getActorIcon = (action: string) => {
    const normAction = action.toLowerCase();
    if (normAction.includes('manufacture') || normAction.includes('mint')) return <Building size={16} />;
    if (normAction.includes('transit') || normAction.includes('ship')) return <Truck size={16} />;
    if (normAction.includes('list') || normAction.includes('retail') || normAction.includes('store')) return <Package size={16} />;
    if (normAction.includes('sell') || normAction.includes('transfer') || normAction.includes('own')) return <User size={16} />;
    return <Clock size={16} />;
  };

  return (
    <div className="verify-page">
      <div className="verify-glow-1" />
      <div className="verify-glow-2" />

      <header className="verify-header">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </header>

      <div className="verify-content animate-fade-in-up">
        {/* Title Section */}
        <div className="verify-title-section">
          <div className="verify-shield-container">
            <Shield size={44} className="verify-shield-icon" />
            <div className="shield-ring" />
          </div>
          <h1>Verify Product Authenticity</h1>
          <p>Instantly authenticate assets, verify cryptographic birth certificates, and trace blockchain custody history.</p>
        </div>

        {/* Search & Actions Bar */}
        <div className="verify-controls-card glass-card">
          <form onSubmit={handleSearch} className="verify-search-form">
            <div className="verify-search-wrapper">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                className="verify-search-input"
                placeholder="Enter Serial Number (e.g. VC-SKU001-100001)"
                value={serial}
                onChange={e => setSerial(e.target.value)}
              />
              <div className="search-actions">
                <button
                  type="button"
                  className="btn-scan-qr"
                  onClick={startScanning}
                  title="Simulate Scanning QR Code"
                >
                  <Camera size={18} />
                  <span>Scan QR</span>
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading || !serial.trim()}>
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="spin-slow" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
            </div>
          </form>
          <div className="quick-suggestions">
            <span>Demo Serials:</span>
            <button onClick={() => { setSerial('VC-SKU-10001'); triggerVerify('VC-SKU-10001'); }}>Try VC-SKU-10001</button>
            <button onClick={() => { setSerial('VC-SKU001-100001'); triggerVerify('VC-SKU001-100001'); }}>Try VC-SKU001-100001</button>
            <button onClick={() => { setSerial('INVALID-SERIAL-XYZ'); triggerVerify('INVALID-SERIAL-XYZ'); }}>Try Invalid Test</button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="verify-result-card glass-card verify-error animate-fade-in-up">
            <div className="error-icon-wrapper">
              <XCircle size={44} />
            </div>
            <h2>Not Found</h2>
            <p>{error}</p>
            <div className="error-advice">
              Please double check the spelling, characters, or try scanning the original physical QR code sticker.
            </div>
          </div>
        )}

        {/* Results Presentation */}
        {result && (
          <div className="verify-results animate-fade-in-up">
            
            {/* Status Banner */}
            <div className={`verify-banner ${result.verified ? 'banner-verified' : 'banner-unverified'}`}>
              <div className="banner-status-badge">
                {result.verified ? (
                  <CheckCircle size={32} className="pulse-svg" />
                ) : (
                  <AlertTriangle size={32} className="pulse-svg" />
                )}
              </div>
              <div className="banner-text-details">
                <h2>{result.verified ? 'Authentic Product' : 'Verification Pending'}</h2>
                <p>
                  {result.verified
                    ? 'This product template & serial signature are verified by VeriChain Consensus.'
                    : 'This product signature has not yet been audited and verified by our system moderators.'}
                </p>
              </div>
            </div>

            {/* Main Result Columns */}
            <div className="verify-layout-grid">
              
              {/* Left Column: Product Info & Certificate */}
              <div className="verify-main-column">
                
                {/* Product Detail Card */}
                <div className="verify-details glass-card">
                  <div className="detail-header">
                    <Package size={20} />
                    <h3>Product Specifications</h3>
                  </div>

                  {result.item.product.imageUrl && (
                    <div className="verify-product-preview">
                      <img src={result.item.product.imageUrl} alt={result.item.product.name} />
                      <div className="preview-overlay">
                        <span className="badge badge-info">{result.item.product.category}</span>
                      </div>
                    </div>
                  )}

                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Name</span>
                      <span className="detail-value">{result.item.product.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Category</span>
                      <span className="detail-value">{result.item.product.category}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">SKU ID</span>
                      <span className="detail-value mono">{result.item.product.sku}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Serial Number</span>
                      <span className="detail-value mono">{result.item.serialNumber}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Custody Status</span>
                      <span className={`badge ${statusColor(result.item.status)}`}>
                        {result.item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Counterfeit Risk</span>
                      <span className={`badge ${riskColor(result.item.counterfeitRisk)}`}>
                        {result.item.counterfeitRisk}
                      </span>
                    </div>
                  </div>

                  {result.item.product.description && (
                    <p className="detail-description">{result.item.product.description}</p>
                  )}
                </div>

                {/* Authenticity Certificate Card */}
                {result.verified && (
                  <div
                    className="certificate-card-wrapper"
                    onMouseMove={handleCertMouseMove}
                  >
                    <div
                      className="authenticity-certificate"
                      style={{
                        background: `radial-gradient(circle at ${certShine.x}% ${certShine.y}%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%), linear-gradient(135deg, rgba(16, 24, 48, 0.95) 0%, rgba(8, 12, 28, 0.98) 100%)`,
                      }}
                    >
                      <div className="certificate-border-glow" />
                      <div className="certificate-seal-bg">
                        <Award size={180} />
                      </div>
                      
                      <div className="certificate-header-brand">
                        <Shield size={24} className="gold-icon" />
                        <span>VERICHAIN TRUST NETWORK</span>
                      </div>

                      <div className="certificate-body">
                        <div className="cert-subtitle">OFFICIAL DIGITAL CERTIFICATE</div>
                        <h2 className="cert-title">AUTHENTICITY CERTIFICATE</h2>
                        <p className="cert-intro">
                          This certificate guarantees that the accompanying asset has been cryptographically signed and registered on the decentralized ledger.
                        </p>

                        <div className="cert-metadata-rows">
                          <div className="cert-meta-row">
                            <span className="lbl">Asset Identifier:</span>
                            <span className="val mono">#{result.item.serialNumber}</span>
                          </div>
                          <div className="cert-meta-row">
                            <span className="lbl">Template Standard:</span>
                            <span className="val">VRC-721 Secure Token</span>
                          </div>
                          <div className="cert-meta-row">
                            <span className="lbl">Verification Score:</span>
                            <span className="val gold-text">99.8% (Consensus Verified)</span>
                          </div>
                          <div className="cert-meta-row">
                            <span className="lbl">Current Custody:</span>
                            <span className="val">
                              {result.item.currentOwner ? (
                                `${result.item.currentOwner.name} (${result.item.currentOwner.role})`
                              ) : (
                                'Unassigned'
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="certificate-signatures">
                          <div className="signature-block">
                            <div className="signature-line mono">VeriChain Node v1.4</div>
                            <div className="signature-label">Authority Signatory</div>
                          </div>
                          <div className="signature-block">
                            <div className="signature-line cert-signed">AUTHENTIC</div>
                            <div className="signature-label">Verification Ledger Status</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Timeline & QR Result */}
              <div className="verify-side-column">
                
                {/* QR Code sharing Result */}
                <div className="qr-result-card glass-card">
                  <div className="detail-header">
                    <QrCode size={20} />
                    <h3>Secure QR Signature</h3>
                  </div>
                  <div className="qr-visual-container">
                    {/* Render a premium custom vector QR design */}
                    <svg width="150" height="150" viewBox="0 0 100 100" className="styled-qr-svg">
                      <rect width="100" height="100" fill="transparent" />
                      {/* Quiet Zone/Borders */}
                      <path d="M 0,0 L 30,0 L 30,8 L 8,8 L 8,30 L 0,30 Z" fill="var(--accent-cyan)" />
                      <path d="M 100,0 L 70,0 L 70,8 L 92,8 L 92,30 L 100,30 Z" fill="var(--accent-cyan)" />
                      <path d="M 0,100 L 30,100 L 30,92 L 8,92 L 8,70 L 0,70 Z" fill="var(--accent-cyan)" />
                      <path d="M 100,100 L 70,100 L 70,92 L 92,92 L 92,70 L 100,70 Z" fill="var(--accent-cyan)" />
                      
                      {/* Top Left Finder Pattern */}
                      <rect x="12" y="12" width="24" height="24" fill="var(--text-primary)" rx="2" />
                      <rect x="18" y="18" width="12" height="12" fill="var(--bg-card)" rx="1" />
                      <rect x="22" y="22" width="4" height="4" fill="var(--accent-cyan)" />

                      {/* Top Right Finder Pattern */}
                      <rect x="64" y="12" width="24" height="24" fill="var(--text-primary)" rx="2" />
                      <rect x="70" y="18" width="12" height="12" fill="var(--bg-card)" rx="1" />
                      <rect x="74" y="74" width="4" height="4" fill="var(--accent-cyan)" />

                      {/* Bottom Left Finder Pattern */}
                      <rect x="12" y="64" width="24" height="24" fill="var(--text-primary)" rx="2" />
                      <rect x="18" y="70" width="12" height="12" fill="var(--bg-card)" rx="1" />
                      <rect x="22" y="74" width="4" height="4" fill="var(--accent-cyan)" />

                      {/* Mock QR details pattern (scattered squares) */}
                      <rect x="44" y="16" width="6" height="6" fill="var(--text-primary)" />
                      <rect x="52" y="24" width="4" height="4" fill="var(--text-primary)" />
                      <rect x="44" y="32" width="8" height="4" fill="var(--text-secondary)" />
                      <rect x="16" y="44" width="4" height="8" fill="var(--text-secondary)" />
                      <rect x="28" y="44" width="6" height="4" fill="var(--text-primary)" />
                      
                      <rect x="44" y="44" width="12" height="12" fill="var(--accent-cyan)" rx="1" />
                      <rect x="48" y="48" width="4" height="4" fill="var(--bg-card)" />

                      <rect x="64" y="44" width="8" height="4" fill="var(--text-primary)" />
                      <rect x="76" y="44" width="8" height="8" fill="var(--text-secondary)" />
                      <rect x="88" y="52" width="4" height="8" fill="var(--text-primary)" />

                      <rect x="44" y="64" width="6" height="6" fill="var(--text-secondary)" />
                      <rect x="44" y="76" width="12" height="4" fill="var(--text-primary)" />
                      <rect x="64" y="64" width="4" height="12" fill="var(--text-primary)" />
                      <rect x="76" y="68" width="12" height="4" fill="var(--text-secondary)" />
                      <rect x="72" y="80" width="16" height="8" fill="var(--text-primary)" />
                    </svg>
                    <div className="qr-shield-center">
                      <Shield size={16} />
                    </div>
                  </div>
                  <div className="qr-details-text">
                    <p>Cryptographic Scan URL:</p>
                    <div className="qr-link-copy" onClick={() => handleCopyVerifyLink(result.item.serialNumber)}>
                      <span className="mono">{window.location.origin}/verify?id={result.item.serialNumber.slice(0, 10)}...</span>
                      {copiedLink ? <Check size={14} className="green-icon" /> : <Copy size={14} />}
                    </div>
                  </div>
                  <button 
                    className="btn btn-secondary btn-full"
                    onClick={() => window.print()}
                  >
                    <FileText size={14} />
                    <span>Print QR Label Tag</span>
                  </button>
                </div>

                {/* Journey Timeline */}
                <div className="verify-journey glass-card">
                  <div className="detail-header">
                    <Clock size={20} />
                    <h3>Supply Chain Journey</h3>
                  </div>

                  {result.item.journey && result.item.journey.length > 0 ? (
                    <div className="journey-timeline">
                      {result.item.journey.map((step, index) => (
                        <div key={index} className="journey-step">
                          <div className="journey-icon-column">
                            <div className="journey-node-glow">
                              {getActorIcon(step.action)}
                            </div>
                            {index < result.item.journey.length - 1 && <div className="journey-line" />}
                          </div>
                          <div className="journey-content">
                            <div className="journey-action">{step.action.replace(/_/g, ' ')}</div>
                            <div className="journey-meta">
                              <span><MapPin size={12} /> {step.location}</span>
                              <span><Clock size={12} /> {new Date(step.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className="journey-actor-info">
                              <span>By: {step.actor?.name}</span>
                              <span className="actor-role">({step.actor?.role})</span>
                            </div>
                            {step.txHash && (
                              <div className="journey-hash-container">
                                <span className="lbl-tx">TX:</span>
                                <span className="hash mono" title={step.txHash}>
                                  {step.txHash.slice(0, 10)}...{step.txHash.slice(-6)}
                                </span>
                                <button
                                  className="btn-copy-hash"
                                  onClick={() => handleCopyHash(step.txHash)}
                                  title="Copy transaction hash"
                                >
                                  {copiedHash === step.txHash ? <Check size={12} className="green-icon" /> : <Copy size={12} />}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-journey-state">
                      <Database size={32} className="empty-icon" />
                      <p>No supply chain journey records exist for this item yet.</p>
                      <span>This item is logged with a genesis birth record but has not been transferred.</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Holographic QR Scanner Simulation Modal */}
      {showScanner && (
        <div className="scanner-modal-overlay">
          <div className="scanner-modal glass-card">
            <div className="scanner-header">
              <Camera size={20} className="pulse-svg" />
              <h3>Simulated QR Cryptographic Scanner</h3>
              <button className="scanner-close-btn" onClick={() => setShowScanner(false)}>
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="scanner-viewfinder">
              <div className="viewfinder-corner top-left" />
              <div className="viewfinder-corner top-right" />
              <div className="viewfinder-corner bottom-left" />
              <div className="viewfinder-corner bottom-right" />
              
              <div className="scanner-laser-line" />
              
              <div className="viewfinder-feed">
                <div className="feed-noise" />
                <QrCode size={96} className="feed-qr-icon" />
                <div className="hologram-scanner-circle" />
              </div>

              <div className="scanner-status-overlay">
                {scanStep === 'searching' && (
                  <div className="status-label pulse">
                    <span>ALIGNING SCANNER OPTICS...</span>
                    <span className="percent">{scanProgress}%</span>
                  </div>
                )}
                {scanStep === 'decoding' && (
                  <div className="status-label decoding">
                    <RefreshCw size={14} className="spin-slow" />
                    <span>DECRYPTING QR SEAL SIGNATURE...</span>
                  </div>
                )}
                {scanStep === 'success' && (
                  <div className="status-label success">
                    <CheckCircle size={14} />
                    <span>SIGNATURE DECODED SUCCESSFULLY!</span>
                  </div>
                )}
              </div>
            </div>

            <div className="scanner-footer">
              <p>Position the product QR tag within the viewfinder frame to verify instantly.</p>
              <div className="scanner-progress-bar">
                <div className="progress-fill" style={{ width: `${scanProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
