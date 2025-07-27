import { useState } from 'react';
import { Link } from 'react-router-dom';
import HeadingTypography from './HeadingTypography';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('');

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 transition-all duration-300 hover:shadow-md">
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
        
        </div>
      </div>
    </nav>
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