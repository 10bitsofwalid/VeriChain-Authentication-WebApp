import { ShieldCheck, Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HeroBanner() {
  const navigate = useNavigate();

  return (
    <section 
      className="glass-card animate-fade-in" 
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.8))',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-2xl) var(--space-xl)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-2xl)',
        boxShadow: 'var(--shadow-glow-accent)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative background glow */}
      <div 
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(0, 88, 188, 0.15) 0%, transparent 60%)',
          pointerEvents: 'none'
        }}
      />

      <div 
        style={{
          background: 'rgba(0, 88, 188, 0.2)',
          border: '1px solid rgba(0, 88, 188, 0.3)',
          color: '#38bdf8',
          padding: 'var(--space-xs) var(--space-sm)',
          borderRadius: 'var(--radius-full)',
          fontSize: '13px',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-xs)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}
      >
        <ShieldCheck size={14} /> Trust & Authentication Ledger
      </div>

      <h1 
        style={{ 
          fontSize: 'clamp(28px, 4vw, 48px)', 
          fontWeight: 800, 
          lineHeight: 1.2, 
          maxWidth: '800px', 
          color: '#ffffff',
          letterSpacing: '-0.02em',
          margin: '0 auto'
        }}
      >
        Uncompromising Authenticity, <br />
        <span style={{ 
          background: 'linear-gradient(to right, #38bdf8, #818cf8)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Powered by Blockchain
        </span>
      </h1>

      <p 
        style={{ 
          fontSize: 'clamp(14px, 2vw, 17px)', 
          color: '#94a3b8', 
          maxWidth: '600px', 
          margin: '0 auto var(--space-md) auto',
          lineHeight: 1.6
        }}
      >
        Verify product legitimacy instantly, track manufacturing origins, and secure your supply chain with decentralized digital certificates of birth.
      </p>

      <div 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-sm)',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '500px'
        }}
      >
        <button 
          className="btn btn-primary btn-lg" 
          onClick={() => navigate('/verify')}
          style={{ 
            flex: '1', 
            minWidth: '180px',
            background: 'linear-gradient(135deg, #0058bc, #0070eb)',
            border: 'none',
            color: '#ffffff'
          }}
        >
          <Search size={16} /> Verify An Item
        </button>
        <button 
          className="btn btn-secondary btn-lg" 
          onClick={() => navigate('/login')}
          style={{ 
            flex: '1', 
            minWidth: '180px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff'
          }}
        >
          Portal Dashboard <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
