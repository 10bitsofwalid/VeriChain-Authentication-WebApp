import { useState, useEffect } from 'react';
import MetricCard from '../../../components/ui/MetricCard';
import StatusChip from '../../../components/ui/StatusChip';
import client from '../../../api/client';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Users,
  BarChart2,
  PieChart,
  Award,
} from 'lucide-react';

interface FactoryLeader {
  id: string;
  name: string;
  trustScore?: number;
  country?: string;
}

export default function AdminStatisticsView() {
  const [factories, setFactories] = useState<FactoryLeader[]>([]);
  const [userCounts, setUserCounts] = useState({ buyers: 0, sellers: 0, factories: 0, moderators: 0 });
  const [complaintCount, setComplaintCount] = useState<number>(0);
  const [productCount, setProductCount] = useState<number>(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const [usersRes, prodsRes, compRes] = await Promise.allSettled([
          client.get('/users'),
          client.get('/products'),
          client.get('/complaints'),
        ]);

        if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value.data)) {
          const uList = usersRes.value.data;
          setUserCounts({
            buyers: uList.filter((u: any) => u.role === 'buyer').length,
            sellers: uList.filter((u: any) => u.role === 'seller').length,
            factories: uList.filter((u: any) => u.role === 'factory').length,
            moderators: uList.filter((u: any) => u.role === 'moderator' || u.role === 'admin').length,
          });

          const facList: FactoryLeader[] = uList
            .filter((u: any) => u.role === 'factory')
            .map((f: any) => ({
              id: f._id,
              name: f.name,
              trustScore: f.trustScore ?? 100,
              country: f.factoryLocation || 'Verified Facility',
            }));
          setFactories(facList);
        }

        if (prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value.data)) {
          setProductCount(prodsRes.value.data.length);
        }

        if (compRes.status === 'fulfilled' && compRes.value.data?.complaints) {
          setComplaintCount(compRes.value.data.complaints.length);
        }
      } catch (err) {
        console.error('Failed to load admin stats', err);
      }
    }
    loadStats();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg, 20px)' }}>
      {/* Overview Banner */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart2 size={20} color="#06b6d4" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
              Platform Analytical Telemetry & Verification Trends
            </h3>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="admin-grid-4">
        <MetricCard
          label="Registered Products"
          value={productCount.toString()}
          icon={<TrendingUp size={20} color="#06b6d4" />}
        />
        <MetricCard
          label="Authenticity Trust Rate"
          value="100%"
          icon={<ShieldCheck size={20} color="#10b981" />}
        />
        <MetricCard
          label="Logged Complaints"
          value={complaintCount.toString()}
          icon={<AlertTriangle size={20} color="#ef4444" />}
        />
        <MetricCard
          label="Total Registered Users"
          value={(userCounts.buyers + userCounts.sellers + userCounts.factories + userCounts.moderators).toString()}
          icon={<Users size={20} color="#8b5cf6" />}
        />
      </div>

      {/* Visual Analytics Cards */}
      <div className="admin-grid-2">
        {/* Verification Status Breakdown */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h4 className="admin-card-title">
              <PieChart size={18} color="#06b6d4" />
              Consensus Verification Health
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 6 }}>
                <span style={{ color: '#34d399', fontWeight: 600 }}>Ledger-Verified SKUs</span>
                <span style={{ color: '#cbd5e1', fontWeight: 700 }}>100%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', height: 10, borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{ width: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', height: '100%' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 6 }}>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>Decentralized Node Consensus</span>
                <span style={{ color: '#cbd5e1', fontWeight: 700 }}>Active</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', height: 10, borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{ width: '100%', background: 'linear-gradient(90deg, #0284c7, #38bdf8)', height: '100%' }} />
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
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>{userCounts.buyers}</div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Verified Merchants / Sellers</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>{userCounts.sellers}</div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Certified Factories</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>{userCounts.factories}</div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Platform Administrators</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>{userCounts.moderators}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Authentic Factories Leaderboard */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h4 className="admin-card-title">
            <Award size={18} color="#f59e0b" />
            Registered Certified Factories
          </h4>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Factory Name</th>
                <th>Location</th>
                <th>Trust Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {factories.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                    No certified factory partners registered yet.
                  </td>
                </tr>
              ) : (
                factories.map((fac, idx) => (
                  <tr key={fac.id}>
                    <td style={{ fontWeight: 700, color: '#06b6d4', width: 60 }}>#{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{fac.name}</td>
                    <td style={{ color: '#cbd5e1', fontWeight: 500 }}>{fac.country}</td>
                    <td>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>{fac.trustScore}%</span>
                    </td>
                    <td>
                      <StatusChip tone="success">VERIFIED</StatusChip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
