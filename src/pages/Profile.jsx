import { useState, useEffect } from 'react';
import { FiUser, FiLock, FiShoppingBag, FiHeart, FiClock, FiEdit, FiLogOut } from 'react-icons/fi';
import Navbar from '../assets/components/Navbar';

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

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        full_name: parsedUser.full_name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        address: parsedUser.address || ''
      });
    }
    loadCartAndWishlist();
  }, []);

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
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  const handleSave = () => {
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditMode(false);
    alert('Profile updated successfully!');
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
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
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
                  onClick={handleSave}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        );
        
      case 'password':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Change Password</h3>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Current Password"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <input
                type="password"
                placeholder="New Password"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
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
                        src={item.image ? `http://localhost:5006${item.image}` : '/images/placeholder.svg'}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded flex-shrink-0"
                        onError={(e) => { e.target.src = '/images/placeholder.svg'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-600">{item.category_name}</p>
                        <p className="text-blue-600 font-bold text-sm">
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
                      className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
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
                      src={item.image ? `http://localhost:5006${item.image}` : '/images/placeholder.svg'}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded flex-shrink-0"
                      onError={(e) => { e.target.src = '/images/placeholder.svg'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-gray-600">{item.category_name}</p>
                      <p className="text-blue-600 font-bold text-sm">
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
        const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Purchase History</h3>
            {purchaseHistory.length > 0 ? (
              <div className="space-y-4">
                {purchaseHistory.map((order, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">{order.date}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.name} x{item.quantity}</span>
                          <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.total)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiClock className="w-12 h-12 mx-auto mb-2" />
                <p>No purchase history</p>
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
          <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold">{user.full_name || user.username}</h1>
                <p className="text-gray-600">{user.email}</p>
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
                        ? 'bg-blue-50 text-blue-600'
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
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                  
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