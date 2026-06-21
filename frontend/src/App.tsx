import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/ToastProvider';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { ShoppingProvider } from './context/ShoppingContext';

// Lazy-loaded page components
const Landing = lazy(() => import('./pages/Landing'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const VerifyItem = lazy(() => import('./pages/VerifyItem'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const RegisterProduct = lazy(() => import('./pages/factory/RegisterProduct'));
const MarketplaceHome = lazy(() => import('./pages/MarketplaceHome'));
const Complaints = lazy(() => import('./pages/Complaints'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'));
const BuyerDashboard = lazy(() => import('./pages/buyer/BuyerDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AcceptInvite = lazy(() => import('./pages/AcceptInvite'));
const InviteAdmin = lazy(() => import('./pages/admin/InviteAdmin'));
const ModeratorDashboard = lazy(() => import('./pages/moderator/ModeratorDashboard'));

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
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <MarketplaceHome />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
      <Route path="/verify" element={<VerifyItem />} />
      <Route path="/product/:id" element={<ProductDetailsPage />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />

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
          path="/dashboard/invite"
          element={
            <ProtectedRoute roles={['admin']}>
              <InviteAdmin />
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
        <Route
          path="/dashboard/product-verification"
          element={
            <ProtectedRoute roles={['moderator', 'admin']}>
              <ModeratorDashboard defaultTab="verification" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/complaints-moderator"
          element={
            <ProtectedRoute roles={['moderator', 'admin']}>
              <ModeratorDashboard defaultTab="complaints" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/fake-listings"
          element={
            <ProtectedRoute roles={['moderator', 'admin']}>
              <ModeratorDashboard defaultTab="fake-listings" />
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
        <ShoppingProvider>
          <ToastProvider>
            <ErrorBoundary fallback={<div className="glass-card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>Something went wrong.</div>}>
              <Suspense fallback={<LoadingSpinner />}>
                <AppRoutes />
              </Suspense>
            </ErrorBoundary>
          </ToastProvider>
        </ShoppingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
