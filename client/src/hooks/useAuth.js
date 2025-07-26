// hooks/useAuth.js - Authentication Hook
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { safeLocalStorage } from '../../../utils/performance';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = safeLocalStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(storedUser);
      setIsAuthenticated(true);
      // Verify token is still valid
      verifyToken();
    }
    setLoading(false);
  }, []);

  const verifyToken = async () => {
    try {
      const token = safeLocalStorage.getItem('authToken');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('/api/users/verify');
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/users/login', credentials);
      const { user, token } = response.data;

      setCurrentUser(user);
      setIsAuthenticated(true);
      safeLocalStorage.setItem('currentUser', user);
      safeLocalStorage.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/users/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    safeLocalStorage.removeItem('currentUser');
    safeLocalStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = '/';
  };

  const updateUser = (userData) => {
    setCurrentUser(userData);
    safeLocalStorage.setItem('currentUser', userData);
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    verifyToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
