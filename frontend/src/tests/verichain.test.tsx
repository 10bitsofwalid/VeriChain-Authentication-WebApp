import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ShoppingProvider } from '../context/ShoppingContext';
import Login from '../pages/Login';
import VerifyItem from '../pages/VerifyItem';
import Marketplace from '../pages/Marketplace';
import client from '../api/client';

// Mock the API client
vi.mock('../api/client', () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe('VeriChain Frontend Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Smoke Test & Login Form Rendering', () => {
    it('should render the login form correctly', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      // Verify page titles and labels exist
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('2. Authentication Interaction Flow', () => {
    it('should update inputs on typing and attempt API login', async () => {
      // Mock successful login response
      (client.post as any).mockResolvedValue({
        data: {
          success: true,
          token: 'mock-jwt-token-xyz',
          user: {
            id: 'buyer123',
            name: 'John Doe',
            email: 'john@gmail.com',
            role: 'buyer',
            verified: true,
          },
        },
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Simulate user inputs
      fireEvent.change(emailInput, { target: { value: 'john@gmail.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(emailInput).toHaveValue('john@gmail.com');
      expect(passwordInput).toHaveValue('password123');

      // Submit form
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(client.post).toHaveBeenCalledWith('/auth/login', {
          email: 'john@gmail.com',
          password: 'password123',
        });
      });
    });
  });

  describe('3. Public Verification Lookup Flow', () => {
    it('should allow users to verify a product by serial number', async () => {
      // Mock successful verification lookup
      (client.get as any).mockResolvedValue({
        data: {
          success: true,
          verified: true,
          item: {
            serialNumber: 'VC-SKU-10001',
            status: 'sold',
            counterfeitRisk: 'low',
            manufacturedAt: '2026-06-15T00:00:00.000Z',
            product: {
              name: 'Premium Headphones',
              sku: 'SKU-HEADPHONE',
              category: 'Audio',
              imageUrl: 'https://verichain.io/headphones.jpg',
              certificateUrl: 'https://ipfs.io/ipfs/QmHeadphone',
              verifiedStatus: 'verified',
            },
            currentOwner: { name: 'Alice', role: 'buyer' },
            journey: [],
          },
        },
      });

      render(
        <BrowserRouter>
          <VerifyItem />
        </BrowserRouter>
      );

      const searchInput = screen.getByPlaceholderText(/Enter Serial Number/i);
      const searchButton = screen.getByRole('button', { name: /^verify$/i });

      // Search for mock serial number
      fireEvent.change(searchInput, { target: { value: 'VC-SKU-10001' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(client.get).toHaveBeenCalledWith('/items/verify/VC-SKU-10001');
      });

      // Verify that the UI displays product info
      await waitFor(() => {
        expect(screen.getByText('Authentic Product')).toBeInTheDocument();
        expect(screen.getByText('Premium Headphones')).toBeInTheDocument();
        expect(screen.getByText('VC-SKU-10001')).toBeInTheDocument();
      });
    });
  });

  describe('4. Marketplace Catalog Rendering Flow', () => {
    it('should fetch and render listed marketplace items', async () => {
      // Mock fetching listed items
      (client.get as any).mockResolvedValue({
        data: {
          success: true,
          items: [
            {
              _id: 'item1',
              serialNumber: 'VC-TST-3001',
              status: 'listed',
              counterfeitRisk: 'low',
              product: {
                _id: 'prod1',
                name: 'Genuine Sunglasses',
                sku: 'SUN-GLASS-01',
                imageUrl: 'https://verichain.io/sun.jpg',
                category: 'Apparel',
                verifiedStatus: 'verified',
              },
              currentOwner: { _id: 'seller123', name: 'Sunny Store', role: 'seller' },
            },
          ],
        },
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <ShoppingProvider>
              <Marketplace />
            </ShoppingProvider>
          </AuthProvider>
        </BrowserRouter>
      );

      // Verify it fetches items from marketplace endpoint
      await waitFor(() => {
        expect(client.get).toHaveBeenCalledWith('/items/marketplace');
      });

      // Verify that items are listed in marketplace UI
      await waitFor(() => {
        expect(screen.getByText('Genuine Sunglasses')).toBeInTheDocument();
        expect(screen.getByText('Sunny Store')).toBeInTheDocument();
      });
    });
  });
});
