import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate session on page load
  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('eduquest_token');
      if (token) {
        try {
          const profile = await api.auth.getProfile();
          setUser(profile);
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          localStorage.removeItem('eduquest_token');
          setUser(null);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (usernameOrEmail, password) => {
    setLoading(true);
    try {
      const data = await api.auth.login(usernameOrEmail, password);
      localStorage.setItem('eduquest_token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, character) => {
    setLoading(true);
    try {
      const data = await api.auth.register(username, email, password, character);
      localStorage.setItem('eduquest_token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('eduquest_token');
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.auth.getProfile();
      setUser(profile);
      return profile;
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const updateAvatarInState = (newAvatarId) => {
    if (user) {
      setUser(prev => ({ ...prev, character: newAvatarId }));
    }
  };

  const authValue = {
    user,
    loading,
    login,
    register,
    logout,
    refreshProfile,
    updateAvatarInState,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
