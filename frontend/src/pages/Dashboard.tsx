import { useAuth } from '../context/AuthContext';
import FactoryDashboard from './factory/FactoryDashboard';
import SellerDashboard from './seller/SellerDashboard';
import BuyerDashboard from './buyer/BuyerDashboard';
import AdminDashboard from './admin/AdminDashboard';

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
    case 'moderator':
      return <AdminDashboard />;
    default:
      return <BuyerDashboard />;
  }
}
