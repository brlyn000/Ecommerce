import React, { useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import HeadingTypography from "./HeadingTypography";

const SearchBar = ({ searchTerm, onSearchChange }) => {
  const inputRef = useRef(null);

  // Focus the input when component mounts
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  // Handle clear search with animation
  const handleClearSearch = () => {
    onSearchChange('');
    inputRef.current.focus();
  };

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center mb-6">
            <HeadingTypography text='Cari Semuanya di E-Kraft'/>
        </div>
        
        <div className="relative w-full">
          {/* Search icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400 transition-colors duration-200" />
          </div>
          
          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari produk mahasiswa..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-full shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-all duration-300 hover:border-blue-300 text-gray-700
                      bg-white/90 backdrop-blur-sm"
          />
          
          {/* Clear button with animation */}
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center group"
              aria-label="Clear search"
            >
              <div className="p-1 rounded-full group-hover:bg-gray-100 transition-colors duration-200">
                <FiX className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
              </div>
            </button>
          )}
        </div>
        
        {/* Search hints */}
        <div className="mt-2 text-sm text-gray-500 text-center">
          {!searchTerm && (
            <span className="animate-pulse">Coba cari: "desain", "makanan", "kerajinan"</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;