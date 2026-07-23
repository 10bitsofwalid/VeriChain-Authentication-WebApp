import type { ReactNode } from 'react';
import './layout.css';
import Breadcrumb from './Breadcrumb';

interface PageContainerProps {
  children: ReactNode;
  showBreadcrumb?: boolean;
}

export default function PageContainer({ children, showBreadcrumb = true }: PageContainerProps) {
  return (
    <div className="vc-page-container">
      {showBreadcrumb && <Breadcrumb />}
      <div className="vc-page-content">{children}</div>
    </div>
  );
}
