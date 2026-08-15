import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import {
  PublicProfileHeader,
  PublicProfileNotFound,
  ReviewsList,
  SellerProductsGrid,
  SellerStatistics,
  TrustScoreCard,
  formatDate,
  type Review,
  type ScoreBreakdownItem,
  type SellerProfileProduct,
} from '../components/PublicProfileSections';
import './MarketplaceHome.css';

interface SellerProfileData {
  name: string;
  logoUrl?: string;
  trustScore: number;
  trustLevel: string;
  averageRating: number;
  location: string;
  memberSince: string;
  verified: boolean;
  scoreBreakdown: ScoreBreakdownItem[];
  products: SellerProfileProduct[];
  responseStatistics: Record<string, string | number>;
  reviews: Review[];
  salesStatistics: Record<string, number>;
}

export default function SellerProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<SellerProfileData | null>(null);
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
        const response = await client.get(`/profiles/seller/${encodeURIComponent(id || '')}`);
        if (active) {
          setProfile(response.data.profile);
        }
      } catch (err: any) {
        if (!active) return;
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(err.response?.data?.message || 'Failed to load seller profile.');
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
          <PublicProfileNotFound type="seller" />
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
          badgeLabel={profile.verified ? 'Verified Seller' : 'Verification Pending'}
          details={[
            { label: 'Average Rating', value: profile.averageRating ? profile.averageRating.toFixed(1) : 'No rating' },
            { label: 'Location', value: profile.location },
            { label: 'Member Since', value: formatDate(profile.memberSince) },
          ]}
        />
        <TrustScoreCard
          title="Trust Card"
          trustScore={profile.trustScore}
          trustLevel={profile.trustLevel}
          rating={profile.averageRating}
          breakdown={profile.scoreBreakdown}
        />
        <SellerProductsGrid products={profile.products} />
        <SellerStatistics responseStatistics={profile.responseStatistics} salesStatistics={profile.salesStatistics} />
        <ReviewsList reviews={profile.reviews} />
      </main>

      <Footer />
    </div>
  );
}
