import { useState } from 'react';
import MetricCard from '../../../components/ui/MetricCard';
import StatusChip from '../../../components/ui/StatusChip';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Users,
  BarChart2,
  PieChart,
  Activity,
  Award,
} from 'lucide-react';

interface FactoryLeader {
  rank: number;
  name: string;
  itemsVerified: number;
  authenticityScore: number; // e.g. 99.9%
  status: string;
}

const TOP_FACTORIES: FactoryLeader[] = [
  { rank: 1, name: 'Titan Chrono Watchmaker SA', itemsVerified: 142900, authenticityScore: 99.98, status: 'Top Rated' },
  { rank: 2, name: 'Aura Manufacturing Co.', itemsVerified: 89400, authenticityScore: 99.94, status: 'Verified' },
  { rank: 3, name: 'LuxeCraft Italian Goods', itemsVerified: 65100, authenticityScore: 99.89, status: 'Verified' },
  { rank: 4, name: 'Optima Precision Labs', itemsVerified: 41200, authenticityScore: 99.75, status: 'Verified' },
];

export default function AdminStatisticsView() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '1y'>('30d');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg, 20px)' }}>
      {/* Timeframe Control Bar */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart2 size={20} color="#06b6d4" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
              Platform Analytical Telemetry & Verification Trends
            </h3>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['24h', '7d', '30d', '1y'] as const).map(tf => (
              <button
                key={tf}
                type="button"
                className={`btn btn-ghost ${timeframe === tf ? 'active' : ''}`}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  borderRadius: 6,
                  border: timeframe === tf ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.08)',
                  background: timeframe === tf ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                  color: timeframe === tf ? '#38bdf8' : '#94a3b8',
                  fontWeight: timeframe === tf ? 600 : 400,
                }}
              >
                {tf === '24h' ? '24 Hours' : tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : '1 Year'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="admin-grid-4">
        <MetricCard
          label="Total Authenticity Scans"
          value={timeframe === '24h' ? "48,210" : timeframe === '7d' ? "312,900" : "1,429,800"}
          icon={<TrendingUp size={20} color="#06b6d4" />}
        />
        <MetricCard
          label="Authenticity Trust Rate"
          value="99.42%"
          icon={<ShieldCheck size={20} color="#10b981" />}
        />
        <MetricCard
          label="Intercepted Counterfeits"
          value={timeframe === '24h' ? "12" : timeframe === '7d' ? "84" : "412"}
          icon={<AlertTriangle size={20} color="#ef4444" />}
        />
        <MetricCard
          label="Avg Dispute Resolution"
          value="1.2 hrs"
          icon={<Activity size={20} color="#8b5cf6" />}
        />
      </div>

      {/* Visual Analytics Cards */}
      <div className="admin-grid-2">
        {/* Verification Status Breakdown */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h4 className="admin-card-title">
              <PieChart size={18} color="#06b6d4" />
              Item Verification Outcomes ({timeframe.toUpperCase()})
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 6 }}>
                <span style={{ color: '#34d399', fontWeight: 600 }}>100% Genuine (Verified NFC / QR)</span>
                <span style={{ color: '#cbd5e1', fontWeight: 700 }}>96.2%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', height: 10, borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{ width: '96.2%', background: 'linear-gradient(90deg, #10b981, #34d399)', height: '100%' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 6 }}>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>Under Review / Secondary Inspection</span>
                <span style={{ color: '#cbd5e1', fontWeight: 700 }}>2.6%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', height: 10, borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{ width: '2.6%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', height: '100%' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 6 }}>
                <span style={{ color: '#f87171', fontWeight: 600 }}>Counterfeit / Tampered Hash</span>
                <span style={{ color: '#cbd5e1', fontWeight: 700 }}>1.2%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', height: 10, borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{ width: '1.2%', background: 'linear-gradient(90deg, #ef4444, #f87171)', height: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* User Ecosystem Distribution */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h4 className="admin-card-title">
              <Users size={18} color="#8b5cf6" />
              Ecosystem Participants & Roles
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Registered Buyers</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>18,420</div>
              <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: 2 }}>+14% this month</div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Verified Merchants / Sellers</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>1,240</div>
              <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: 2 }}>+8% this month</div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Certified Factories</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>186</div>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: 2 }}>100% On-Chain Verified</div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Active Moderators</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>24</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>24/7 Coverage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Authentic Factories Leaderboard */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h4 className="admin-card-title">
            <Award size={18} color="#f59e0b" />
            Top Performing Certified Factories
          </h4>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Factory Name</th>
                <th>Verified Items Issued</th>
                <th>Authenticity Integrity Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {TOP_FACTORIES.map(fac => (
                <tr key={fac.rank}>
                  <td style={{ fontWeight: 700, color: '#06b6d4', width: 60 }}>#{fac.rank}</td>
                  <td style={{ fontWeight: 600, color: '#f8fafc' }}>{fac.name}</td>
                  <td style={{ color: '#cbd5e1', fontWeight: 500 }}>{fac.itemsVerified.toLocaleString()} units</td>
                  <td>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>{fac.authenticityScore}%</span>
                  </td>
                  <td>
                    <StatusChip tone="success">{fac.status.toUpperCase()}</StatusChip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
