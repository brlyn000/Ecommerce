import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPackage, FiTrendingUp, FiDollarSign, FiShoppingBag, FiMail, FiPhone, FiMapPin, FiCalendar, FiUser, FiBarChart2, FiStar } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL as API_URL, API_CONFIG } from '../config/api';

const TenantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSold: 0,
    totalRevenue: 0,
    activeProducts: 0
  });

  useEffect(() => {
    fetchTenantDetail();
  }, [id]);

  const fetchTenantDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const [tenantRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/users/tenants/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/products/tenant/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setTenant(tenantRes.data);
      const productsData = Array.isArray(productsRes.data) ? productsRes.data : [];
      setProducts(productsData);

      // Calculate stats
      const totalSold = productsData.reduce((sum, p) => sum + (p.total_sold || 0), 0);
      const totalRevenue = productsData.reduce((sum, p) => sum + ((p.total_sold || 0) * p.price), 0);
      const activeProducts = productsData.filter(p => p.stock === 'available').length;

      setStats({
        totalProducts: productsData.length,
        totalSold,
        totalRevenue,
        activeProducts
      });
    } catch (error) {
      console.error('Error fetching tenant detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return '/images/placeholder.svg';
    return image.startsWith('http') ? image : `${API_CONFIG.SERVER_URL}${image}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Tenant tidak ditemukan</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-600 hover:text-blue-700">
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-white hover:text-blue-100 mb-4 transition-colors"
          >
            <FiArrowLeft className="mr-2 h-5 w-5" />
            Kembali ke Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{tenant.business_name || tenant.username}</h1>
              <p className="text-blue-100 mt-1">Detail Toko & Produk Tenant</p>
            </div>
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {(tenant.business_name || tenant.username).charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Produk</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FiPackage className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Terjual</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalSold}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FiTrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pendapatan</p>
                <p className="text-2xl font-bold text-purple-600">
                  Rp {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FiDollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tenant Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiUser className="mr-2 h-5 w-5 text-blue-600" />
                Informasi Tenant
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Username</p>
                  <p className="font-medium text-gray-900">{tenant.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <FiMail className="mr-1 h-4 w-4" /> Email
                  </p>
                  <p className="font-medium text-gray-900">{tenant.email}</p>
                </div>
                {tenant.phone && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center">
                      <FiPhone className="mr-1 h-4 w-4" /> Telepon
                    </p>
                    <p className="font-medium text-gray-900">{tenant.phone}</p>
                  </div>
                )}
                {tenant.address && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center">
                      <FiMapPin className="mr-1 h-4 w-4" /> Alamat
                    </p>
                    <p className="font-medium text-gray-900">{tenant.address}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <FiCalendar className="mr-1 h-4 w-4" /> Bergabung
                  </p>
                  <p className="font-medium text-gray-900">
                    {new Date(tenant.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    tenant.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tenant.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FiBarChart2 className="mr-2 h-5 w-5 text-blue-600" />
                Daftar Produk ({products.length})
              </h2>

              {products.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Tenant ini belum memiliki produk</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => e.target.src = '/images/placeholder.svg'}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-lg font-bold text-blue-600">
                            Rp {parseInt(product.price).toLocaleString()}
                          </span>
                          <div className="flex items-center space-x-1">
                            <FiStar className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">{(product.average_rating || 0).toFixed(1)}</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            product.stock === 'available' ? 'bg-green-100 text-green-800' :
                            product.stock === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.stock || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-green-600 font-semibold">
                          <FiTrendingUp className="h-4 w-4 mr-1" />
                          {product.total_sold || 0}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">terjual</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDetail;
