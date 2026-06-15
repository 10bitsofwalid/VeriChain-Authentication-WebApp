import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyItem from './pages/VerifyItem';
import Dashboard from './pages/Dashboard';
import RegisterProduct from './pages/factory/RegisterProduct';
import Marketplace from './pages/Marketplace';
import Complaints from './pages/Complaints';
import AuditLogs from './pages/admin/AuditLogs';
import SellerDashboard from './pages/seller/SellerDashboard';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import './index.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
      <Route path="/verify" element={<VerifyItem />} />

      {/* Protected routes — wrapped in Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/marketplace" element={<Marketplace />} />
        <Route path="/dashboard/complaints" element={<Complaints />} />
        <Route
          path="/dashboard/register-product"
          element={
            <ProtectedRoute roles={['factory']}>
              <RegisterProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/products"
          element={
            <ProtectedRoute roles={['factory']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/inventory"
          element={
            <ProtectedRoute roles={['seller']}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/my-items"
          element={
            <ProtectedRoute roles={['buyer']}>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/audit-logs"
          element={
            <ProtectedRoute roles={['admin']}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/products-admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
