import React from 'react';
import { IconCircleCheck as CheckCircle2, IconShieldCheck as ShieldCheck, IconActivity as Activity } from '@tabler/icons-react';

const VerificationActivity: React.FC = () => {
  return (
    <section className="mt-12">
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <h2 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Verification Activity & Health
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Network protocol telemetry, consensus status, and cryptographic validation state.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ledger Integrity Card */}
        <div
          className="glass-card flex flex-col justify-between"
          style={{
            padding: 'var(--space-lg)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            minHeight: '180px',
            background: 'var(--bg-card)',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ledger Consensus Status</span>
              <CheckCircle2 size={18} color="#10B981" />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>Operational</div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                  borderRadius: 'inherit',
                }}
              />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '8px', margin: '8px 0 0' }}>
              All consensus nodes synchronized with zero block divergence.
            </p>
          </div>
        </div>

        {/* Cryptographic Signatures Card */}
        <div
          className="glass-card flex flex-col justify-between"
          style={{
            padding: 'var(--space-lg)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            minHeight: '180px',
            background: 'var(--bg-card)',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cryptographic Security</span>
              <Activity size={18} color="#F59E0B" />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>VRC-721 Active</div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 700 }}>ECDSA + SHA-256 Signatures</span>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', margin: '4px 0 0' }}>
              Tamper-proof digital certificates embedded per manufactured unit.
            </p>
          </div>
        </div>

        {/* Security Overview */}
        <div
          className="glass-card flex flex-col justify-between"
          style={{
            padding: 'var(--space-lg)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            minHeight: '180px',
            background: 'var(--bg-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Security Guarantees</span>
            <ShieldCheck size={18} color="#F59E0B" />
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
              <span>Immutable supply chain tracking</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
              <span>Cryptographic ownership transfer</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
              <span>Real-time counterfeit risk scoring</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default VerificationActivity;
