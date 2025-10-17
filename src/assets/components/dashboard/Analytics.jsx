import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiUsers, FiPackage, FiMail, FiGrid, FiImage } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { getAnalyticsOverview, getProductAnalytics, getContactAnalytics } from '../../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [productAnalytics, setProductAnalytics] = useState(null);
  const [contactAnalytics, setContactAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewData, productData, contactData] = await Promise.all([
        getAnalyticsOverview(),
        getProductAnalytics(),
        getContactAnalytics()
      ]);
      
      setOverview(overviewData);
      setProductAnalytics(productData);
      setContactAnalytics(contactData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-lg shadow-sm border"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
              <FiTrendingUp className="h-4 w-4 mr-1" />
              {trend > 0 ? '+' : ''}{trend}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const BarChart = ({ data, title, color = '#3B82F6' }) => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Tidak ada data
          </div>
        </div>
      );
    }

    const chartData = {
      labels: data.map(item => item.category || item.status || item.name),
      datasets: [
        {
          label: 'Jumlah',
          data: data.map(item => item.count),
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-64">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    );
  };

  const PieChart = ({ data, title }) => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Tidak ada data
          </div>
        </div>
      );
    }

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    const chartData = {
      labels: data.map(item => {
        const label = item.status || item.category;
        return label === 'new' ? 'Baru' : label === 'read' ? 'Dibaca' : label === 'replied' ? 'Dibalas' : label;
      }),
      datasets: [
        {
          data: data.map(item => item.count),
          backgroundColor: colors.slice(0, data.length),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-64">
          <Doughnut data={chartData} options={options} />
        </div>
      </div>
    );
  };

  const LineChart = ({ data, title, color = '#3B82F6' }) => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Tidak ada data dalam 30 hari terakhir
          </div>
        </div>
      );
    }

    const chartData = {
      labels: data.map(item => 
        new Date(item.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
      ),
      datasets: [
        {
          label: 'Jumlah',
          data: data.map(item => item.count),
          borderColor: color,
          backgroundColor: color + '20',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: color,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-64">
          <Line data={chartData} options={options} />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Produk"
            value={overview.overview.products}
            icon={FiPackage}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Kategori"
            value={overview.overview.categories}
            icon={FiGrid}
            color="bg-green-500"
          />
          <StatCard
            title="Total Kontak"
            value={overview.overview.contacts}
            icon={FiMail}
            color="bg-purple-500"
          />
          <StatCard
            title="Carousel Items"
            value={overview.overview.carousel}
            icon={FiImage}
            color="bg-orange-500"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products by Category */}
        {overview && (
          <BarChart
            data={overview.productsByCategory}
            title="Produk per Kategori"
            color="#3B82F6"
          />
        )}

        {/* Contact Status */}
        {overview && (
          <PieChart
            data={overview.contactStatus}
            title="Status Kontak"
          />
        )}

        {/* Products Over Time */}
        {productAnalytics && (
          <LineChart
            data={productAnalytics.productsOverTime}
            title="Produk Ditambahkan (30 hari terakhir)"
            color="#10B981"
          />
        )}

        {/* Contacts Over Time */}
        {contactAnalytics && (
          <LineChart
            data={contactAnalytics.contactsOverTime}
            title="Kontak Masuk (30 hari terakhir)"
            color="#8B5CF6"
          />
        )}
      </div>

      {/* Recent Activity */}
      {contactAnalytics && contactAnalytics.recentActivity && contactAnalytics.recentActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Aktivitas Terbaru</h3>
          </div>
          <div className="divide-y">
            {contactAnalytics.recentActivity.map((activity, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{activity.name}</p>
                    <p className="text-sm text-gray-600">{activity.email}</p>
                    <p className="text-sm text-gray-800 mt-1">{activity.subject}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      activity.status === 'read' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {activity.status === 'new' ? 'Baru' : activity.status === 'read' ? 'Dibaca' : 'Dibalas'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;