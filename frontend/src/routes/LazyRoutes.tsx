import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

// Define heavy route components lazily
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Marketplace = lazy(() => import('../pages/Marketplace'));
const ProductDetailsPage = lazy(() => import('../pages/ProductDetailsPage'));
const AIHome = lazy(() => import('../pages/ai/AIHome'));
const CommunityHome = lazy(() => import('../pages/community/CommunityHome'));

/**
 * LazyRoutes component groups heavy routes and loads them on demand.
 * It should be used inside the main router.
 */
const LazyRoutes: React.FC = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/marketplace/*" element={<Marketplace />} />
      <Route path="/product/:id" element={<ProductDetailsPage />} />
      <Route path="/ai/*" element={<AIHome />} />
      <Route path="/community/*" element={<CommunityHome />} />
    </Routes>
  </Suspense>
);

export default LazyRoutes;
