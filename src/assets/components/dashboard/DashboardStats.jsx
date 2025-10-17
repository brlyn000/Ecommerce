import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiGrid, FiMail, FiImage, FiActivity, FiDatabase, FiServer, FiHardDrive } from 'react-icons/fi';
import { getAnalyticsOverview, getContactAnalytics } from '../../../services/api';

const DashboardStats = () => {
  const [overview, setOverview] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewData, contactData] = await Promise.all([
        getAnalyticsOverview(),
        getContactAnalytics()
      ]);
      
      setOverview(overviewData);
      setRecentActivity(contactData.recentActivity || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatCards = () => {
    if (!overview) return [];
    
    return [
      {
        title: 'Total Produk',
        value: overview.overview.products,
        icon: FiPackage,
        color: 'bg-blue-500',
        change: '+' + Math.floor(Math.random() * 10) + '%'
      },
      {
        title: 'Total Kategori',
        value: overview.overview.categories,
        icon: FiGrid,
        color: 'bg-green-500',
        change: '+' + Math.floor(Math.random() * 5) + '%'
      },
      {
        title: 'Total Kontak',
        value: overview.overview.contacts,
        icon: FiMail,
        color: 'bg-purple-500',
        change: '+' + Math.floor(Math.random() * 15) + '%'
      },
      {
        title: 'Carousel Items',
        value: overview.overview.carousel,
        icon: FiImage,
        color: 'bg-orange-500',
        change: '+' + Math.floor(Math.random() * 8) + '%'
      },
    ];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatCards().map((card, index) => {
          const Icon = card.icon;
          return (  
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-green-600">{card.change}</p>
                </div>
                <div className={`p-3 rounded-full ${card.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 4).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'new' ? 'bg-blue-500' :
                    activity.status === 'read' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Kontak dari {activity.name}</p>
                    <p className="text-xs text-gray-500">{activity.subject} - {new Date(activity.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Tidak ada aktivitas terbaru</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="space-y-3">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('switchMenu', { detail: 'products' }))}
              className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <p className="font-medium text-blue-900">Tambah Produk</p>
              <p className="text-sm text-blue-600">Buat listing produk baru</p>
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('switchMenu', { detail: 'categories' }))}
              className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <p className="font-medium text-green-900">Kelola Kategori</p>
              <p className="text-sm text-green-600">Update kategori produk</p>
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('switchMenu', { detail: 'carousel' }))}
              className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <p className="font-medium text-purple-900">Update Carousel</p>
              <p className="text-sm text-purple-600">Kelola banner homepage</p>
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('switchMenu', { detail: 'analytics' }))}
              className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <p className="font-medium text-orange-900">Lihat Analytics</p>
              <p className="text-sm text-orange-600">Cek metrik performa</p>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Teratas</h3>
          <div className="space-y-3">
            {overview && overview.productsByCategory.map((category, index) => {
              const maxCount = Math.max(...overview.productsByCategory.map(c => c.count));
              const percentage = Math.round((category.count / maxCount) * 100);
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{category.category}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className={`${colors[index % colors.length]} h-2 rounded-full`} style={{width: `${percentage}%`}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{category.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Kontak</h3>
          <div className="space-y-3">
            {overview && overview.contactStatus.map((status, index) => {
              const statusLabels = { new: 'Baru', read: 'Dibaca', replied: 'Dibalas' };
              const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{statusLabels[status.status] || status.status}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className={`${colors[index]} h-2 rounded-full`} style={{width: '100%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{status.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;