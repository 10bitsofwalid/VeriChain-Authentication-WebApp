import { Link } from 'react-router-dom';
import Logo from './Logo';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="vc-footer">
      <div className="vc-footer-container">
        {/* Main Footer Row */}
        <div className="vc-footer-main">
          {/* Brand & Mission Column */}
          <div className="vc-footer-brand-col">
            <Logo size={28} showText={true} />
            <p className="vc-footer-tagline">
              Cryptographic product provenance, anti-counterfeit proofing, and tamper-evident decentralized asset tracking for modern commerce.
            </p>
            <div className="vc-footer-status">
              <span className="vc-footer-pulse" />
              <span>VeriChain Ledger: <strong>100% Operational</strong></span>
            </div>
          </div>

          {/* Navigation Link Columns */}
          <div className="vc-footer-links-grid">
            <div className="vc-footer-col">
              <span className="vc-footer-col-title">Platform</span>
              <Link to="/dashboard/marketplace" className="vc-footer-link">Marketplace</Link>
              <Link to="/verify" className="vc-footer-link">Verify Product</Link>
              <Link to="/compare" className="vc-footer-link">Compare Matrix</Link>
              <Link to="/trust-center" className="vc-footer-link">Trust Center</Link>
            </div>

            <div className="vc-footer-col">
              <span className="vc-footer-col-title">Integrity & Governance</span>
              <Link to="/complaints" className="vc-footer-link">Audit Reports</Link>
              <Link to="/recall-management" className="vc-footer-link">Recall Registry</Link>
              <Link to="/dashboard/moderator" className="vc-footer-link">Moderation Hub</Link>
              <Link to="/ai-assistant" className="vc-footer-link">AI Fraud Shield</Link>
            </div>

            <div className="vc-footer-col">
              <span className="vc-footer-col-title">Ecosystem</span>
              <Link to="/dashboard/factory" className="vc-footer-link">Certified Factories</Link>
              <Link to="/dashboard/seller" className="vc-footer-link">Verified Merchants</Link>
              <Link to="/buyer/orders" className="vc-footer-link">Order Management</Link>
              <Link to="/community" className="vc-footer-link">Community Registry</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="vc-footer-bottom">
          <p className="vc-footer-copy">
            © {new Date().getFullYear()} VeriChain Protocol. Cryptographic product provenance & supply chain consensus.
          </p>
          <div className="vc-footer-badges">
            <span className="vc-footer-badge">🔒 256-Bit Cryptographic Proofs</span>
            <span className="vc-footer-badge">🛡️ Zero-Knowledge Auditing</span>
          </div>
        </div>
      </div>
    </footer>
  );
}


