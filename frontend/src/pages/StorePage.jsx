import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPackage, FiMail, FiPhone, FiMapPin, FiShoppingBag, FiStar, FiUsers, FiTrendingUp, FiClock } from 'react-icons/fi';
import Navbar from '../assets/components/Navbar';
import axios from 'axios';
import { API_BASE_URL as API_URL, API_CONFIG } from '../config/api';

const StorePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreData();
  }, [id]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const [tenantRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/users/tenants/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }),
        axios.get(`${API_URL}/products/tenant/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
      ]);

      setTenant(tenantRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return '/images/placeholder.svg';
    return image.startsWith('http') ? image : `${API_CONFIG.SERVER_URL}${image}`;
  };

  // Calculate real statistics
  const totalSold = products.reduce((sum, product) => sum + (product.total_sold || 0), 0);
  const availableProducts = products.filter(p => p.stock === 'available').length;
  const joinYear = tenant ? new Date(tenant.created_at || Date.now()).getFullYear() : new Date().getFullYear();
  
  // Calculate store rating from products
  const productsWithRating = products.filter(p => p.average_rating && p.review_count > 0);
  const storeAverageRating = productsWithRating.length > 0 
    ? productsWithRating.reduce((sum, p) => sum + (p.average_rating * p.review_count), 0) / productsWithRating.reduce((sum, p) => sum + p.review_count, 0)
    : 0;
  const storeTotalReviews = products.reduce((sum, p) => sum + (p.review_count || 0), 0);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  if (!tenant) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Toko tidak ditemukan</p>
            <button onClick={() => navigate('/')} className="mt-4 text-blue-600 hover:text-blue-700">
              Kembali ke Home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
        {/* Store Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black opacity-30"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </button>
            
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="h-24 w-24 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl font-bold text-blue-600">
                  {(tenant.business_name || tenant.username).charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{tenant.business_name || tenant.username}</h1>
                <div className="flex items-center space-x-4 text-blue-100 mb-3">
                  <div className="flex items-center">
                    <FiMapPin className="h-4 w-4 mr-1" />
                    <span>{tenant.address || 'Lokasi tidak tersedia'}</span>
                  </div>
                  <div className="flex items-center">
                    <FiPackage className="h-4 w-4 mr-1" />
                    <span>{products.length} Produk</span>
                  </div>
                </div>
                
                {/* Rating and Status */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className={`h-4 w-4 ${i < Math.floor(tenant.average_rating || 0) ? 'text-yellow-400 fill-current' : 'text-blue-300'}`} />
                    ))}
                    <span className="text-sm ml-2">{Number(storeAverageRating || 0).toFixed(1)} ({storeTotalReviews} ulasan)</span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Store Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 -mt-16 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-red-100"
            >
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <FiPackage className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Produk</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-red-100"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiPackage className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Produk Tersedia</p>
                  <p className="text-2xl font-bold text-gray-900">{availableProducts}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-red-100"
            >
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FiTrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Terjual</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSold}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-red-100"
            >
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiClock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Bergabung</p>
                  <p className="text-2xl font-bold text-gray-900">{joinYear}</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Store Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FiMail className="mr-2 h-5 w-5 text-blue-600" />
              Informasi Kontak
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <FiMail className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900 mt-1">{tenant.email}</p>
                </div>
              </div>
              {tenant.phone && (
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <FiPhone className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Telepon</p>
                    <p className="text-gray-900 mt-1">{tenant.phone}</p>
                  </div>
                </div>
              )}
              {tenant.address && (
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <FiMapPin className="h-5 w-5 text-red-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Alamat</p>
                    <p className="text-gray-900 mt-1">{tenant.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FiShoppingBag className="mr-3 h-7 w-7 text-blue-600" />
                Produk Toko
              </h2>
              <div className="text-sm text-gray-500">
                Menampilkan {products.length} produk
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <div className="max-w-md mx-auto">
                  <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiPackage className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Produk</h3>
                  <p className="text-gray-500">Toko ini sedang mempersiapkan produk-produk terbaiknya untuk Anda</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, index) => (
                  <motion.a
                    key={product.id}
                    href={`/product/${product.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => e.target.src = '/images/placeholder.svg'}
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium shadow-sm ${
                          product.stock === 'available' ? 'bg-green-500 text-white' :
                          product.stock === 'limited' ? 'bg-yellow-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {product.stock === 'available' ? 'Tersedia' :
                           product.stock === 'limited' ? 'Terbatas' : 'Habis'}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xl font-bold text-blue-600">
                            Rp {parseInt(product.price).toLocaleString()}
                          </span>
                          {product.total_sold && (
                            <p className="text-xs text-gray-500 mt-1">{product.total_sold} terjual</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiStar className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-500">{Number(product.average_rating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StorePage;
