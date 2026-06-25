import { useState, useEffect } from 'react';
import { FiGrid, FiPackage, FiUsers, FiImage, FiMenu, FiHome, FiBarChart, FiSettings, FiBell, FiLogOut, FiMail, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { API_BASE_URL } from '../config/api';
import DashboardStats from '../assets/components/dashboard/DashboardStats';
import CategoryManager from '../assets/components/dashboard/CategoryManager';
import ProductManager from '../assets/components/dashboard/ProductManager';
import CarouselManager from '../assets/components/dashboard/CarouselManager';
import UserManager from '../assets/components/dashboard/UserManager';
import TenantManager from '../assets/components/dashboard/TenantManager';
import ContactManager from '../assets/components/dashboard/ContactManager';
import Analytics from '../assets/components/dashboard/Analytics';
import OrderManager from '../assets/components/dashboard/OrderManager';

const menuItems = [
  { id: 'overview',   label: 'Dashboard Overview', icon: FiHome },
  { id: 'orders',     label: 'Order Management',   icon: FiShoppingBag },
  { id: 'products',   label: 'Manage Products',    icon: FiPackage },
  { id: 'categories', label: 'Manage Categories',  icon: FiGrid },
  { id: 'carousel',   label: 'Manage Carousel',    icon: FiImage },
  { id: 'tenants',    label: 'Tenant Management',  icon: FiUsers },
  { id: 'users',      label: 'User Management',    icon: FiUsers },
  { id: 'contacts',   label: 'Kontak Kami',        icon: FiMail },
  { id: 'analytics',  label: 'Analytics',          icon: FiBarChart },
  { id: 'settings',   label: 'Settings',           icon: FiSettings },
];

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const { logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState(settings);

  useEffect(() => { setFormData(settings); }, [settings]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const handleMenuSwitch = (e) => { setActiveMenu(e.detail); setSidebarOpen(false); };
    window.addEventListener('switchMenu', handleMenuSwitch);
    return () => window.removeEventListener('switchMenu', handleMenuSwitch);
  }, []);

  useEffect(() => {
    const fetchNotif = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_BASE_URL}/orders/admin/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const grouped = {};
        data.forEach(r => { if (!grouped[r.order_id]) grouped[r.order_id] = r; });
        const pending = Object.values(grouped)
          .filter(o => o.status === 'pending')
          .slice(0, 10)
          .map(o => ({
            id: o.order_id,
            message: `Order baru dari ${o.customer_name}`,
            time: new Date(o.created_at).toLocaleString('id-ID'),
            unread: true,
          }));
        setNotifications(pending);
      } catch {}
    };
    fetchNotif();
  }, []);

  const handleSaveSettings = () => {
    updateSettings(formData);
    alert('Settings saved successfully!');
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'overview':   return <DashboardStats />;
      case 'orders':     return <OrderManager />;
      case 'categories': return <CategoryManager />;
      case 'products':   return <ProductManager />;
      case 'carousel':   return <CarouselManager />;
      case 'tenants':    return <TenantManager />;
      case 'users':      return <UserManager />;
      case 'contacts':   return <ContactManager />;
      case 'analytics':  return <Analytics />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Site Name', key: 'siteName', type: 'text' },
                    { label: 'Admin Email', key: 'adminEmail', type: 'email' },
                    { label: 'Phone', key: 'phone', type: 'text' },
                    { label: 'WhatsApp', key: 'whatsapp', type: 'text' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                      <input type={f.type} value={formData[f.key] || ''}
                        onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                    <textarea value={formData.companyAddress || ''}
                      onChange={e => setFormData({ ...formData, companyAddress: e.target.value })}
                      rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                  </div>
                  <button onClick={handleSaveSettings}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Login Notifications</span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">Active</span>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default: return <DashboardStats />;
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;
  const initials = (currentUser?.full_name || currentUser?.username || 'A').charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-red-900 via-red-800 to-red-900 shadow-2xl transition-transform duration-300`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-red-700">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FiSettings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                <p className="text-xs text-red-300">Control Center</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveMenu(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-red-600 shadow-lg font-semibold'
                      : 'text-red-200 hover:bg-red-700/60 hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{item.label}</span>
                  {isActive && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />}
                  {item.id === 'orders' && unreadCount > 0 && !isActive && (
                    <span className="ml-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-red-700">
            <div className="bg-red-950/50 rounded-xl p-3">
              <p className="text-xs text-red-400 mb-0.5">Logged in as</p>
              <p className="text-sm font-semibold text-white truncate">{currentUser?.full_name || currentUser?.username || 'Administrator'}</p>
              <p className="text-xs text-red-400 truncate">{currentUser?.email || ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center min-w-0 flex-1">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden mr-3 p-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <FiMenu className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-900 truncate">
                      {menuItems.find(i => i.id === activeMenu)?.label || 'Dashboard'}
                    </h1>
                    <span className="hidden sm:block bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">Admin</span>
                  </div>
                  <p className="hidden sm:block text-xs text-gray-400 mt-0.5">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors relative"
                  >
                    <FiBell className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border z-50">
                      <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Pending Orders</h3>
                        <span className="text-xs text-gray-500 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{unreadCount} baru</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y">
                        {notifications.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-6">Tidak ada order pending</p>
                        ) : notifications.map(n => (
                          <div
                            key={n.id}
                            className="p-3 hover:bg-orange-50 transition-colors cursor-pointer"
                            onClick={() => { setActiveMenu('orders'); setShowNotifications(false); }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{n.message}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{n.time}</p>
                              </div>
                              <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0 animate-pulse" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t bg-gray-50 rounded-b-xl">
                        <button
                          onClick={() => { setActiveMenu('orders'); setShowNotifications(false); }}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Lihat semua order →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1.5 sm:p-2">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {currentUser?.full_name || currentUser?.username || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="h-8 w-8 sm:h-9 sm:w-9 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow">
                    <span className="text-white text-sm font-bold">{initials}</span>
                  </div>
                  <button onClick={logout} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                    <FiLogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
