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
  segments.forEach((segment, idx) => {
    accumulatedPath += `/${segment}`;
    let name = segment
      .replace(/-/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase());

    // Check if segment is a 24-character hex MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(segment)) {
      const prevSegment = idx > 0 ? segments[idx - 1].toLowerCase() : '';
      if (prevSegment === 'product') {
        name = `Product #${segment.slice(-6).toUpperCase()}`;
      } else if (prevSegment === 'seller') {
        name = `Seller #${segment.slice(-6).toUpperCase()}`;
      } else if (prevSegment === 'factory') {
        name = `Factory #${segment.slice(-6).toUpperCase()}`;
      } else if (prevSegment === 'orders' || prevSegment === 'order') {
        name = `Order #${segment.slice(-6).toUpperCase()}`;
      } else {
        name = `#${segment.slice(0, 4)}...${segment.slice(-4).toUpperCase()}`;
      }
    }

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
