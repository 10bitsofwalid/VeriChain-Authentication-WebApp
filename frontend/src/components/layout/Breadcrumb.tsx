import { NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './layout.css';

interface BreadcrumbItem {
  name: string;
  path: string;
}

export default function Breadcrumb() {
  const location = useLocation();
  const pathname = location.pathname;
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: BreadcrumbItem[] = [];
  let accumulatedPath = '';
  segments.forEach((segment) => {
    accumulatedPath += `/${segment}`;
    const name = segment
      .replace(/-/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase());
    crumbs.push({ name, path: accumulatedPath });
  });
  if (crumbs.length === 0) return null;
  return (
    <nav className="vc-breadcrumb" aria-label="breadcrumb">
      <ol className="vc-breadcrumb-list">
        {crumbs.map((crumb, idx) => (
          <li key={crumb.path} className="vc-breadcrumb-item">
            {idx < crumbs.length - 1 ? (
              <NavLink to={crumb.path} className="vc-breadcrumb-link">
                {crumb.name}
              </NavLink>
            ) : (
              <span className="vc-breadcrumb-current" aria-current="page">
                {crumb.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
