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
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupted localStorage — clear and force re-login
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
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
      const msg = extractErrorMessage(error, 'Login failed. Please check your credentials.');
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
        toast.success('Registration successful! Welcome to CarbonMitra.');
        return true;
      }
    } catch (error) {
      const msg = extractErrorMessage(error, 'Registration failed. Please check your details.');
      toast.error(msg);
    }
    return false;
  };

  /**
   * Logout: blacklist tokens on the server first, then clear local state.
   * This ensures revoked tokens cannot be reused even before their natural expiry.
   */
  const logout = useCallback(async () => {
    const accessToken = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    // Attempt to blacklist tokens on the backend
    if (accessToken || refreshToken) {
      try {
        await api.post('/api/auth/logout', { accessToken, refreshToken });
      } catch {
        // If the server is unreachable, still proceed with local logout
      }
    }

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.clear();
    setUser(null);
    toast.success('Logged out successfully.');
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
      toast.error('Failed to retrieve user profile. Please log in again.');
      // Clear tokens and force re-login if profile fetch fails
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOAuth2LoginSuccess = useCallback(async (token, refreshToken) => {
    setLoading(true);
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
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

/**
 * Extracts a human-readable error message from an Axios error response.
 * Handles both simple string messages and nested validation error maps.
 */
function extractErrorMessage(error, fallback) {
  if (!error.response) {
    return 'Cannot connect to the server. Please check your internet connection.';
  }
  const data = error.response?.data;
  if (!data) return fallback;

  // Direct message from ApiResponse
  if (data.message && typeof data.message === 'string') {
    return data.message;
  }

  // Validation error map (field -> message)
  if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    const firstError = Object.values(data.data)[0];
    if (firstError) return firstError;
  }

  return fallback;
}

export const useAuth = () => useContext(AuthContext);
