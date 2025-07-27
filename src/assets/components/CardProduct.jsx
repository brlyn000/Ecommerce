import { useState } from "react";
import { Link } from 'react-router-dom';
import productData from '../../data/ProductData';
import SearchBar from '../components/SearchBar';
import { FiHeart, FiShoppingCart, FiStar, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const CardProduct = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 24; // Number of products per page

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const filteredProducts = productData.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      {/* Enhanced Search Component */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="w-full md:w-1/2 lg:w-1/3">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>
        <div className="text-sm text-gray-500">
          {filteredProducts.length} produk ditemukan
        </div>
      </div>

      {/* Product Grid with improved design */}
      {currentProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentProducts.map((product) => (
              <div 
                key={product.id} 
                className="group relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-100"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Product Image with overlay actions */}
                <div className="relative overflow-hidden h-48 md:h-56">
                  <Link to={product.link}>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  </Link>
                  {/* Sale badge */}
                  {product.discount && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {product.discount}%
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i} 
                        className={`w-3 h-3 ${i < product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
                  </div>
                  
                  <Link to={product.link}>
                    <h3 className="text-base font-semibold text-gray-800 group-hover:text-blue-600 mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  </Link>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-blue-600 font-bold text-sm md:text-base">
                        {formatRupiah(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through ml-2">
                          {formatRupiah(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <Link 
                      to={product.link}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Detail →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Menampilkan {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} dari {filteredProducts.length} produk
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`w-10 h-10 rounded-lg ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="flex items-end px-2">...</span>
                )}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    onClick={() => paginate(totalPages)}
                    className={`w-10 h-10 rounded-lg ${currentPage === totalPages ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    {totalPages}
                  </button>
                )}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Load More Button (alternative to pagination) */}
            {indexOfLastProduct < filteredProducts.length && (
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-6 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-300"
              >
                Muat Lebih Banyak
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Produk tidak ditemukan</h3>
          <p className="mt-1 text-sm text-gray-500">
            Coba gunakan kata kunci yang berbeda atau lihat koleksi kami yang lain.
          </p>
        </div>
      )}
    </div>
  );
};

export default CardProduct;