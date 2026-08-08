import React from 'react';
import { CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

const VerificationActivity: React.FC = () => {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold mb-4">Verification Activity & Health</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ledger Integrity Card */}
        <div className="glass-card p-6 flex flex-col justify-between" style={{ minHeight: '180px' }}>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400 font-medium">Ledger Consensus Status</span>
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">Operational</div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `100%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">All consensus nodes synchronized with zero block divergence.</p>
          </div>
        </div>

        {/* Cryptographic Signatures Card */}
        <div className="glass-card p-6 flex flex-col justify-between" style={{ minHeight: '180px' }}>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400 font-medium">Cryptographic Security</span>
              <Activity size={18} className="text-cyan-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">VRC-721 Active</div>
          </div>
          <div className="mt-4">
            <span className="text-xs text-emerald-400 font-medium">ECDSA + SHA-256 Signatures</span>
            <p className="text-xs text-gray-500 mt-1">Tamper-proof digital certificates embedded per manufactured unit.</p>
          </div>
        </div>

        {/* Security Overview */}
        <div className="glass-card p-6 flex flex-col" style={{ minHeight: '180px' }}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-400 font-medium">Security Guarantees</span>
            <ShieldCheck size={18} className="text-cyan-400" />
          </div>
          <ul className="space-y-2 flex-1 flex flex-col justify-center text-xs text-gray-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
              <span>Immutable supply chain tracking</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <span>Cryptographic ownership transfer</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
              <span>Real-time counterfeit risk scoring</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default VerificationActivity;
