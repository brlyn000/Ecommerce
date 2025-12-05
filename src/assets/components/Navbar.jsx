import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeadingTypography from './HeadingTypography';
import LoginModal from './LoginModal';
import BottomNavbar from './BottomNavbar';
import { FiUser, FiLogOut, FiHeart, FiShoppingCart } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('currentUser');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    // Update counts
    updateCounts();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      updateCounts();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('wishlistUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('wishlistUpdated', handleStorageChange);
    };
  }, []);
  
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('currentUser');
    setUser(null);
    setShowUserMenu(false);
    window.location.reload();
  };

  return (
    <>
    <nav className="hidden md:block bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-3xl font-bold relative group"
            onClick={() => setActiveLink('')}
          >
            <HeadingTypography text='E-Kraft'/>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <NavLink 
              to="/" 
              activeLink={activeLink}
              setActiveLink={setActiveLink}
            >
              Beranda
            </NavLink>
            <NavLink 
              to="/about-us" 
              activeLink={activeLink}
              setActiveLink={setActiveLink}
            >
              Tentang Kami
            </NavLink>
            <NavLink 
              to="/contact-us" 
              activeLink={activeLink}
              setActiveLink={setActiveLink}
            >
              Kontak Kami
            </NavLink>
            
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="relative p-2 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <FiHeart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                
                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                
                {/* Profile Menu */}
                <div className="relative user-menu">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-300"
                  >
                    <FiUser className="w-4 h-4" />
                    <span>{user.full_name || user.username}</span>
                  </button>
                
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.full_name || user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiUser className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiHeart className="w-4 h-4" />
                        <span>Wishlist</span>
                      </Link>
                      <Link
                        to="/cart"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiShoppingCart className="w-4 h-4" />
                        <span>Cart</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiShoppingCart className="w-4 h-4" />
                        <span>My Orders</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <a
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-sm"
              >
                Masuk
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
        <div className="px-4 pt-2 pb-6 space-y-2">
          <MobileNavLink 
            to="/" 
            setIsOpen={setIsOpen}
            setActiveLink={setActiveLink}
          >
            Beranda
          </MobileNavLink>
          <MobileNavLink 
            to="/about-us" 
            setIsOpen={setIsOpen}
            setActiveLink={setActiveLink}
          >
            Tentang Kami
          </MobileNavLink>
          <MobileNavLink 
            to="/contact-us" 
            setIsOpen={setIsOpen}
            setActiveLink={setActiveLink}
          >
            Kontak Kami
          </MobileNavLink>
          
          {user ? (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-gray-900">{user.full_name || user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <a
                href="/login"
                className="block w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 text-center"
              >
                Masuk
              </a>
            </div>
          )}
        </div>
      </div>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setShowLoginModal(false);
          const userData = localStorage.getItem('currentUser');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }}
      />
    </nav>
    <BottomNavbar />
    </>
  );
};

// Reusable NavLink Component
const NavLink = ({ to, children, activeLink, setActiveLink }) => (
  <Link
    to={to}
    className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-full
      ${activeLink === to ? 
        'text-white bg-gradient-to-r from-blue-500 to-indigo-500 shadow-sm' : 
        'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}
    `}
    onClick={() => setActiveLink(to)}
  >
    {children}
    {activeLink === to && (
      <span className="absolute inset-x-1 -bottom-1 h-0.5 bg-blue-200"></span>
    )}
  </Link>
);

// Reusable MobileNavLink Component
const MobileNavLink = ({ to, children, setIsOpen, setActiveLink }) => (
  <Link
    to={to}
    className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
    onClick={() => {
      setIsOpen(false);
      setActiveLink(to);
    }}
  >
    {children}
  </Link>
);

export default Navbar;