// src/contexts/AuthContext.tsx
import { User, AuthContextType, LoginResponse } from '../types';
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from './ToastContext';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false); 

  // --- token helpers ---
  const saveTokens = (access?: string, refresh?: string) => {
    if (access) localStorage.setItem('access', access);
    if (refresh) localStorage.setItem('refresh', refresh);
  };
  const clearTokens = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  };
  const getAccessToken = () => localStorage.getItem('access');
  const getRefreshToken = () => localStorage.getItem('refresh');

  useEffect(() => {
    (async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const access = localStorage.getItem('access');
        const refresh = localStorage.getItem('refresh');

        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem('user');
          }
        }

        if (!access && refresh) {
          await refreshToken(); 
        }
      } finally {
        setIsReady(true); 
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- refresh ---
  const refreshToken = useCallback(async (): Promise<string | null> => {
    const refresh = getRefreshToken();
    if (!refresh) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/login/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      const data: LoginResponse = await res.json();
      if (!res.ok) {
        const msg =
          data.detail ||
          Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
            .join(' | ') ||
          'Token refresh failed.';
        throw new Error(msg);
      }
      if (data.access) localStorage.setItem('access', data.access);
      if (data.refresh) localStorage.setItem('refresh', data.refresh);
      return data.access ?? null;
    } catch (e: any) {
      // refresh invalid → force logout
      clearTokens();
      setUser(null);
      addToast(e?.message || 'Session expired. Please log in again.', 'error');
      return null;
    }
  }, [addToast]);

  const authorizedFetch = useCallback(
    async (input: RequestInfo, init?: RequestInit, retryOnce: boolean = true): Promise<Response> => {
      const token = getAccessToken();
      const headers = new Headers(init?.headers || {});
      if (token) headers.set('Authorization', `Bearer ${token}`);

      let res = await fetch(input, { ...init, headers });

      if (res.status === 401 && retryOnce) {
        const newAccess = await refreshToken();
        if (!newAccess) return res;
        const retryHeaders = new Headers(init?.headers || {});
        retryHeaders.set('Authorization', `Bearer ${newAccess}`);
        res = await fetch(input, { ...init, headers: retryHeaders });
      }
      return res;
    },
    [refreshToken]
  );

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data: LoginResponse = await res.json();
      if (!res.ok) {
        const msg =
          data.detail ||
          Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
            .join(' | ') ||
          'Login failed.';
        throw new Error(msg);
      }
      saveTokens(data.access, data.refresh);

      const u: User = { username };
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));

      addToast('Login successful!', 'success');
    } catch (e: any) {
      addToast(e?.message || 'Login failed.', 'error');
      throw e;
    }
  };

  const register = async (username: string, email: string, password: string, password2: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, password2 }),
      });
      const data: LoginResponse = await res.json();
      if (!res.ok) {
        const msg =
          data.detail ||
          Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
            .join(' | ') ||
          'Registration failed.';
        throw new Error(msg);
      }

      if (data.access || data.refresh) saveTokens(data.access, data.refresh);

      const u: User = { username, email };
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));

      addToast('Registration successful!', 'success');
    } catch (e: any) {
      addToast(e?.message || 'Registration failed.', 'error');
      throw e;
    }
  };

  const logout = () => {
    clearTokens();
    localStorage.removeItem('user');
    setUser(null);
    addToast('Logged out successfully.', 'success');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isReady,    
        login,
        register,
        logout,
        getAccessToken,
        refreshToken,
        authorizedFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
