import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import api from '../api/client';
import type { Admin } from '../api/types';

interface AuthContextValue {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('lt_token');
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<Admin>('/api/auth/me');
      setAdmin(data);
    } catch {
      localStorage.removeItem('lt_token');
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post<{ access_token: string }>('/api/auth/login', { email, password });
    localStorage.setItem('lt_token', data.access_token);
    await loadMe();
  };

  const logout = () => {
    localStorage.removeItem('lt_token');
    setAdmin(null);
  };

  const value = useMemo(
    () => ({ admin, loading, login, logout }),
    [admin, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
