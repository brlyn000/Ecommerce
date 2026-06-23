import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL as API_BASE } from '../config/api';

const AuthContext = createContext();
const TOKEN_KEY = 'adminToken';

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Add 10s buffer to avoid edge cases
    return payload.exp * 1000 < Date.now() + 10000;
  } catch {
    return true;
  }
};

const clearStorage = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('currentUser');
};

export const getValidToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || isTokenExpired(token)) {
    if (token) clearStorage();
    return null;
  }
  return token;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && !isTokenExpired(token)) {
      setIsAuthenticated(true);
    } else if (token) {
      clearStorage();
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.token || isTokenExpired(data.token)) return false;
        localStorage.setItem(TOKEN_KEY, data.token);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = useCallback(() => {
    clearStorage();
    setIsAuthenticated(false);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
