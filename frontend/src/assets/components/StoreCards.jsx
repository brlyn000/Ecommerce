import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiPackage, FiArrowRight, FiStar, FiMapPin } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL as API_URL } from '../../config/api';

const StoreCards = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/tenants`);
      const storesData = response.data.slice(0, 6);
      
      // Calculate ratings for each store from their products
      const storesWithRatings = await Promise.all(
        storesData.map(async (store) => {
          try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const productsRes = await axios.get(`${API_URL}/products/tenant/${store.id}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const products = productsRes.data;
            
            return {
              ...store,
              product_count: products.length
            };
          } catch (error) {
            return {
              ...store,
              product_count: 0
            };
          }
        })
      );
      
      setStores(storesWithRatings);
    } catch (error) {
      console.error('Error fetching stores:', error);
      // Fallback: try without auth
      try {
        const publicResponse = await fetch(`${API_URL}/users/tenants`);
        if (publicResponse.ok) {
          const data = await publicResponse.json();
          setStores(data.slice(0, 6));
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        setStores([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-16 w-16 bg-gray-200 rounded-full mb-4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stores.map((store, index) => (
          <motion.a
            key={store.id}
            href={`/store/${store.id}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.02, 
              y: -8,
              transition: { duration: 0.3 }
            }}
            className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group relative"
          >
            {/* Gradient Background */}
            <div className="h-32 sm:h-28 bg-gradient-to-br from-red-500 via-red-600 to-pink-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-white/20"></div>
              <div className="absolute top-2 right-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-white text-xs font-medium">{store.product_count || 0} produk</span>
                </div>
              </div>
              
              {/* Store Avatar */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border-3 border-white group-hover:scale-110 transition-transform">
                  <span className="text-red-600 text-lg sm:text-xl font-bold">
                    {(store.business_name || store.username).charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Store Content */}
            <div className="pt-8 pb-4 px-4 sm:px-5">
              <div className="text-center">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-1">
                  {store.business_name || store.username}
                </h3>
                
                <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500 mb-3">
                  <FiMapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1 truncate">{store.address || 'Lokasi tidak tersedia'}</span>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
                  <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full">
                    <FiPackage className="h-3 w-3 mr-1 text-blue-500" />
                    <span className="font-medium">{store.product_count || 0}</span>
                  </div>
                  <div className="flex items-center bg-red-50 px-2 py-1 rounded-full">
                    <span className="text-red-600 font-medium">Kunjungi →</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      {/* See All Stores Button */}
      <div className="text-center">
        <motion.a
          href="/stores"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <span>Lihat Semua Toko</span>
          <FiArrowRight className="ml-2 h-4 w-4" />
        </motion.a>
      </div>
    </div>
  );
};

export default StoreCards;