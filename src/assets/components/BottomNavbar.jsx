import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiHeart, FiShoppingCart, FiUser, FiMenu, FiPhone, FiInfo } from 'react-icons/fi';

const BottomNavbar = () => {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showDropUp, setShowDropUp] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Update counts
    updateCounts();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      updateCounts();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('wishlistUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('wishlistUpdated', handleStorageChange);
    };
  }, []);

  // Close drop-up menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropUp && !event.target.closest('.drop-up-container')) {
        setShowDropUp(false);
      }
    };
    
    if (showDropUp) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropUp]);
  
  const updateCounts = () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
      setWishlistCount(wishlist.length);
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: FiHome, path: '/' },
    { id: 'search', label: 'Search', icon: FiSearch, path: '/search' },
    { id: 'menu', label: 'Menu', icon: FiMenu, isDropUp: true },
    { id: 'profile', label: user ? 'Profile' : 'Login', icon: FiUser, path: user ? '/profile' : '/login' }
  ];

  const dropUpItems = [
    { id: 'wishlist', label: 'Wishlist', icon: FiHeart, path: '/wishlist', count: wishlistCount, countColor: 'bg-red-500' },
    { id: 'cart', label: 'Cart', icon: FiShoppingCart, path: '/cart', count: cartCount, countColor: 'bg-blue-500' },
    { id: 'orders', label: user ? 'Orders' : 'Login', icon: user ? FiShoppingCart : FiUser, path: user ? '/orders' : '/login' },
    { id: 'contact', label: 'Contact Us', icon: FiPhone, path: '/contact-us' },
    { id: 'about', label: 'About Us', icon: FiInfo, path: '/about-us' }
  ];

  const handleDropUpClick = () => {
    setShowDropUp(!showDropUp);
  };

  const handleDropUpItemClick = () => {
    setShowDropUp(false);
  };

  return (
    <>
      {/* Drop-up Menu */}
      {showDropUp && (
        <div className="md:hidden fixed bottom-20 left-3 right-3 drop-up-container z-40">
          <div className="bg-gradient-to-br from-white via-blue-50 to-white rounded-2xl shadow-2xl border border-blue-100 backdrop-blur-md animate-slide-up">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-300 rounded-full"></div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {dropUpItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={handleDropUpItemClick}
                      className={`relative flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        isActive 
                          ? 'text-white bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg' 
                          : 'text-gray-700 hover:text-blue-600 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="relative">
                        <Icon className="w-5 h-5" />
                        {item.count > 0 && (
                          <span className={`absolute -top-1 -right-1 ${item.countColor} text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px] animate-bounce`}>
                            {item.count}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white via-blue-50 to-white backdrop-blur-md border-t border-blue-100 shadow-lg z-50">
        <div className="flex justify-around items-center py-3 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            if (item.isDropUp) {
              return (
                <button
                  key={item.id}
                  onClick={handleDropUpClick}
                  className={`relative flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 transform ${
                    showDropUp 
                      ? 'text-white bg-gradient-to-br from-blue-500 to-blue-600 scale-110 shadow-lg' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:scale-105'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 mb-1 transition-transform duration-200 ${showDropUp ? 'rotate-180' : ''}`} />
                    {(cartCount > 0 || wishlistCount > 0) && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center animate-pulse"></span>
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                  {showDropUp && (
                    <div className="absolute -bottom-1 w-6 h-1 bg-white rounded-full opacity-80"></div>
                  )}
                </button>
              );
            }
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`relative flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 transform ${
                  isActive 
                    ? 'text-white bg-gradient-to-br from-blue-500 to-blue-600 scale-110 shadow-lg' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:scale-105'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  {item.id === 'profile' && user && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute -bottom-1 w-6 h-1 bg-white rounded-full opacity-80"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default BottomNavbar;