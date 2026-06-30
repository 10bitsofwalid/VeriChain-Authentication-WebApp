import type { ReactNode } from 'react';
import './layout.css';

interface SectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export default function Section({ title, description, children }: SectionProps) {
  return (
    <section className="vc-section">
      {(title || description) && (
        <div className="vc-section-header">
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
