import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) fetchCurrentUser();
    else setLoading(false);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data } = await api.get('/me/');
      setUser(data);
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login/', { email, password });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      // Fetch full user details (including role)
      const { data: userData } = await api.get('/me/');
      setUser(userData);
      toast.success(`Welcome back, ${userData.first_name || userData.username}!`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/', { refresh_token: localStorage.getItem('refresh_token') });
    } catch {}
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    toast.success('Logged out');
    navigate('/login');
  };

  const register = async (userData) => {
    try {
      await api.post('/users/', userData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
      return true;
    } catch (error) {
      const errorData = error.response?.data;
      const messages = errorData ? Object.values(errorData).flat().join(', ') : 'Registration failed';
      toast.error(messages);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};