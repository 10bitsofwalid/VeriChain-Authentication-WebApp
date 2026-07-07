import { lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const FactoryDashboard = lazy(() => import('./factory/FactoryDashboard'));
const SellerDashboard = lazy(() => import('./seller/SellerDashboard'));
const BuyerDashboard = lazy(() => import('./buyer/BuyerDashboard'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const ModeratorDashboard = lazy(() => import('./moderator/ModeratorDashboard'));

export default function Dashboard() {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'factory':
        return <FactoryDashboard />;
      case 'seller':
        return <SellerDashboard />;
      case 'buyer':
        return <BuyerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'moderator':
        return <ModeratorDashboard />;
      default:
        return <BuyerDashboard />;
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {renderDashboard()}
    </Suspense>
  );
}

