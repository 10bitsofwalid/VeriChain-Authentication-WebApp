import React from 'react';
import PageLoader from './ui/PageLoader';
import EmptyState from './ui/EmptyState';
import { CheckCircle } from 'lucide-react';

interface AnalyticsSectionProps {
  title: string;
  description?: string;
  loading?: boolean;
  empty?: boolean;
  children: React.ReactNode;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  title,
  description,
  loading = false,
  empty = false,
  children,
}) => {
  return (
    <section className="analytics-section" style={{ marginBottom: 'var(--space-xl)' }}>
      <header style={{ marginBottom: 'var(--space-sm)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{title}</h2>
        {description && <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{description}</p>}
      </header>
      {loading ? (
        <PageLoader style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-lg)' }} />
      ) : empty ? (
        <EmptyState icon={CheckCircle} title={`No ${title.toLowerCase()} available.`} message="" />
      ) : (
        <div className="section-content" style={{ display: 'grid', gap: 'var(--space-lg)', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {children}
        </div>
      )}
    </section>
  );
};

export default AnalyticsSection;
