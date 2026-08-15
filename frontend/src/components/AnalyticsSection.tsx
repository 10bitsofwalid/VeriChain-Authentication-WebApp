import React from 'react';
import PageLoader from './ui/PageLoader';
import EmptyState from './ui/EmptyState';
import { CheckCircle } from 'lucide-react';

interface AnalyticsSectionProps {
  title: string;
  description?: string;
  loading?: boolean;
  empty?: boolean;
  layout?: 'grid' | 'block';
  children: React.ReactNode;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  title,
  description,
  loading = false,
  empty = false,
  layout = 'grid',
  children,
}) => {
  return (
    <section className="analytics-section" style={{ marginBottom: 'var(--space-xl)' }}>
      <header style={{ marginBottom: 'var(--space-sm)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{title}</h2>
        {description && <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{description}</p>}
      </header>
      {loading ? (
        <PageLoader style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-lg)' }} />
      ) : empty ? (
        <EmptyState icon={CheckCircle} title={`No ${title.toLowerCase()} available.`} message="" />
      ) : layout === 'grid' ? (
        <div className="section-content" style={{ display: 'grid', gap: 'var(--space-md)', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {children}
        </div>
      ) : (
        <div className="section-content-block" style={{ width: '100%' }}>
          {children}
        </div>
      )}
    </section>
  );
};

export default AnalyticsSection;
