import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useErrorHandler = () => {
  const navigate = useNavigate();

  const handleError = useCallback((error) => {
    if (error?.response?.status) {
      const status = error.response.status;
      navigate(`/error/${status}`);
    } else {
      // Default to 500 for unknown errors
      navigate('/error/500');
    }
  }, [navigate]);

  return { handleError };
};