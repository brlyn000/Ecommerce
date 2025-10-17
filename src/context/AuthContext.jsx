import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const savedUsers = localStorage.getItem('systemUsers');
    const users = savedUsers ? JSON.parse(savedUsers) : [
      { id: 1, name: 'Admin User', email: 'admin@naragatra.com', role: 'Admin', status: 'Active', password: 'admin123' }
    ];
    
    const foundUser = users.find(u => u.email === email && u.password === password && u.status === 'Active');
    if (foundUser) {
      localStorage.setItem('adminToken', 'authenticated');
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
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