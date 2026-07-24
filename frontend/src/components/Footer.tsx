import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="marketplace-footer">
      <div>
        <div className="marketplace-footer-brand">
          <span aria-hidden="true"><ShieldCheck size={22} /></span>
          <strong>VeriChain</strong>
        </div>
        <p>Secure product authentication, supply-chain provenance, and trusted marketplace ownership.</p>
      </div>
      <nav aria-label="Footer navigation">
        <Link to="/trust-center">Trust Center</Link>
        <Link to="/verify">Verify Product</Link>
        <Link to="/compare">Compare</Link>
        <Link to="/complaints">Reports</Link>
      </nav>
      <small>© {new Date().getFullYear()} VeriChain. Cryptographic product provenance for modern commerce.</small>
    </footer>
  );
}

