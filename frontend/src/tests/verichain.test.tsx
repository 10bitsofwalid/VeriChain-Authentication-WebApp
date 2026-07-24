import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { ShoppingProvider } from '../context/ShoppingContext';
import { ToastProvider } from '../components/ToastProvider';

// Pages & Components
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import AcceptInvite from '../pages/AcceptInvite';

import Marketplace from '../pages/Marketplace';
import ProductDetailsPage from '../pages/ProductDetailsPage';

import VerifyItem from '../pages/VerifyItem';
import VerificationActivity from '../pages/VerificationActivity';

import SellerDashboard from '../pages/seller/SellerDashboard';
import SellerSourcing from '../pages/seller/SellerSourcing';

import FactoryDashboard from '../pages/factory/FactoryDashboard';
import RegisterProduct from '../pages/factory/RegisterProduct';

import BuyerDashboard from '../pages/buyer/BuyerDashboard';
import CartPage from '../pages/buyer/CartPage';
import CheckoutPage from '../pages/buyer/CheckoutPage';
import WishlistPage from '../pages/buyer/WishlistPage';

import RecallManagementView from '../pages/recalls/RecallManagementView';

import OrderManagement from '../pages/OrderManagement';
import OrdersPage from '../pages/buyer/OrdersPage';

import Complaints from '../pages/Complaints';

import TopNavbar from '../components/layout/TopNavbar';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AuditLogs from '../pages/admin/AuditLogs';

import client from '../api/client';

// Mock the API client
vi.mock('../api/client', () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    },
  };
});

const renderWithProviders = (
  ui: React.ReactElement,
  { user = null }: { user?: any } = {}
) => {
  if (user) {
    localStorage.setItem('verichain_token', 'mock-token-xyz');
    localStorage.setItem('verichain_user', JSON.stringify(user));
  } else {
    localStorage.clear();
  }

  return render(
    <BrowserRouter>
      <AuthProvider>
        <ShoppingProvider>
          <ToastProvider>
            {ui}
          </ToastProvider>
        </ShoppingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('VeriChain Comprehensive Application Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ==========================================
  // 1. AUTHENTICATION MODULE TESTS
  // ==========================================
  describe('1. Authentication Module', () => {
    it('should render Login page correctly and handle form input', () => {
      renderWithProviders(<Login />);
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should submit authentication request on login', async () => {
      (client.post as any).mockResolvedValue({
        data: {
          success: true,
          token: 'jwt-12345',
          user: { id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'buyer' },
        },
      });

      renderWithProviders(<Login />);
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
        target: { value: 'alice@test.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'secret123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(client.post).toHaveBeenCalledWith('/auth/login', {
          email: 'alice@test.com',
          password: 'secret123',
        });
      });
    });

    it('should render Signup page and show role selection', () => {
      renderWithProviders(<Signup />);
      expect(screen.getAllByText('Create Account')[0]).toBeInTheDocument();
      expect(screen.getByLabelText(/I am a.../i)).toBeInTheDocument();
    });

    it('should render AcceptInvite page correctly', () => {
      renderWithProviders(<AcceptInvite />);
      expect(screen.getByRole('button', { name: /Activate Account/i })).toBeInTheDocument();
    });
  });

  // ==========================================
  // 2. MARKETPLACE MODULE TESTS
  // ==========================================
  describe('2. Marketplace Module', () => {
    it('should fetch and render marketplace catalog items', async () => {
      (client.get as any).mockResolvedValue({
        data: {
          success: true,
          items: [
            {
              _id: 'm1',
              serialNumber: 'VC-MKT-001',
              status: 'listed',
              counterfeitRisk: 'low',
              product: {
                _id: 'p1',
                name: 'Luxury Watch',
                sku: 'SKU-WATCH-01',
                imageUrl: 'https://example.com/watch.jpg',
                category: 'Accessories',
                verifiedStatus: 'verified',
              },
              currentOwner: { _id: 's1', name: 'Chrono Store', role: 'seller' },
            },
          ],
        },
      });

      renderWithProviders(<Marketplace />);

      await waitFor(() => {
        expect(client.get).toHaveBeenCalledWith('/items/marketplace');
      });

      await waitFor(() => {
        expect(screen.getByText('Luxury Watch')).toBeInTheDocument();
      });
    });

    it('should render ProductDetailsPage header and tabs', async () => {
      (client.get as any).mockResolvedValue({
        data: {
          success: true,
          product: {
            _id: 'p1',
            name: 'High-End Headphones',
            sku: 'SKU-AUDIO-99',
            description: 'Audiophile grade wireless headphones',
            category: 'Audio',
            imageUrl: 'https://example.com/hp.jpg',
            verifiedStatus: 'verified',
            factory: { name: 'SoundCorp', location: 'Tokyo' },
          },
        },
      });

      renderWithProviders(<ProductDetailsPage />);
      await waitFor(() => {
        expect(screen.getAllByText(/Passport|Product|Overview/i)[0]).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // 3. VERIFICATION MODULE TESTS
  // ==========================================
  describe('3. Verification Module', () => {
    it('should allow public verification lookup by serial number', async () => {
      (client.get as any).mockResolvedValue({
        data: {
          success: true,
          verified: true,
          item: {
            serialNumber: 'VC-VER-777',
            status: 'sold',
            counterfeitRisk: 'low',
            manufacturedAt: '2026-01-01T00:00:00.000Z',
            product: {
              name: 'Designer Handbag',
              sku: 'SKU-BAG-01',
              category: 'Fashion',
              imageUrl: '',
              verifiedStatus: 'verified',
            },
            currentOwner: { name: 'Elena', role: 'buyer' },
            journey: [],
          },
        },
      });

      renderWithProviders(<VerifyItem />);
      const searchInput = screen.getByPlaceholderText(/Enter Serial Number/i);
      fireEvent.change(searchInput, { target: { value: 'VC-VER-777' } });
      fireEvent.click(screen.getByRole('button', { name: /^verify$/i }));

      await waitFor(() => {
        expect(client.get).toHaveBeenCalledWith('/items/verify/VC-VER-777');
      });

      await waitFor(() => {
        expect(screen.getByText('Authentic Product')).toBeInTheDocument();
        expect(screen.getByText('Designer Handbag')).toBeInTheDocument();
      });
    });

    it('should render VerificationActivity timeline page', () => {
      renderWithProviders(<VerificationActivity />);
      expect(screen.getAllByText(/Verification/i)[0]).toBeInTheDocument();
    });
  });

  // ==========================================
  // 4. SELLER MODULE TESTS
  // ==========================================
  describe('4. Seller Module', () => {
    it('should render SellerDashboard with navigation tabs', async () => {
      renderWithProviders(<SellerDashboard />, {
        user: { id: 's1', name: 'Seller Outlet', role: 'seller' },
      });
      await waitFor(() => {
        expect(screen.getAllByText(/Seller|Merchant|Inventory|Overview/i)[0]).toBeInTheDocument();
      });
    });

    it('should render SellerSourcing page with factory catalog', async () => {
      (client.get as any).mockResolvedValue({
        data: { success: true, factories: [] },
      });

      renderWithProviders(<SellerSourcing />, {
        user: { id: 's1', name: 'Seller Outlet', role: 'seller' },
      });

      await waitFor(() => {
        expect(screen.getAllByText(/Sourcing|Factory|Direct/i)[0]).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // 5. FACTORY MODULE TESTS
  // ==========================================
  describe('5. Factory Module', () => {
    it('should render FactoryDashboard with control metrics', () => {
      renderWithProviders(<FactoryDashboard />, {
        user: { id: 'f1', name: 'Apex Manufacturing', role: 'factory' },
      });
      expect(screen.getAllByText(/Factory/i)[0]).toBeInTheDocument();
    });

    it('should render RegisterProduct page form', () => {
      renderWithProviders(<RegisterProduct />, {
        user: { id: 'f1', name: 'Apex Manufacturing', role: 'factory' },
      });
      expect(screen.getAllByText(/Register/i)[0]).toBeInTheDocument();
    });
  });

  // ==========================================
  // 6. BUYER MODULE TESTS
  // ==========================================
  describe('6. Buyer Module', () => {
    it('should render BuyerDashboard for authenticated buyer', async () => {
      (client.get as any).mockResolvedValue({
        data: { success: true, items: [], complaints: [] },
      });

      renderWithProviders(<BuyerDashboard />, {
        user: { id: 'b1', name: 'Bob Buyer', role: 'buyer' },
      });

      await waitFor(() => {
        expect(screen.getAllByText(/Dashboard|Buyer|Asset|Product/i)[0]).toBeInTheDocument();
      });
    });

    it('should render CartPage correctly', () => {
      renderWithProviders(<CartPage />);
      expect(screen.getAllByText(/Cart/i)[0]).toBeInTheDocument();
    });

    it('should render CheckoutPage correctly', () => {
      renderWithProviders(<CheckoutPage />);
      expect(screen.getAllByText(/Checkout/i)[0]).toBeInTheDocument();
    });

    it('should render WishlistPage correctly', () => {
      renderWithProviders(<WishlistPage />);
      expect(screen.getAllByText(/Wishlist/i)[0]).toBeInTheDocument();
    });
  });

  // ==========================================
  // 7. RECALL MODULE TESTS
  // ==========================================
  describe('7. Recall Module', () => {
    it('should render RecallManagementView with recall alerts and batch lookup', () => {
      renderWithProviders(<RecallManagementView />);
      expect(screen.getAllByText(/Recall/i)[0]).toBeInTheDocument();
    });
  });

  // ==========================================
  // 8. ORDERS MODULE TESTS
  // ==========================================
  describe('8. Orders Module', () => {
    it('should render OrderManagement page with order statuses', () => {
      renderWithProviders(<OrderManagement />);
      expect(screen.getAllByText(/Order/i)[0]).toBeInTheDocument();
    });

    it('should render Buyer OrdersPage', () => {
      renderWithProviders(<OrdersPage />, {
        user: { id: 'b1', name: 'Bob Buyer', role: 'buyer' },
      });
      expect(screen.getAllByText(/Orders/i)[0]).toBeInTheDocument();
    });
  });

  // ==========================================
  // 9. COMPLAINTS MODULE TESTS
  // ==========================================
  describe('9. Complaints Module', () => {
    it('should render Complaints dispute filing page', async () => {
      (client.get as any).mockResolvedValue({
        data: { success: true, complaints: [] },
      });

      renderWithProviders(<Complaints />);

      await waitFor(() => {
        expect(screen.getAllByText(/Complaint/i)[0]).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // 10. NOTIFICATIONS MODULE TESTS
  // ==========================================
  describe('10. Notifications Module', () => {
    it('should render TopNavbar notification button and quick verify button', () => {
      renderWithProviders(
        <TopNavbar user={{ id: 'u1', name: 'User 1', email: 'u1@test.com', role: 'buyer', verified: true }} onMenuClick={() => {}} />
      );
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
      expect(screen.getByText(/Quick Verify/i)).toBeInTheDocument();
    });
  });

  // ==========================================
  // 11. ADMIN MODULE TESTS
  // ==========================================
  describe('11. Admin Module', () => {
    it('should render AdminDashboard with governance tabs', () => {
      renderWithProviders(<AdminDashboard />, {
        user: { id: 'a1', name: 'Super Admin', role: 'admin' },
      });
      expect(screen.getAllByText(/Admin/i)[0]).toBeInTheDocument();
      expect(screen.getByText('Mission')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('should render AuditLogs page', async () => {
      (client.get as any).mockResolvedValue({
        data: { success: true, logs: [], pagination: { page: 1, limit: 20, total: 0, pages: 1 } },
      });

      renderWithProviders(<AuditLogs />, {
        user: { id: 'a1', name: 'Super Admin', role: 'admin' },
      });

      await waitFor(() => {
        expect(screen.getAllByText(/Audit/i)[0]).toBeInTheDocument();
      });
    });
  });
});
