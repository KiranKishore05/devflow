import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('devflow_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get<{ success: boolean; data: User }>('/auth/me');
      if (res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem('devflow_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ success: boolean; data: { user: User; token: string } }>('/auth/login', {
      email,
      password,
    });
    if (res.data?.token) {
      localStorage.setItem('devflow_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await api.post<{ success: boolean; data: { user: User; token: string } }>('/auth/register', {
      email,
      password,
      name,
    });
    if (res.data?.token) {
      localStorage.setItem('devflow_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('devflow_token');
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
