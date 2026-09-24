import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('parkingspot_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('parkingspot_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data?.data?.user) {
            setUser(res.data.data.user);
            localStorage.setItem('parkingspot_user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out');
          logout();
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user: loggedInUser, token: authToken } = res.data.data;
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('parkingspot_user', JSON.stringify(loggedInUser));
    localStorage.setItem('parkingspot_token', authToken);
    return loggedInUser;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    const { user: registeredUser, token: authToken } = res.data.data;
    setUser(registeredUser);
    setToken(authToken);
    localStorage.setItem('parkingspot_user', JSON.stringify(registeredUser));
    localStorage.setItem('parkingspot_token', authToken);
    return registeredUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('parkingspot_user');
    localStorage.removeItem('parkingspot_token');
  };

  // Demo 1-click login helper
  const demoLogin = async (role) => {
    const demoAccounts = {
      COMMUTER: { email: 'commuter@demo.com', password: 'Password123!' },
      OWNER: { email: 'owner@demo.com', password: 'Password123!' },
      ADMIN: { email: 'admin@demo.com', password: 'Password123!' },
      MASTER_ADMIN: { email: 'masteradmin@demo.com', password: 'Password123!' },
    };

    const target = demoAccounts[role];
    if (!target) throw new Error('Unknown demo role');
    return await login(target.email, target.password);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    demoLogin,
    isAuthenticated: !!user && !!token,
    isCommuter: user?.role === 'COMMUTER',
    isOwner: user?.role === 'OWNER',
    isAdmin: user?.role === 'ADMIN' || user?.role === 'MASTER_ADMIN',
    isMasterAdmin: user?.role === 'MASTER_ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
