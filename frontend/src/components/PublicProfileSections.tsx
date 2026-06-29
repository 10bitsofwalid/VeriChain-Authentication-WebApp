import React, { memo, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Calendar, CheckCircle, Package, ShieldCheck, Star, TrendingUp, Users } from 'lucide-react';
import AnalyticsCard from './AnalyticsCard';
import EmptyState from './EmptyState';
import LazyImage from './LazyImage';
import { formatCurrency } from '../utils/format';
import { verificationBadge } from '../utils/badges';
import './PublicProfileSections.css';

export interface ScoreBreakdownItem {
  label: string;
  value: number;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingAuthority: string;
  status: string;
  expirationDate: string | null;
  certificateUrl?: string;
}

export interface FactoryProfileProduct {
  _id: string;
  imageUrl?: string;
  name: string;
  category: string;
  verifiedStatus: string;
  verifiedUnits: number;
  authenticityPercentage: number;
}

export interface SellerProfileProduct {
  _id: string;
  imageUrl?: string;
  name: string;
  brand: string;
  authenticityStatus: string;
  availableQuantity: number;
  price: number | null;
}

export interface Review {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  date: string;
}

interface HeaderStat {
  label: string;
  value: string | number;
}

const pageSize = 6;

export const PublicProfileHeader = memo(function PublicProfileHeader({
  logoUrl,
  name,
  verified,
  trustScore,
  badgeLabel,
  details,
}: {
  logoUrl?: string;
  name: string;
  verified: boolean;
  trustScore: number;
  badgeLabel: string;
  details: HeaderStat[];
}) {
  return (
    <header className="public-profile-header glass-card">
      <div className="public-profile-identity">
        <div className="public-profile-logo" aria-hidden={!logoUrl}>
          {logoUrl ? <LazyImage src={logoUrl} alt={`${name} logo`} /> : <ShieldCheck size={36} />}
        </div>
        <div>
          <div className="public-profile-badges">
            <span className={`badge ${verified ? 'badge-success' : 'badge-warning'}`}>
              <CheckCircle size={12} />
              {badgeLabel}
            </span>
          </div>
          <h1>{name}</h1>
        </div>
      </div>
      <div className="public-profile-header-stats" aria-label="Profile summary">
        <div className="trust-score-pill">
          <span>Trust Score</span>
          <strong>{trustScore}</strong>
        </div>
        {details.map((detail) => (
          <div key={detail.label} className="header-stat">
            <span>{detail.label}</span>
            <strong>{detail.value}</strong>
          </div>
        ))}
      </div>
    </header>
  );
});

export const TrustScoreCard = memo(function TrustScoreCard({
  title = 'Trust Score',
  trustScore,
  trustLevel,
  breakdown,
  rating,
}: {
  title?: string;
  trustScore: number;
  trustLevel: string;
  breakdown: ScoreBreakdownItem[];
  rating?: number;
}) {
  return (
    <section className="glass-card public-section" aria-labelledby="trust-score-heading">
      <div className="section-heading-row">
        <div>
          <h2 id="trust-score-heading">{title}</h2>
          <p>{trustLevel} public trust profile</p>
        </div>
        <div
          className="score-ring"
          style={{ '--score': trustScore } as React.CSSProperties}
          aria-label={`Overall trust score ${trustScore}`}
        >
          <span>{trustScore}</span>
        </div>
      </div>
      {rating !== undefined && (
        <div className="rating-row" aria-label={`Average rating ${rating}`}>
          <Star size={18} />
          <strong>{rating ? rating.toFixed(1) : 'No rating'}</strong>
        </div>
      )}
      <div className="score-breakdown">
        {breakdown.map((item) => (
          <div key={item.label} className="progress-row">
            <div>
              <span>{item.label}</span>
              <strong>{item.value}%</strong>
            </div>
            <progress value={item.value} max={100} aria-label={`${item.label} ${item.value}%`} />
          </div>
        ))}
      </div>
    </section>
  );
});

export const CertificationsTable = memo(function CertificationsTable({ certifications }: { certifications: Certification[] }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  return (
    <section className="public-section" aria-labelledby="certifications-heading">
      <h2 id="certifications-heading">Certifications</h2>
      {certifications.length === 0 ? (
        <EmptyState message="No public certifications are available yet." />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Certificate</th>
                <th>Issuing Authority</th>
                <th>Status</th>
                <th>Expiration</th>
              </tr>
            </thead>
            <tbody>
              {certifications.map((certification) => {
                const expired = now !== null && certification.expirationDate ? new Date(certification.expirationDate).getTime() < now : false;
                return (
                  <tr key={certification.id} className={expired ? 'expired-row' : undefined}>
                    <td>
                      {certification.certificateUrl ? (
                        <a href={certification.certificateUrl} target="_blank" rel="noreferrer">
                          {certification.name}
                        </a>
                      ) : certification.name}
                    </td>
                    <td>{certification.issuingAuthority}</td>
                    <td><span className={`badge ${expired ? 'badge-danger' : verificationBadge(certification.status)}`}>{expired ? 'expired' : certification.status}</span></td>
                    <td>{certification.expirationDate ? new Date(certification.expirationDate).toLocaleDateString() : 'No expiration provided'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
});

export const FactoryProductsGrid = memo(function FactoryProductsGrid({ products }: { products: FactoryProfileProduct[] }) {
  const [page, setPage] = useState(1);
  const visibleProducts = useMemo(() => products.slice((page - 1) * pageSize, page * pageSize), [page, products]);

  return (
    <PaginatedSection title="Verified Products" total={products.length} page={page} onPage={setPage}>
      {products.length === 0 ? (
        <EmptyState message="No verified products are public yet." />
      ) : (
        <div className="grid-cards profile-product-grid">
          {visibleProducts.map((product) => (
            <article key={product._id} className="glass-card profile-product-card">
              <ProductImage src={product.imageUrl} name={product.name} />
              <span className="badge badge-neutral">{product.category}</span>
              <h3>{product.name}</h3>
              <span className={`badge ${verificationBadge(product.verifiedStatus)}`}>Verified</span>
              <dl>
                <div><dt>Verified units</dt><dd>{product.verifiedUnits}</dd></div>
                <div><dt>Authenticity</dt><dd>{product.authenticityPercentage}%</dd></div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </PaginatedSection>
  );
});

export const SellerProductsGrid = memo(function SellerProductsGrid({ products }: { products: SellerProfileProduct[] }) {
  const [page, setPage] = useState(1);
  const visibleProducts = useMemo(() => products.slice((page - 1) * pageSize, page * pageSize), [page, products]);

  return (
    <PaginatedSection title="Products Sold" total={products.length} page={page} onPage={setPage}>
      {products.length === 0 ? (
        <EmptyState message="This seller has no public listings right now." />
      ) : (
        <div className="grid-cards profile-product-grid">
          {visibleProducts.map((product) => (
            <article key={product._id} className="glass-card profile-product-card">
              <ProductImage src={product.imageUrl} name={product.name} />
              <span className={`badge ${verificationBadge(product.authenticityStatus)}`}>{product.authenticityStatus}</span>
              <h3>{product.name}</h3>
              <dl>
                <div><dt>Brand</dt><dd>{product.brand}</dd></div>
                <div><dt>Available</dt><dd>{product.availableQuantity}</dd></div>
                <div><dt>Price</dt><dd>{product.price === null ? 'Not listed' : formatCurrency(product.price)}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </PaginatedSection>
  );
});

export const PublicTimeline = memo(function PublicTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <section className="public-section" aria-labelledby="timeline-heading">
      <h2 id="timeline-heading">Timeline</h2>
      {events.length === 0 ? (
        <EmptyState message="No public timeline events are available yet." />
      ) : (
        <ol className="public-timeline">
          {events.map((event) => (
            <li key={event.id} className="glass-card">
              <Calendar size={18} />
              <div>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <time dateTime={event.date}>{new Date(event.date).toLocaleDateString()}</time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
});

export const FactoryStatistics = memo(function FactoryStatistics({ statistics }: { statistics: Record<string, number> }) {
  return (
    <section className="public-section" aria-labelledby="factory-stats-heading">
      <h2 id="factory-stats-heading">Verification Statistics</h2>
      <div className="grid-stats">
        <AnalyticsCard icon={<Package size={22} />} title="Total Products" value={statistics.totalProducts} />
        <AnalyticsCard icon={<CheckCircle size={22} />} title="Verified Products" value={statistics.verifiedProducts} />
        <AnalyticsCard icon={<ShieldCheck size={22} />} title="Verification Requests" value={statistics.verificationRequests} />
        <AnalyticsCard icon={<TrendingUp size={22} />} title="Success Rate" value={`${statistics.successRate}%`} />
        <AnalyticsCard icon={<AlertTriangle size={22} />} title="Counterfeit Reports" value={statistics.counterfeitReports} />
        <AnalyticsCard icon={<Calendar size={22} />} title="Monthly Verifications" value={statistics.monthlyVerifications} />
      </div>
    </section>
  );
});

export const SellerStatistics = memo(function SellerStatistics({
  responseStatistics,
  salesStatistics,
}: {
  responseStatistics: Record<string, string | number>;
  salesStatistics: Record<string, number>;
}) {
  return (
    <>
      <section className="public-section" aria-labelledby="response-stats-heading">
        <h2 id="response-stats-heading">Response Statistics</h2>
        <div className="grid-stats">
          <AnalyticsCard icon={<Calendar size={22} />} title="Average Response Time" value={responseStatistics.averageResponseTime} />
          <AnalyticsCard icon={<Users size={22} />} title="Messages Answered" value={responseStatistics.messagesAnswered} />
          <AnalyticsCard icon={<Star size={22} />} title="Support Rating" value={responseStatistics.supportRating || 'No rating'} />
          <AnalyticsCard icon={<CheckCircle size={22} />} title="Order Completion Rate" value={`${responseStatistics.orderCompletionRate}%`} />
        </div>
      </section>
      <section className="public-section" aria-labelledby="sales-stats-heading">
        <h2 id="sales-stats-heading">Sales Statistics</h2>
        <div className="grid-stats">
          <AnalyticsCard icon={<Package size={22} />} title="Total Sales" value={salesStatistics.totalSales} />
          <AnalyticsCard icon={<ShieldCheck size={22} />} title="Verified Sales" value={salesStatistics.verifiedSales} />
          <AnalyticsCard icon={<CheckCircle size={22} />} title="Successful Orders" value={salesStatistics.successfulOrders} />
          <AnalyticsCard icon={<AlertTriangle size={22} />} title="Returned Orders" value={salesStatistics.returnedOrders} />
          <AnalyticsCard icon={<TrendingUp size={22} />} title="Monthly Growth" value={`${salesStatistics.monthlyGrowth}%`} />
        </div>
      </section>
    </>
  );
});

export const ReviewsList = memo(function ReviewsList({ reviews }: { reviews: Review[] }) {
  const [page, setPage] = useState(1);
  const visibleReviews = useMemo(() => reviews.slice((page - 1) * pageSize, page * pageSize), [page, reviews]);

  return (
    <PaginatedSection title="Reviews" total={reviews.length} page={page} onPage={setPage}>
      {reviews.length === 0 ? (
        <EmptyState message="No public customer reviews are available yet." />
      ) : (
        <div className="reviews-list">
          {visibleReviews.map((review) => (
            <article key={review.id} className="glass-card review-card">
              <div>
                <h3>{review.customer}</h3>
                <span><Star size={14} /> {review.rating.toFixed(1)}</span>
              </div>
              <p>{review.comment}</p>
              <time dateTime={review.date}>{new Date(review.date).toLocaleDateString()}</time>
            </article>
          ))}
        </div>
      )}
    </PaginatedSection>
  );
});

export function PublicProfileNotFound({ type }: { type: 'factory' | 'seller' }) {
  return (
    <main className="public-profile-page public-profile-centered" aria-labelledby="not-found-heading">
      <div className="glass-card public-404-card">
        <ShieldCheck size={40} />
        <h1 id="not-found-heading">404</h1>
        <p>{type === 'factory' ? 'Factory' : 'Seller'} profile not found.</p>
      </div>
    </main>
  );
}

function ProductImage({ src, name }: { src?: string; name: string }) {
  return (
    <div className="profile-product-image">
      {src ? <LazyImage src={src} alt={name} /> : <Package size={36} />}
    </div>
  );
}

function PaginatedSection({
  title,
  total,
  page,
  onPage,
  children,
}: {
  title: string;
  total: number;
  page: number;
  onPage: (page: number) => void;
  children: React.ReactNode;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className="public-section" aria-labelledby={`${title.toLowerCase().replace(/\s+/g, '-')}-heading`}>
      <div className="section-heading-row">
        <h2 id={`${title.toLowerCase().replace(/\s+/g, '-')}-heading`}>{title}</h2>
        {total > pageSize && (
          <div className="pagination-controls" aria-label={`${title} pagination`}>
            <button className="btn btn-secondary btn-sm" onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Next</button>
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
