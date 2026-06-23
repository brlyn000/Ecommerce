import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiPackage, FiSearch, FiStar, FiMapPin } from 'react-icons/fi';
import Navbar from '../assets/components/Navbar';
import axios from 'axios';
import { API_BASE_URL as API_URL } from '../config/api';

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');

  const backgroundImages = [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2126&q=80',
    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80'
  ];

  useEffect(() => {
    fetchStores();
    setBackgroundImage(backgroundImages[Math.floor(Math.random() * backgroundImages.length)]);
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/tenants`);
      const storesData = response.data;
      
      // Calculate ratings for each store from their products
      const storesWithRatings = await Promise.all(
        storesData.map(async (store) => {
          try {
            const productsRes = await axios.get(`${API_URL}/products/tenant/${store.id}`);
            const products = productsRes.data;
            
            const productsWithRating = products.filter(p => p.average_rating && p.review_count > 0);
            const storeAverageRating = productsWithRating.length > 0 
              ? productsWithRating.reduce((sum, p) => sum + (p.average_rating * p.review_count), 0) / productsWithRating.reduce((sum, p) => sum + p.review_count, 0)
              : 0;
            const storeTotalReviews = products.reduce((sum, p) => sum + (p.review_count || 0), 0);
            
            return {
              ...store,
              average_rating: storeAverageRating,
              total_reviews: storeTotalReviews,
              product_count: products.length
            };
          } catch (error) {
            return {
              ...store,
              average_rating: 0,
              total_reviews: 0,
              product_count: 0
            };
          }
        })
      );
      
      setStores(storesWithRatings);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store =>
    (store.business_name || store.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (store.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 via-red-800/70 to-red-700/60"></div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div 
            animate={{ 
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-red-400/20 to-red-500/10 blur-3xl"
          ></motion.div>
          <motion.div 
            animate={{ 
              x: [0, -25, 0],
              y: [0, 15, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-red-300/15 to-white/10 blur-3xl"
          ></motion.div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Enhanced Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">Semua Toko</h1>
            <p className="text-red-100 max-w-2xl mx-auto text-lg leading-relaxed">
              Jelajahi berbagai toko terpercaya dengan produk berkualitas tinggi
            </p>
          </motion.div>

          {/* Enhanced Search */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <div className="relative max-w-lg mx-auto">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cari toko favorit Anda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white/90 backdrop-blur-sm border border-red-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-lg text-gray-800 placeholder-red-400"
              />
            </div>
          </motion.div>

          {/* Enhanced Stores Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg animate-pulse">
                  <div className="h-20 bg-red-200 rounded-full mb-4 mx-auto"></div>
                  <div className="h-4 bg-red-200 rounded mb-2"></div>
                  <div className="h-3 bg-red-200 rounded w-2/3 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : filteredStores.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl"
            >
              <div className="max-w-md mx-auto">
                <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiShoppingBag className="h-12 w-12 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'Toko Tidak Ditemukan' : 'Belum Ada Toko'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Coba kata kunci lain untuk pencarian Anda' : 'Toko-toko terbaik akan segera hadir'}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredStores.map((store, index) => (
                <motion.a
                  key={store.id}
                  href={`/store/${store.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -8,
                    transition: { duration: 0.3 }
                  }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-red-100 group"
                >
                  {/* Store Header with Red Gradient */}
                  <div className="h-24 bg-gradient-to-br from-red-500 via-red-600 to-red-700 relative">
                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                      <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white group-hover:scale-110 transition-transform">
                        <span className="text-red-600 text-xl font-bold">
                          {(store.business_name || store.username).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Store Content */}
                  <div className="pt-12 pb-6 px-6">
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-red-600 transition-colors line-clamp-1">
                        {store.business_name || store.username}
                      </h3>
                      <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
                        <FiMapPin className="h-3 w-3 mr-1" />
                        <span className="line-clamp-1">{store.address || 'Lokasi tidak tersedia'}</span>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center justify-center mb-3">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} className={`h-3 w-3 ${i < Math.floor(store.average_rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">{(store.average_rating || 0).toFixed(1)} ({store.total_reviews || 0} ulasan)</span>
                      </div>
                    </div>
                    

                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StoresPage;