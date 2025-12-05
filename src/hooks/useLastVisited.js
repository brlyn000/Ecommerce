import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useLastVisited = () => {
  const location = useLocation();

  useEffect(() => {
    // Don't save login/register pages
    const excludedPaths = ['/login', '/register', '/user-register', '/tenant-register', '/dashboard', '/tenant-dashboard'];
    
    if (!excludedPaths.includes(location.pathname)) {
      localStorage.setItem('lastVisitedPage', location.pathname);
      console.log('Saved last visited page:', location.pathname);
    }
  }, [location.pathname]);
};