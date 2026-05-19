'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { getDashboardPath, normalizeRoleId, type PublicRole } from '@/lib/roles';

export interface User {
  id: number;
  email: string;
  fullName: string;
  mobileNumber?: string;
  address?: string;
  role: string;
  roleLabel?: string;
  dashboardPath?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role: string) => Promise<string>;
  register: (userData: RegisterData) => Promise<string>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (...roles: string[]) => boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: string;
  mobileNumber?: string;
  address?: string;
  emergencyContact?: string;
  petName?: string;
  species?: string;
  breed?: string;
  ageOrDob?: string;
  gender?: string;
  vaccinationStatus?: string;
  vaccinationReminders?: boolean;
  appointmentUpdates?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function resolveRedirectPath(user: User, roles?: PublicRole[]): string {
  if (user.dashboardPath) return user.dashboardPath;
  return getDashboardPath(roles || [], user.role);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const persistSession = (sessionToken: string, sessionUser: User) => {
    localStorage.setItem('token', sessionToken);
    localStorage.setItem('user', JSON.stringify(sessionUser));
    setToken(sessionToken);
    setUser(sessionUser);
  };

  const login = useCallback(async (email: string, password: string, role: string) => {
    const canonicalRole = normalizeRoleId(role);
    if (!canonicalRole) {
      throw new Error('Please select a valid role');
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: canonicalRole }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    const sessionUser: User = {
      ...data.user,
      role: data.user.role || canonicalRole,
    };

    persistSession(data.token, sessionUser);
    return resolveRedirectPath(sessionUser);
  }, []);

  const register = useCallback(async (userData: RegisterData) => {
    const canonicalRole = normalizeRoleId(userData.role);
    if (!canonicalRole) {
      throw new Error('Please select a valid role');
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, role: canonicalRole }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    const sessionUser: User = {
      ...data.user,
      role: data.user.role || canonicalRole,
    };

    persistSession(data.token, sessionUser);
    return resolveRedirectPath(sessionUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: string[]) => {
      const userRole = normalizeRoleId(user?.role);
      if (!userRole) return false;
      return roles.map((r) => normalizeRoleId(r)).filter(Boolean).includes(userRole);
    },
    [user]
  );

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
