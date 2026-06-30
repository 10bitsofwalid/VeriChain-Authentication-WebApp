import type { ReactNode } from 'react';
import './layout.css';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="vc-page-header">
      <div>
        {eyebrow && <span className="vc-page-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="vc-page-actions">{actions}</div>}
    </div>
  );
}
