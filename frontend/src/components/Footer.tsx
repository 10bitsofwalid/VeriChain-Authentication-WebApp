import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="marketplace-footer">
      <div>
        <div className="marketplace-footer-brand">
          <span><ShieldCheck size={22} /></span>
          <strong>VeriChain</strong>
        </div>
        <p>Secure product authentication, supply-chain provenance, and trusted marketplace ownership.</p>
      </div>
      <nav aria-label="Footer navigation">
        <a href="/trust-center">Trust Center</a>
        <a href="/verify">Verify Product</a>
        <a href="/compare">Compare</a>
        <a href="/complaints">Reports</a>
      </nav>
      <small>© {new Date().getFullYear()} VeriChain. Cryptographic product provenance for modern commerce.</small>
    </footer>
  );
}
