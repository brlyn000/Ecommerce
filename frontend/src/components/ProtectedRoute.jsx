import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Unauthorized } from '../pages/ErrorPages';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Unauthorized />;
};

export default ProtectedRoute;