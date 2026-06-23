import { useState, useEffect } from 'react';
import { FiUser, FiLock, FiShoppingBag, FiHeart, FiClock, FiEdit, FiLogOut, FiGrid, FiHome, FiPackage, FiExternalLink, FiEye, FiEyeOff } from 'react-icons/fi';
import Navbar from '../assets/components/Navbar';
import { API_BASE_URL, getImageUrl } from '../config/api';
import ConfirmModal from '../components/ConfirmModal';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [showConfirm, setShowConfirm] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    loadCartAndWishlist();
    fetchPurchaseHistory();
  }, []);

  const fetchPurchaseHistory = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPurchaseHistory(data);
      }
    } catch { /* ignore */ } finally {
      setHistoryLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setFormData({
          full_name: userData.full_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || ''
        });
      }
    } catch (error) {
      // ignore
    }
  };

  const loadCartAndWishlist = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setCartItems(cart);
    setWishlistItems(wishlist);
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      const updated = cartItems.filter(item => item.id !== productId);
      setCartItems(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
      window.dispatchEvent(new Event('cartUpdated'));
    } else {
      const updated = cartItems.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const removeFromWishlist = (productId) => {
    const updated = wishlistItems.filter(item => item.id !== productId);
    setWishlistItems(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/';
  };

  const confirmSave = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        // Fetch updated profile from server
        await fetchProfile();
        setEditMode(false);
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update profile');
      }
    } catch (error) {
      // ignore
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      if (response.ok) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('Password updated successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update password');
      }
    } catch (error) {
      alert('Failed to update password');
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'password', label: 'Change Password', icon: FiLock },
    { id: 'orders', label: 'Shopping Cart', icon: FiShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: FiHeart },
    { id: 'history', label: 'Purchase History', icon: FiClock }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Profile Information</h3>
              <button
                onClick={() => setEditMode(!editMode)}
                className="text-red-600 hover:text-red-800 flex items-center space-x-1"
              >
                <FiEdit className="w-4 h-4" />
                <span>{editMode ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  disabled={!editMode}
                  className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50"
                />
              </div>
              

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!editMode}
                  className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={!editMode}
                  className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  disabled={!editMode}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50"
                />
              </div>
              
              {editMode && (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        );
        
      case 'password':
        const getStrength = (pwd) => {
          let score = 0;
          if (pwd.length >= 8) score++;
          if (/[A-Z]/.test(pwd)) score++;
          if (/[0-9]/.test(pwd)) score++;
          if (/[^A-Za-z0-9]/.test(pwd)) score++;
          return score;
        };
        const strength = getStrength(passwordData.newPassword);
        const strengthLabel = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'][strength];
        const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][strength];
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Change Password</h3>
            <div className="space-y-4">
              {[['currentPassword', 'Password Saat Ini', 'current'], ['newPassword', 'Password Baru', 'new'], ['confirmPassword', 'Konfirmasi Password Baru', 'confirm']].map(([field, label, key]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <div className="relative">
                    <input
                      type={showPasswords[key] ? 'text' : 'password'}
                      placeholder={label}
                      value={passwordData[field]}
                      onChange={(e) => setPasswordData({...passwordData, [field]: e.target.value})}
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(p => ({...p, [key]: !p[key]}))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords[key] ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}

              {passwordData.newPassword && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Kekuatan password</span>
                    <span className={`font-medium ${
                      strength === 1 ? 'text-red-500' : strength === 2 ? 'text-yellow-500' : strength === 3 ? 'text-blue-500' : 'text-green-500'
                    }`}>{strengthLabel}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor : 'bg-gray-200'}`} />
                    ))}
                  </div>
                </div>
              )}

              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-xs text-red-500">Password tidak cocok</p>
              )}

              <button
                onClick={handlePasswordChange}
                disabled={!passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Password
              </button>
            </div>
          </div>
        );
        
      case 'orders':
        const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Shopping Cart ({cartItems.length} items)</h3>
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded flex-shrink-0"
                        onError={(e) => { e.target.src = '/images/placeholder.svg'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-600">{item.category_name}</p>
                        <p className="text-red-600 font-bold text-sm">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => updateCartQuantity(item.id, 0)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex flex-col space-y-3">
                    <span className="text-base font-bold">Total: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalPrice)}</span>
                    <button 
                      onClick={() => {
                        const token = localStorage.getItem('adminToken');
                        if (!token) {
                          alert('Please login to proceed with checkout');
                          window.location.href = '/login';
                          return;
                        }
                        
                        const orderData = {
                          id: 'ORD' + Date.now(),
                          date: new Date().toISOString(),
                          status: 'pending',
                          items: cartItems,
                          total: totalPrice,
                          customerName: user.full_name || user.username,
                          customerId: user.id
                        };
                        
                        const history = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');
                        history.unshift(orderData);
                        localStorage.setItem('purchaseHistory', JSON.stringify(history));
                        
                        const tenantOrders = JSON.parse(localStorage.getItem('tenantOrders') || '[]');
                        tenantOrders.unshift(orderData);
                        localStorage.setItem('tenantOrders', JSON.stringify(tenantOrders));
                        
                        const tenantNotifications = JSON.parse(localStorage.getItem('tenantNotifications') || '[]');
                        tenantNotifications.unshift({
                          id: 'checkout_' + Date.now(),
                          type: 'checkout',
                          message: `New order from ${user.full_name || user.username}`,
                          orderId: orderData.id,
                          customerName: user.full_name || user.username,
                          products: cartItems.map(item => item.name).join(', '),
                          amount: totalPrice,
                          date: new Date().toISOString(),
                          read: false
                        });
                        localStorage.setItem('tenantNotifications', JSON.stringify(tenantNotifications));
                        
                        window.dispatchEvent(new Event('orderUpdated'));
                        
                        localStorage.removeItem('cart');
                        setCartItems([]);
                        window.dispatchEvent(new Event('cartUpdated'));
                        
                        alert('Order placed successfully!');
                      }}
                      className="w-full bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiShoppingBag className="w-12 h-12 mx-auto mb-2" />
                <p>No items in cart</p>
              </div>
            )}
          </div>
        );
        
      case 'wishlist':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Wishlist ({wishlistItems.length} items)</h3>
            {wishlistItems.length > 0 ? (
              <div className="space-y-3">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 flex space-x-3">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded flex-shrink-0"
                      onError={(e) => { e.target.src = '/images/placeholder.svg'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-gray-600">{item.category_name}</p>
                      <p className="text-red-600 font-bold text-sm">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <FiHeart className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiHeart className="w-12 h-12 mx-auto mb-2" />
                <p>No items in wishlist</p>
              </div>
            )}
          </div>
        );
        
      case 'history':
        const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
        const statusColor = (s) => ({
          pending: 'bg-yellow-100 text-yellow-800',
          accepted: 'bg-blue-100 text-blue-800',
          completed: 'bg-green-100 text-green-800',
          confirmed: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800',
          cancelled: 'bg-gray-100 text-gray-700',
          disputed: 'bg-orange-100 text-orange-800',
        })[s] || 'bg-gray-100 text-gray-700';

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Purchase History</h3>
              <a href="/orders" className="text-sm text-red-600 hover:underline flex items-center gap-1">
                Lihat Semua <FiExternalLink className="w-3 h-3" />
              </a>
            </div>
            {historyLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : purchaseHistory.length > 0 ? (
              <div className="space-y-3">
                {purchaseHistory.map((order, index) => (
                  <div key={`${order.order_id}-${index}`} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">#{order.order_id}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(order.item_status || order.status)}`}>
                        {order.item_status || order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <img
                        src={getImageUrl(order.product_image)}
                        alt={order.product_name}
                        className="w-10 h-10 object-cover rounded"
                        onError={(e) => { e.target.src = '/images/placeholder.svg'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{order.product_name}</p>
                        <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-red-600 flex-shrink-0">
                        {formatRupiah(order.price * order.quantity)}
                      </p>
                    </div>
                    {order.cancellation_reason && (
                      <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                        Dibatalkan: {order.cancellation_reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiPackage className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Belum ada riwayat pembelian</p>
                <a href="/" className="text-sm text-red-600 hover:underline mt-2 block">Mulai belanja</a>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to view profile</p>
          <a href="/login" className="bg-red-600 text-white px-6 py-2 rounded-lg">
            Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmSave}
        title="Save Changes"
        message="Are you sure you want to save these changes to your profile?"
        type="info"
        confirmText="Save"
        cancelText="Cancel"
      />
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold">{user.full_name || user.username}</h1>
                <p className="text-gray-600">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  {user.role === 'tenant' ? 'Tenant' : user.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>
              <div className="flex gap-2">
                {(user.role === 'tenant' || user.role === 'admin') && (
                  <a
                    href={user.role === 'tenant' ? '/tenant-dashboard' : '/dashboard'}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FiGrid className="w-4 h-4" />
                    <span>Dashboard</span>
                  </a>
                )}
                <a
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FiHome className="w-4 h-4" />
                  <span>Home</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="md:hidden bg-white rounded-lg shadow-sm mb-4">
            <div className="flex overflow-x-auto p-2 space-x-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-lg transition-colors min-w-[80px] ${
                      activeTab === item.id
                        ? 'bg-red-50 text-red-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">{item.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="hidden md:block md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === item.id
                            ? 'bg-red-50 text-red-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                  
                  {(user.role === 'tenant' || user.role === 'admin') && (
                    <a
                      href={user.role === 'tenant' ? '/tenant-dashboard' : '/dashboard'}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FiGrid className="w-5 h-5" />
                      <span>Dashboard</span>
                    </a>
                  )}
                  <a
                    href="/"
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FiHome className="w-5 h-5" />
                    <span>Home</span>
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>
            </div>

            <div className="col-span-1 md:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;