import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import {
  CertificationsTable,
  FactoryProductsGrid,
  FactoryStatistics,
  PublicProfileHeader,
  PublicProfileNotFound,
  PublicTimeline,
  TrustScoreCard,
  formatDate,
  type Certification,
  type FactoryProfileProduct,
  type ScoreBreakdownItem,
  type TimelineEvent,
} from '../components/PublicProfileSections';
import './MarketplaceHome.css';

interface FactoryProfileData {
  name: string;
  logoUrl?: string;
  verified: boolean;
  country: string;
  joinedDate: string;
  trustScore: number;
  trustLevel: string;
  verificationStatus: string;
  scoreBreakdown: ScoreBreakdownItem[];
  certifications: Certification[];
  products: FactoryProfileProduct[];
  timeline: TimelineEvent[];
  statistics: Record<string, number>;
}

export default function FactoryProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<FactoryProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function fetchProfile() {
      setLoading(true);
      setError('');
      setNotFound(false);

      try {
        const response = await client.get(`/profiles/factory/${encodeURIComponent(id || '')}`);
        if (active) {
          setProfile(response.data.profile);
        }
      } catch (err: any) {
        if (!active) return;
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(err.response?.data?.message || 'Failed to load factory profile.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProfile();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="marketplace-home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavBar />
        <main className="page-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="marketplace-home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavBar />
        <main className="page-container" style={{ flex: 1 }}>
          <PublicProfileNotFound type="factory" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="marketplace-home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavBar />
        <main className="page-container" style={{ flex: 1 }}>
          <div className="alert alert-error" role="alert">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="marketplace-home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />

      <main className="page-container public-profile-page" style={{ flex: 1, padding: 'var(--space-xl) var(--space-md)' }}>
        <PublicProfileHeader
          logoUrl={profile.logoUrl}
          name={profile.name}
          verified={profile.verified}
          trustScore={profile.trustScore}
          badgeLabel={profile.verified ? 'Verified Factory' : 'Verification Pending'}
          details={[
            { label: 'Country', value: profile.country },
            { label: 'Joined', value: formatDate(profile.joinedDate) },
            { label: 'Status', value: profile.verificationStatus },
          ]}
        />
        <TrustScoreCard
          trustScore={profile.trustScore}
          trustLevel={profile.trustLevel}
          breakdown={profile.scoreBreakdown}
        />
        <CertificationsTable certifications={profile.certifications} />
        <FactoryProductsGrid products={profile.products} />
        <PublicTimeline events={profile.timeline} />
        <FactoryStatistics statistics={profile.statistics} />
      </main>

      <Footer />
    </div>
  );
}
