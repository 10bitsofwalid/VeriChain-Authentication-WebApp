import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import client from '../api/client';
import { STORAGE_KEYS } from '../utils/constants';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'factory' | 'moderator' | 'admin';
  verified: boolean;
  isVerified?: boolean;
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
  refreshUser: () => Promise<User | null>;
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

  const normalizeUser = (raw: any): User => {
    const isVer = Boolean(raw.verified ?? raw.isVerified ?? false);
    return {
      id: raw.id || raw._id,
      _id: raw._id || raw.id,
      name: raw.name,
      email: raw.email,
      role: raw.role,
      verified: isVer,
      isVerified: isVer,
      trustScore: raw.trustScore,
    };
  };

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!storedToken) return null;
      const res = await client.get('/auth/me');
      if (res.data?.user) {
        const freshUser = normalizeUser(res.data.user);
        setUser(freshUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));
        return freshUser;
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        setUser(null);
        setToken(null);
      }
    }
    return null;
  }, []);

  // Restore session on mount and sync live status from DB
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(normalizeUser(JSON.parse(storedUser)));
      } catch {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
    setLoading(false);

    if (storedToken) {
      refreshUser();
    }
  }, [refreshUser]);

  // Auto-sync user status when window/tab regains focus, visibility, or periodically
  useEffect(() => {
    const handleSync = () => {
      if (localStorage.getItem(STORAGE_KEYS.TOKEN)) {
        refreshUser();
      }
    };

    window.addEventListener('focus', handleSync);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleSync();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Heartbeat sync every 30s to keep live status in sync without unnecessary overhead
    const intervalId = window.setInterval(handleSync, 30000);

    return () => {
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const res = await client.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;
      const normalized = normalizeUser(userData);

      localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalized));
      setToken(newToken);
      setUser(normalized);
    } catch (err: any) {
      const isNetworkErr = !err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error';
      const msg = err.response?.data?.message 
        || (isNetworkErr 
            ? 'Unable to connect to the backend server. Please verify your internet connection or server status.' 
            : 'Login failed. Please try again.');
      setError(msg);
      throw new Error(msg);
    }
  };

  const signup = async (data: SignupData) => {
    try {
      setError(null);
      const res = await client.post('/auth/signup', data);
      const { token: newToken, user: userData } = res.data;
      const normalized = normalizeUser(userData);

      localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalized));
      setToken(newToken);
      setUser(normalized);
    } catch (err: any) {
      const isNetworkErr = !err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error';
      const msg = err.response?.data?.message 
        || (isNetworkErr 
            ? 'Unable to connect to the backend server. Please verify your internet connection or server status.' 
            : 'Signup failed. Please try again.');
      setError(msg);
      throw new Error(msg);
    }
  };

  const acceptInvitation = async (inviteToken: string, password: string) => {
    try {
      setError(null);
      const res = await client.post('/auth/accept-invite', { token: inviteToken, password });
      const { token: newToken, user: userData } = res.data;
      const normalized = normalizeUser(userData);

      localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalized));
      setToken(newToken);
      setUser(normalized);
    } catch (err: any) {
      const isNetworkErr = !err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error';
      const msg = err.response?.data?.message 
        || (isNetworkErr 
            ? 'Unable to connect to the backend server. Please verify your internet connection or server status.' 
            : 'Accepting invitation failed.');
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setToken(null);
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, acceptInvitation, logout, refreshUser, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
