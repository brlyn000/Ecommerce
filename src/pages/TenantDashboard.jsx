import { useState, useEffect } from 'react';
import { FiPackage, FiMenu, FiHome, FiBarChart, FiLogOut, FiUser, FiHeart, FiBell, FiCheck, FiX, FiEye, FiRefreshCw } from 'react-icons/fi';
import { api } from '../services/api';
import TenantProductManager from '../components/TenantProductManager';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TenantDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalQuantity: 0,
    totalLikes: 0,
    totalViews: 0
  });
  const [likeNotifications, setLikeNotifications] = useState([]);
  const [checkoutNotifications, setCheckoutNotifications] = useState([]);
  const [commentNotifications, setCommentNotifications] = useState([]);
  const [activeNotificationTab, setActiveNotificationTab] = useState('all');

  const [productAnalytics, setProductAnalytics] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [chartData, setChartData] = useState({
    monthlyQuantity: [],
    topProducts: []
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
  }, []);
  
  useEffect(() => {
    if (user?.id) {
      fetchStats();
      fetchNotifications();
      fetchProductAnalytics();
      fetchOrders();
      fetchChartData();
      
      // Listen for order updates
      const handleOrderUpdate = () => {
        fetchNotifications();
        fetchProductAnalytics();
        fetchStats();
        fetchOrders();
      };
      
      window.addEventListener('orderUpdated', handleOrderUpdate);
      window.addEventListener('productUpdated', handleOrderUpdate);
      
      // Listen for notification updates
      const handleNotificationUpdate = () => {
        fetchNotifications();
      };
      window.addEventListener('notificationUpdated', handleNotificationUpdate);
      
      return () => {
        window.removeEventListener('orderUpdated', handleOrderUpdate);
        window.removeEventListener('productUpdated', handleOrderUpdate);
        window.removeEventListener('notificationUpdated', handleNotificationUpdate);
      };
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user?.id) return;
    
    try {
      const stats = await api.getTenantOverviewStats();
      setStats({
        totalQuantity: stats.totalQuantity || 0,
        totalLikes: stats.totalLikes || 0,
        totalViews: stats.totalOrders || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch all notifications at once
      const allNotifs = await api.getTenantNotifications();
      console.log('Fetched notifications:', allNotifs);
      
      // Separate by type
      const likeNotifs = allNotifs.filter(n => n.type === 'like');
      const checkoutNotifs = allNotifs.filter(n => n.type === 'checkout');
      const commentNotifs = allNotifs.filter(n => n.type === 'comment' || n.type === 'review');
      
      const formattedLikes = likeNotifs.map(notif => ({
        id: notif.id,
        type: notif.type,
        productName: notif.product_name,
        customerName: notif.data ? notif.data.customer_name : 'Unknown',
        message: notif.message,
        date: notif.created_at,
        read: notif.is_read,
        data: notif.data
      }));
      setLikeNotifications(formattedLikes);
      
      const formattedCheckouts = checkoutNotifs.map(notif => ({
        id: notif.id,
        type: notif.type,
        orderId: notif.order_id,
        customerName: notif.data ? notif.data.customer_name : 'Unknown',
        message: notif.message,
        amount: notif.data ? notif.data.total_amount : 0,
        products: notif.data ? [notif.data.product_name] : [],
        quantity: notif.data ? notif.data.quantity : 0,
        date: notif.created_at,
        read: notif.is_read
      }));
      setCheckoutNotifications(formattedCheckouts);
      
      const formattedComments = commentNotifs.map(notif => ({
        id: notif.id,
        type: notif.type,
        productId: notif.product_id,
        productName: notif.product_name,
        customerName: notif.data ? notif.data.customer_name : 'Unknown',
        customerEmail: notif.data ? notif.data.customer_email : '',
        comment: notif.data ? notif.data.comment : '',
        rating: notif.data ? notif.data.rating : null,
        commentType: notif.data ? notif.data.comment_type : 'comment',
        message: notif.message,
        date: notif.created_at,
        read: notif.is_read
      }));
      setCommentNotifications(formattedComments);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLikeNotifications([]);
      setCheckoutNotifications([]);
      setCommentNotifications([]);
    }
  };

  const fetchProductAnalytics = async () => {
    if (!user?.id) return;
    
    try {
      const analytics = await api.getTenantProductAnalytics();
      const formattedAnalytics = analytics.map(product => ({
        id: product.id,
        name: product.name,
        likes: product.likes_count || 0,
        views: product.total_orders || 0,
        orders: product.total_quantity || 0,
        revenue: product.total_revenue || 0
      }));
      setProductAnalytics(formattedAnalytics);
    } catch (error) {
      console.error('Error fetching product analytics:', error);
    }
  };

  const fetchOrders = async () => {
    if (!user?.id) return;
    
    try {
      const ordersData = await api.getTenantOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchChartData = async () => {
    if (!user?.id) return;
    
    try {
      const data = await api.getTenantChartData(selectedYear, selectedMonth);
      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchChartData();
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    let filtered = orders;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        
        switch (dateFilter) {
          case 'today':
            return orderDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
          case 'year':
            return orderDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }
    
    setFilteredOrders(filtered);
  }, [orders, statusFilter, dateFilter]);

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.markNotificationAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async (type) => {
    try {
      await api.markAllNotificationsAsRead(type);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleOrderAction = async (orderId, action) => {
    try {
      if (action === 'reject') {
        setSelectedOrder(orderId);
        setShowRejectModal(true);
        return;
      }
      
      const status = action === 'accept' ? 'accepted' : action;
      await api.updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order status');
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    try {
      await api.updateOrderStatus(selectedOrder, 'rejected', rejectionReason);
      setShowRejectModal(false);
      setSelectedOrder(null);
      setRejectionReason('');
      fetchOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: FiHome },
    { id: 'products', label: 'My Products', icon: FiPackage },
    { id: 'orders', label: 'Orders', icon: FiPackage },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'profile', label: 'Profile', icon: FiUser },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Total Quantity Sold</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.totalQuantity}</p>
                    <p className="text-xs text-blue-500 mt-1">Items delivered</p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-full">
                    <FiPackage className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-1">Total Likes</p>
                    <p className="text-3xl font-bold text-red-900">{stats.totalLikes}</p>
                    <p className="text-xs text-red-500 mt-1">Customer favorites</p>
                  </div>
                  <div className="bg-red-500 p-3 rounded-full">
                    <FiHeart className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Total Orders</p>
                    <p className="text-3xl font-bold text-green-900">{stats.totalViews}</p>
                    <p className="text-xs text-green-500 mt-1">Successful transactions</p>
                  </div>
                  <div className="bg-green-500 p-3 rounded-full">
                    <FiBarChart className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Welcome back, {user?.full_name || user?.username}! 👋</h3>
                  <p className="text-indigo-100">
                    Manage your products and track their performance from this dashboard.
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/20 p-4 rounded-full">
                    <FiUser className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Charts Section */}
            <div className="space-y-6">
              {/* Chart Filters */}
              <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                <div className="flex flex-wrap items-center gap-4">
                  <h3 className="text-lg font-semibold text-gray-800">Analytics Filters</h3>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-600">Year:</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-600">Month:</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Months</option>
                      {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>
                          {new Date(2024, month - 1).toLocaleDateString('id-ID', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Quantity Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Monthly Quantity Sold</h3>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FiBarChart className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                {chartData.monthlyQuantity.length > 0 ? (
                  <div className="h-64">
                  <Line
                    data={{
                      labels: chartData.monthlyQuantity.map(item => {
                        const [year, month] = item.month.split('-');
                        return new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
                      }).reverse(),
                      datasets: [{
                        label: 'Quantity Sold',
                        data: chartData.monthlyQuantity.map(item => item.quantity).reverse(),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: 'rgb(59, 130, 246)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          borderColor: 'rgb(59, 130, 246)',
                          borderWidth: 1,
                          cornerRadius: 8
                        }
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { color: '#6B7280' }
                        },
                        y: {
                          beginAtZero: true,
                          grid: { color: '#F3F4F6' },
                          ticks: { color: '#6B7280' }
                        }
                      },
                      animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart'
                      }
                    }}
                  />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No data available</p>
                  </div>
                )}
              </div>
              
                {/* Top Products Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Top Products (Orders & Likes)</h3>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FiPackage className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                {chartData.topProducts.length > 0 ? (
                  <div className="h-64">
                  <Bar
                    data={{
                      labels: chartData.topProducts.map(item => item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name),
                      datasets: [
                        {
                          label: 'Orders',
                          data: chartData.topProducts.map(item => item.orders),
                          backgroundColor: 'rgba(34, 197, 94, 0.8)',
                          borderColor: 'rgb(34, 197, 94)',
                          borderWidth: 2,
                          borderRadius: 8,
                          borderSkipped: false,
                        },
                        {
                          label: 'Likes',
                          data: chartData.topProducts.map(item => item.likes),
                          backgroundColor: 'rgba(239, 68, 68, 0.8)',
                          borderColor: 'rgb(239, 68, 68)',
                          borderWidth: 2,
                          borderRadius: 8,
                          borderSkipped: false,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: { weight: 'bold' }
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          cornerRadius: 8
                        }
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { color: '#6B7280' }
                        },
                        y: {
                          beginAtZero: true,
                          grid: { color: '#F3F4F6' },
                          ticks: { color: '#6B7280' }
                        }
                      },
                      animation: {
                        duration: 2000,
                        easing: 'easeInOutBounce'
                      }
                    }}
                  />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No data available</p>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'products':
        return <TenantProductManager />;
      
      case 'orders':
        return (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h3 className="text-lg font-semibold mb-4 sm:mb-0">Order Management</h3>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="completed">Completed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="rejected">Rejected</option>
                    <option value="disputed">Disputed</option>
                  </select>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              </div>
              
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-4">
                {filteredOrders.map((order) => (
                  <div key={`${order.order_id}-${order.product_id}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">#{order.order_id}</h4>
                        <p className="text-sm text-gray-500">{order.customer_name}</p>
                        {order.customer_email && (
                          <p className="text-xs text-gray-400">{order.customer_email}</p>
                        )}
                        {order.customer_phone && (
                          <p className="text-xs text-gray-400">{order.customer_phone}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-2 mb-3">
                      <p className="text-sm"><span className="font-medium">Product:</span> {order.product_name}</p>
                      <p className="text-sm"><span className="font-medium">Quantity:</span> {order.quantity}</p>
                      <p className="text-sm"><span className="font-medium">Total:</span> {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.price * order.quantity)}</p>
                    </div>
                    <div className="flex space-x-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleOrderAction(order.order_id, 'accept')}
                            className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleOrderAction(order.order_id, 'reject')}
                            className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => handleOrderAction(order.order_id, 'completed')}
                          className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredOrders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FiPackage className="w-12 h-12 mx-auto mb-2" />
                    <p>{orders.length === 0 ? 'No orders yet' : 'No orders match the selected filters'}</p>
                  </div>
                )}
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={`${order.order_id}-${order.product_id}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.order_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <p className="font-medium text-gray-900">{order.customer_name}</p>
                            {order.customer_email && (
                              <p className="text-xs text-gray-500">{order.customer_email}</p>
                            )}
                            {order.customer_phone && (
                              <p className="text-xs text-gray-500">{order.customer_phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.product_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.price * order.quantity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleOrderAction(order.order_id, 'accept')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleOrderAction(order.order_id, 'reject')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {order.status === 'accepted' && (
                            <button
                              onClick={() => handleOrderAction(order.order_id, 'completed')}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Mark Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredOrders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FiPackage className="w-12 h-12 mx-auto mb-2" />
                    <p>{orders.length === 0 ? 'No orders yet' : 'No orders match the selected filters'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Product Analytics</h3>
              
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-4">
                {productAnalytics.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{product.name}</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center">
                        <FiEye className="w-4 h-4 mr-1 text-blue-500" />
                        <span>Orders: {product.views}</span>
                      </div>
                      <div className="flex items-center">
                        <FiHeart className="w-4 h-4 mr-1 text-red-500" />
                        <span>Likes: {product.likes}</span>
                      </div>
                      <div>
                        <span className="font-medium">Qty:</span> {product.orders}
                      </div>
                      <div>
                        <span className="font-medium text-green-600">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.revenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productAnalytics.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiEye className="w-4 h-4 mr-1" />
                            {product.views}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiHeart className="w-4 h-4 mr-1 text-red-500" />
                            {product.likes}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.orders}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        const allNotifications = [...likeNotifications, ...checkoutNotifications, ...commentNotifications].sort((a, b) => new Date(b.date) - new Date(a.date));
        const displayNotifications = activeNotificationTab === 'all' ? allNotifications : 
                                   activeNotificationTab === 'likes' ? likeNotifications : 
                                   activeNotificationTab === 'checkout' ? checkoutNotifications : commentNotifications;
        
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <button
                  onClick={fetchNotifications}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 flex items-center"
                >
                  <FiRefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </button>
              </div>
              
              {/* Notification Tabs */}
              <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveNotificationTab('all')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    activeNotificationTab === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  All ({allNotifications.length})
                </button>
                <button
                  onClick={() => setActiveNotificationTab('likes')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors flex items-center ${
                    activeNotificationTab === 'likes' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FiHeart className="w-4 h-4 mr-1" />
                  Likes ({likeNotifications.length})
                </button>
                <button
                  onClick={() => setActiveNotificationTab('checkout')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors flex items-center ${
                    activeNotificationTab === 'checkout' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FiPackage className="w-4 h-4 mr-1" />
                  Orders ({checkoutNotifications.length})
                </button>
                <button
                  onClick={() => setActiveNotificationTab('comments')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors flex items-center ${
                    activeNotificationTab === 'comments' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FiUser className="w-4 h-4 mr-1" />
                  Comments ({commentNotifications.length})
                </button>
              </div>
              
              {/* Mark All as Read */}
              {displayNotifications.some(n => !n.read) && (
                <div className="mb-4">
                  <button
                    onClick={() => markAllAsRead(activeNotificationTab === 'all' ? null : activeNotificationTab === 'likes' ? 'like' : 'checkout')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
              
              <div className="space-y-4">
                {displayNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                    }`}
                    onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {notification.type === 'like' ? (
                            <FiHeart className="w-4 h-4 text-red-500 mr-2" />
                          ) : notification.type === 'comment' ? (
                            <FiUser className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <FiPackage className="w-4 h-4 text-blue-500 mr-2" />
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            notification.type === 'like' ? 'bg-red-100 text-red-800' : 
                            notification.type === 'comment' ? 'bg-green-100 text-green-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {notification.type === 'like' ? 'Like' : notification.type === 'comment' ? 'Comment' : 'Order'}
                          </span>
                          {!notification.read && (
                            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-800 font-medium mb-1">{notification.message}</p>
                        
                        {notification.type === 'like' && (
                          <>
                            <p className="text-sm text-gray-600">Product: {notification.productName}</p>
                            {notification.data && notification.data.final_price && (
                              <div className="text-sm text-gray-600">
                                Price: {notification.data.discount > 0 ? (
                                  <>
                                    <span className="line-through text-gray-400 mr-2">
                                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(notification.data.original_price)}
                                    </span>
                                    <span className="text-blue-600 font-medium">
                                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(notification.data.final_price)}
                                    </span>
                                    <span className="text-red-600 text-xs ml-1">(-{notification.data.discount}%)</span>
                                  </>
                                ) : (
                                  <span className="text-blue-600 font-medium">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(notification.data.final_price)}
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        )}
                        
                        {notification.type === 'checkout' && (
                          <>
                            <p className="text-sm text-gray-600">Order ID: #{notification.orderId}</p>
                            <p className="text-sm text-gray-600">
                              Amount: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(notification.amount)}
                            </p>
                            <p className="text-sm text-gray-600">Quantity: {notification.quantity} items</p>
                            {notification.products && notification.products.length > 0 && (
                              <p className="text-sm text-gray-600">Products: {notification.products.join(', ')}</p>
                            )}
                          </>
                        )}
                        
                        {(notification.type === 'comment' || notification.type === 'review') && (
                          <>
                            <p className="text-sm text-gray-600">Product: {notification.productName}</p>
                            {notification.rating && (
                              <div className="flex items-center mt-1">
                                <span className="text-sm text-gray-600 mr-2">Rating:</span>
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className={`text-sm ${
                                      star <= notification.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}>
                                      ★
                                    </span>
                                  ))}
                                  <span className="text-sm text-gray-600 ml-1">({notification.rating}/5)</span>
                                </div>
                              </div>
                            )}
                            <div className="bg-gray-100 p-3 rounded-lg mt-2">
                              <p className="text-sm text-gray-800 italic">"{notification.comment}"</p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Email: {notification.customerEmail}</p>
                            {notification.commentType && (
                              <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                                notification.commentType === 'review' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {notification.commentType === 'review' ? 'Review' : 'Comment'}
                              </span>
                            )}
                          </>
                        )}
                        
                        <p className="text-sm text-gray-600">Customer: {notification.customerName}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.date).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {displayNotifications.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FiBell className="w-12 h-12 mx-auto mb-2" />
                    <p>No {activeNotificationTab === 'all' ? '' : activeNotificationTab} notifications yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input 
                  type="text" 
                  value={user?.full_name || ''} 
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" 
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" 
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input 
                  type="text" 
                  value={user?.username || ''} 
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" 
                  readOnly
                />
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
      </div>
      {/* Enhanced Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-transform duration-300`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <FiUser className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Tenant Panel</h2>
                <p className="text-xs text-slate-400">Business Dashboard</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:transform hover:scale-105'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-700">
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Logged in as</p>
              <p className="text-sm font-medium text-white truncate">{user?.full_name || user?.username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black opacity-70 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Mobile-Friendly Header */}
        <div className="bg-white shadow-lg border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center min-w-0 flex-1">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden mr-3 p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  <FiMenu className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent truncate">
                      {menuItems.find(item => item.id === activeMenu)?.label || 'Dashboard'}
                    </h1>
                    <div className="hidden sm:block bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 rounded-full">
                      <span className="text-xs font-medium text-white">Tenant</span>
                    </div>
                  </div>
                  <p className="hidden sm:block text-sm text-gray-500 mt-1">
                    {new Date().toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Mobile Refresh Button */}
                <button
                  onClick={() => {
                    fetchStats();
                    fetchNotifications();
                    fetchProductAnalytics();
                    fetchChartData();
                  }}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:scale-105"
                  title="Refresh Data"
                >
                  <FiRefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                </button>
                
                {/* Mobile Notification Badge */}
                <button
                  onClick={() => setActiveMenu('notifications')}
                  className="relative p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:scale-105"
                  title="Notifications"
                >
                  <FiBell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  {[...likeNotifications, ...checkoutNotifications, ...commentNotifications].filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold animate-pulse">
                      {[...likeNotifications, ...checkoutNotifications, ...commentNotifications].filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                
                {/* Mobile User Profile */}
                <div className="flex items-center space-x-2 bg-gray-50 rounded-xl p-1 sm:p-2">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-24">{user?.full_name || user?.username}</p>
                    <p className="text-xs text-gray-500">Business Owner</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs sm:text-sm font-bold">
                      {(user?.full_name || user?.username || 'T').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-1 sm:p-2 text-gray-400 hover:text-red-500 transition-colors hover:scale-105"
                    title="Logout"
                  >
                    <FiLogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 relative z-10">
          {renderContent()}
        </div>
      </div>
      
      {/* Reject Order Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Order</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this order:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none"
              placeholder="Enter rejection reason..."
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedOrder(null);
                  setRejectionReason('');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectOrder}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                Reject Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};



export default TenantDashboard;