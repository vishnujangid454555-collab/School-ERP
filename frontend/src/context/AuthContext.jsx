import { createContext, useContext, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'school_erp_access_token';
const REFRESH_TOKEN_KEY = 'school_erp_refresh_token';
const USER_KEY = 'school_erp_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });

  useEffect(() => {
    if (token) axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete axiosClient.defaults.headers.common.Authorization;
  }, [token]);

  useEffect(() => {
    const handleExpiredSession = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('school-erp:logout', handleExpiredSession);
    return () => window.removeEventListener('school-erp:logout', handleExpiredSession);
  }, []);

  const login = async (credentials) => {
    const { data } = await axiosClient.post('/auth/login', credentials);
    establishSession(data.data);
  };

  const register = async (credentials) => {
    const { data } = await axiosClient.post('/auth/register', credentials);
    establishSession(data.data);
  };

  const establishSession = (session) => {
    axiosClient.defaults.headers.common.Authorization = `Bearer ${session.token}`;
    setToken(session.token);
    setUser(session.user);
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return <AuthContext.Provider value={{ token, user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
