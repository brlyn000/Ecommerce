import { useState, useEffect } from 'react';
import { FiGrid, FiPackage, FiUsers, FiImage, FiMenu, FiHome, FiBarChart, FiSettings, FiBell, FiLogOut, FiMail } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import DashboardStats from '../assets/components/dashboard/DashboardStats';
import CategoryManager from '../assets/components/dashboard/CategoryManager';
import ProductManager from '../assets/components/dashboard/ProductManager';
import CarouselManager from '../assets/components/dashboard/CarouselManager';
import UserManager from '../assets/components/dashboard/UserManager';
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                    <input 
                      type="email" 
                      value={formData.adminEmail} 
                      onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                    <textarea 
                      value={formData.companyAddress} 
                      onChange={(e) => setFormData({...formData, companyAddress: e.target.value})}
                      rows={3} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                    <input 
                      type="text" 
                      value={formData.whatsapp} 
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <button 
                    onClick={handleSaveSettings}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                    <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition-colors">Active</button>
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
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Product Updates</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Order Notifications</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">System Alerts</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
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
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transition-transform duration-300`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeMenu === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
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
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden mr-4 p-2 rounded-lg hover:bg-gray-100"
                >
                  <FiMenu className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {menuItems.find(item => item.id === activeMenu)?.label || 'Dashboard Overview'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {new Date().toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-400 hover:text-gray-600 relative"
                  >
                    <FiBell className="h-6 w-6" />
                    {notifications.some(n => n.unread) && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                      <div className="p-4 border-b">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map(notification => (
                          <div key={notification.id} className="p-3 border-b hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t">
                        <button 
                          onClick={() => {
                            setNotifications(notifications.map(n => ({ ...n, unread: false })));
                            setShowNotifications(false);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mark all as read
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">
                      {new Date().toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">A</span>
                  </div>
                  <button 
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Logout"
                  >
                    <FiLogOut className="h-5 w-5" />
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