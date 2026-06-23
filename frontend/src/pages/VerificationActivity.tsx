import React from 'react';
import { verificationActivityStats } from '../mock/verificationActivity';
import { CheckCircle2, ShieldAlert, Activity } from 'lucide-react';

const VerificationActivity: React.FC = () => {
  const stats = verificationActivityStats;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold mb-4">Verification Activity & Health</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trust Score Gauge Card */}
        <div className="glass-card p-6 flex flex-col justify-between" style={{ minHeight: '180px' }}>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400 font-medium">Platform Trust Index</span>
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
            <div className="text-4xl font-extrabold text-white mt-1">{stats.trustScore}%</div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${stats.trustScore}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Calculated based on successful product verification history.</p>
          </div>
        </div>

        {/* Recent Verifications Card */}
        <div className="glass-card p-6 flex flex-col justify-between" style={{ minHeight: '180px' }}>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400 font-medium">Recent Verifications</span>
              <Activity size={18} className="text-cyan-400" />
            </div>
            <div className="text-4xl font-extrabold text-white mt-1">{stats.recentVerifications}</div>
          </div>
          <div className="mt-4">
            <span className="text-xs text-emerald-400 font-medium">↑ 12% increase from yesterday</span>
            <p className="text-xs text-gray-500 mt-1">Total verification scans requested in the past 24 hours.</p>
          </div>
        </div>

        {/* Latest Events timeline/list */}
        <div className="glass-card p-6 flex flex-col" style={{ minHeight: '180px' }}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-400 font-medium">Latest Security Events</span>
            <ShieldAlert size={18} className="text-amber-400" />
          </div>
          <ul className="space-y-3 flex-1 flex flex-col justify-center">
            {stats.latestEvents.map((event, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                <span>{event}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default VerificationActivity;
