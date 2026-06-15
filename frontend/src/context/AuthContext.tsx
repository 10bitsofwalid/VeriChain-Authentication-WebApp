import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import client from '../api/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'factory' | 'moderator' | 'admin';
  verified: boolean;
  trustScore?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  acceptInvitation: (inviteToken: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: string;
  factoryLocation?: string;
  factoryCapacity?: string;
  factoryCertificateNo?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('verichain_token');
    const storedUser = localStorage.getItem('verichain_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('verichain_token');
        localStorage.removeItem('verichain_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const res = await client.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;

      localStorage.setItem('verichain_token', newToken);
      localStorage.setItem('verichain_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const signup = async (data: SignupData) => {
    try {
      setError(null);
      const res = await client.post('/auth/signup', data);
      const { token: newToken, user: userData } = res.data;

      localStorage.setItem('verichain_token', newToken);
      localStorage.setItem('verichain_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const acceptInvitation = async (inviteToken: string, password: string) => {
    try {
      setError(null);
      const res = await client.post('/auth/accept-invite', { token: inviteToken, password });
      const { token: newToken, user: userData } = res.data;

      localStorage.setItem('verichain_token', newToken);
      localStorage.setItem('verichain_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Accepting invitation failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('verichain_token');
    localStorage.removeItem('verichain_user');
    setToken(null);
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, acceptInvitation, logout, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
