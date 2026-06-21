import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer 
      style={{ 
        marginTop: 'var(--space-3xl)', 
        paddingTop: 'var(--space-2xl)', 
        paddingBottom: 'var(--space-xl)',
        borderTop: '1px solid var(--border-default)', 
        color: 'var(--text-secondary)'
      }}
    >
      <div 
        style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-lg)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <Shield size={22} color="var(--accent-cyan)" />
          <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>VeriChain</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)', fontSize: '14px' }}>
          <a href="#" style={{ color: 'var(--text-muted)' }}>Terms of Service</a>
          <a href="#" style={{ color: 'var(--text-muted)' }}>Privacy Policy</a>
          <a href="#" style={{ color: 'var(--text-muted)' }}>Documentation</a>
          <a href="#" style={{ color: 'var(--text-muted)' }}>Contact</a>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        &copy; {new Date().getFullYear()} VeriChain. All rights reserved. Secure, cryptographic product provenance.
      </div>
    </footer>
  );
}
