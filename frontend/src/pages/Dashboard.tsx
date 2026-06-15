import { useAuth } from '../context/AuthContext';
import FactoryDashboard from './factory/FactoryDashboard';
import SellerDashboard from './seller/SellerDashboard';
import BuyerDashboard from './buyer/BuyerDashboard';
import AdminDashboard from './admin/AdminDashboard';
import ModeratorDashboard from './moderator/ModeratorDashboard';

export default function Dashboard() {
  const { user } = useAuth();

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
}
