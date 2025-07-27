import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiFrown } from 'react-icons/fi';
import ProductData from '../data/ProductData';

export default function CategoryList() {
  const { category } = useParams();

  const filteredProducts = ProductData.filter(
    (item) => item.category === category
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link 
              to="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-all duration-300 group mb-2"
            >
              <FiArrowLeft className="mr-2 transition-transform group-hover:-translate-x-1" />
              Semua Kategori
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 capitalize">
              Produk <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">{category}</span>
            </h1>
            <p className="text-gray-500 mt-2">{filteredProducts.length} produk tersedia</p>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group"
              >
                {/* Product Image */}
                <div className="relative h-48 md:h-56 overflow-hidden bg-gray-50">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 p-4" 
                    loading="lazy"
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col items-start gap-1">
                    {item.isNew && (
                      <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        BARU
                      </span>
                    )}
                    {item.discount && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        {item.discount}% OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 h-14">{item.name}</h2>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">{item.description}</p>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(item.price)}
                    </span>
                    {item.originalPrice && (
                      <span className="ml-2 text-sm text-gray-400 line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* See More Button */}
                  <Link 
                    to={`${item.link}`}
                    className="block w-full text-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-300 mb-4">
              <FiFrown className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Belum ada produk</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Maaf, saat ini belum tersedia produk dalam kategori {category}.
            </p>
            <Link 
              to="/categories" 
              className="inline-flex items-center px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-300"
            >
              <FiArrowLeft className="mr-2" />
              Kembali ke Kategori
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}