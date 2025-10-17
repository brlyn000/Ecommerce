import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { getProductImage } from '../../utils/imageMapper';
import { getImageUrl } from '../../utils/imageUtils';

import SearchBar from '../components/SearchBar';
import { FiStar, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const CardProduct = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const productsPerPage = 15;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.getProducts();
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    
    // Auto refresh products every 60 seconds
    const interval = setInterval(fetchProducts, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category_name && product.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
      >
        <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>
        <div className="text-xs sm:text-sm text-gray-500 font-medium">
          {filteredProducts.length} produk ditemukan
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : currentProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {currentProducts.map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="relative overflow-hidden h-36 sm:h-44 md:h-48 lg:h-56">
                  <Link to={`/product/${product.id}`}>
                    <img 
                      src={product.image ? `${product.image}?t=${Date.now()}` : '/images/placeholder.svg'} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.svg';
                      }}
                    />
                  </Link>
                  {product.discount && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                    >
                      -{product.discount}
                    </motion.div>
                  )}
                  {product.stock_status === 'limited' && (
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Terbatas
                    </div>
                  )}
                  {product.stock_status === 'sold-out' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">Habis</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                </div>

                <div className="p-3 sm:p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar 
                          key={i} 
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${i < product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1 font-medium">({product.rating})</span>
                  </div>
                  
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-blue-600 mb-1 sm:mb-2 line-clamp-2 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </Link>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-blue-600 font-bold text-sm sm:text-base">
                        {formatRupiah(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatRupiah(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <Link 
                      to={`/product/${product.id}`}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 self-start sm:self-auto"
                    >
                      Detail →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 sm:mt-12 flex flex-col items-center gap-4 sm:gap-6"
          >
            <div className="text-xs sm:text-sm text-gray-500 text-center">
              Menampilkan {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} dari {filteredProducts.length} produk
            </div>
            
            <div className="flex items-center justify-center space-x-1 sm:space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`p-2 sm:p-3 rounded-lg border transition-all duration-200 ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300'}`}
              >
                <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: Math.min(isMobile ? 3 : 5, totalPages) }, (_, i) => {
                  let pageNum;
                  const maxPages = isMobile ? 3 : 5;
                  if (totalPages <= maxPages) {
                    pageNum = i + 1;
                  } else if (currentPage <= Math.floor(maxPages/2) + 1) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - Math.floor(maxPages/2)) {
                    pageNum = totalPages - maxPages + 1 + i;
                  } else {
                    pageNum = currentPage - Math.floor(maxPages/2) + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === pageNum 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > (isMobile ? 3 : 5) && currentPage < totalPages - Math.floor((isMobile ? 3 : 5)/2) && (
                  <>
                    <span className="flex items-center px-1 sm:px-2 text-gray-400">...</span>
                    <button
                      onClick={() => paginate(totalPages)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === totalPages 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`p-2 sm:p-3 rounded-lg border transition-all duration-200 ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300'}`}
              >
                <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 sm:py-16"
        >
          <FiSearch className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
          <h3 className="mt-4 text-lg sm:text-xl font-medium text-gray-900">Produk tidak ditemukan</h3>
          <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-md mx-auto px-4">
            Coba gunakan kata kunci yang berbeda atau lihat koleksi kami yang lain.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CardProduct;