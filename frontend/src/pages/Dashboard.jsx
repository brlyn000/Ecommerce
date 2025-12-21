import { useState, useEffect } from 'react';
import { FiGrid, FiPackage, FiUsers, FiImage, FiMenu, FiHome, FiBarChart, FiSettings, FiBell, FiLogOut, FiMail } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import DashboardStats from '../assets/components/dashboard/DashboardStats';
import CategoryManager from '../assets/components/dashboard/CategoryManager';
import ProductManager from '../assets/components/dashboard/ProductManager';
import CarouselManager from '../assets/components/dashboard/CarouselManager';
import UserManager from '../assets/components/dashboard/UserManager';
import TenantManager from '../assets/components/dashboard/TenantManager';
import ContactManager from '../assets/components/dashboard/ContactManager';
import Analytics from '../assets/components/dashboard/Analytics';

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSaveSettings = () => {
    updateSettings(formData);
    alert('Settings saved successfully!');
  };

  useEffect(() => {
    const handleMenuSwitch = (event) => {
      setActiveMenu(event.detail);
      setSidebarOpen(false);
    };

    window.addEventListener('switchMenu', handleMenuSwitch);
    return () => window.removeEventListener('switchMenu', handleMenuSwitch);
  }, []);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New product added', time: '2 min ago', unread: true },
    { id: 2, message: 'Category updated', time: '1 hour ago', unread: true },
    { id: 3, message: 'User registered', time: '3 hours ago', unread: false },
  ]);

  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: FiHome },
    { id: 'categories', label: 'Manage Categories', icon: FiGrid },
    { id: 'products', label: 'Manage Products', icon: FiPackage },
    { id: 'carousel', label: 'Manage Carousel', icon: FiImage },
    { id: 'contacts', label: 'Kontak Kami', icon: FiMail },
    { id: 'tenants', label: 'Tenant Management', icon: FiUsers },
    { id: 'users', label: 'User Management', icon: FiUsers },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'overview':
        return <DashboardStats />;
      case 'categories':
        return <CategoryManager />;
      case 'products':
        return <ProductManager />;
      case 'carousel':
        return <CarouselManager />;
      case 'tenants':
        return <TenantManager />;
      case 'users':
        return <UserManager />;
      case 'contacts':
        return <ContactManager />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                    <input 
                      type="text" 
                      value={formData.siteName} 
                      onChange={(e) => setFormData({...formData, siteName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                    <input 
                      type="email" 
                      value={formData.adminEmail} 
                      onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                    <textarea 
                      value={formData.companyAddress} 
                      onChange={(e) => setFormData({...formData, companyAddress: e.target.value})}
                      rows={3} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                    <input 
                      type="text" 
                      value={formData.whatsapp} 
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
                    />
                  </div>
                  <button 
                    onClick={handleSaveSettings}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
                    <button className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm hover:bg-green-200 transition-colors">Enabled</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Login Notifications</span>
                    <button className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm hover:bg-red-200 transition-colors">Active</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Auto Logout</span>
                    <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>2 hours</option>
                    </select>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Change Password</button>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-red-600 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Product Updates</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-red-600 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Order Notifications</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-red-600 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">System Alerts</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-red-600 rounded" />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardStats />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-red-900 via-red-800 to-red-900 shadow-2xl transition-transform duration-300`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-red-700">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-white to-red-100 p-2 rounded-lg">
                <FiSettings className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                <p className="text-xs text-red-300">Control Center</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
                      ? 'bg-gradient-to-r from-white to-red-100 text-red-600 shadow-lg transform scale-105'
                      : 'text-red-200 hover:bg-red-700 hover:text-white hover:transform hover:scale-105'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-red-700">
            <div className="bg-red-800 rounded-lg p-3">
              <p className="text-xs text-red-300 mb-1">Logged in as</p>
              <p className="text-sm font-medium text-white">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-white shadow-lg border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center min-w-0 flex-1">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden mr-3 p-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md"
                >
                  <FiMenu className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent truncate">
                      {menuItems.find(item => item.id === activeMenu)?.label || 'Dashboard Overview'}
                    </h1>
                    <div className="hidden sm:block bg-gradient-to-r from-red-500 to-red-600 px-3 py-1 rounded-full">
                      <span className="text-xs font-medium text-white">Admin</span>
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
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:scale-105 relative"
                  >
                    <FiBell className="h-5 w-5 text-gray-600" />
                    {notifications.some(n => n.unread) && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                        {notifications.filter(n => n.unread).length}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border z-50">
                      <div className="p-4 border-b bg-gradient-to-r from-red-50 to-white">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map(notification => (
                          <div key={notification.id} className="p-3 border-b hover:bg-red-50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 font-medium">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 animate-pulse"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t bg-gray-50">
                        <button 
                          onClick={() => {
                            setNotifications(notifications.map(n => ({ ...n, unread: false })));
                            setShowNotifications(false);
                          }}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Mark all as read
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* User Menu */}
                <div className="flex items-center space-x-2 bg-gray-50 rounded-xl p-1 sm:p-2">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">
                      {new Date().toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">A</span>
                  </div>
                  <button 
                    onClick={logout}
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
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;