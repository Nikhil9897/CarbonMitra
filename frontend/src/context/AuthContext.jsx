import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await api.post('/api/auth/login', { usernameOrEmail, password });
      if (response.data.success) {
        const data = response.data.data;
        const userProfile = {
          id: data.userId,
          username: data.username,
          email: data.email,
          role: data.role,
          organizationId: data.organizationId,
          organizationName: data.organizationName,
        };
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(userProfile));
        setUser(userProfile);
        toast.success('Welcome back, ' + userProfile.username + '!');
        return true;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed, please check your credentials';
      toast.error(msg);
    }
    return false;
  };

  const register = async (username, email, password, role, organizationName, organizationId) => {
    try {
      const response = await api.post('/api/auth/register', {
        username,
        email,
        password,
        role,
        organizationName: organizationName || undefined,
        organizationId: organizationId || undefined,
      });
      if (response.data.success) {
        const data = response.data.data;
        const userProfile = {
          id: data.userId,
          username: data.username,
          email: data.email,
          role: data.role,
          organizationId: data.organizationId,
          organizationName: data.organizationName,
        };
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(userProfile));
        setUser(userProfile);
        toast.success('Registration successful! Welcome to CarbonTrack.');
        return true;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
    }
    return false;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Logged out successfully');
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get('/api/users/me');
      if (response.data.success) {
        const data = response.data.data;
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        toast.success('Successfully logged in via Google!');
      }
    } catch (error) {
      toast.error('Failed to retrieve user profile');
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const handleOAuth2LoginSuccess = useCallback(async (token, refreshToken) => {
    setLoading(true);
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    // Fetch profile info immediately
    await fetchUserProfile();
  }, [fetchUserProfile]);

  const updateUserState = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, handleOAuth2LoginSuccess, updateUserState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
