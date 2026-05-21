'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface Org {
  id: string;
  name: string;
  slug: string;
}

interface AuthState {
  user: User | null;
  org: Org | null;
  token: string | null;
  role: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, orgName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredAuth(): { token: string; user: User; org: Org; role: string } | null {
  try {
    const raw = localStorage.getItem('araner-auth');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function storeAuth(data: { token: string; user: User; org: Org; role: string }) {
  localStorage.setItem('araner-auth', JSON.stringify(data));
}

function clearAuth() {
  localStorage.removeItem('araner-auth');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    org: null,
    token: null,
    role: null,
    loading: true,
  });

  // Restore auth on mount
  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) {
      setState({ ...stored, loading: false });
    } else {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    const authData = { token: data.token, user: data.user, org: data.org, role: data.role };
    storeAuth(authData);
    setState({ ...authData, loading: false });
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string, orgName?: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, orgName }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    const authData = { token: data.token, user: data.user, org: data.org, role: 'OWNER' };
    storeAuth(authData);
    setState({ ...authData, loading: false });
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setState({ user: null, org: null, token: null, role: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
