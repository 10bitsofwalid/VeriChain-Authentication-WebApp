import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="marketplace-footer">
      <div>
        <Logo size={28} showText={true} />
        <p style={{ marginTop: '0.6rem' }}>Secure product authentication, supply-chain provenance, and trusted marketplace ownership.</p>
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

