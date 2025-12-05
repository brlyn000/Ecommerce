import { useState, useEffect } from 'react';
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiUser, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      loadCart();
    }
  }, []);

  const loadCart = () => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      setCartItems(JSON.parse(saved));
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }
    
    const updated = cartItems.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (productId) => {
    const updated = cartItems.filter(item => item.id !== productId);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const handleCheckout = async () => {
    if (isCheckingOut) return;
    
    const confirmed = window.confirm(`Checkout ${cartItems.length} items with total ${formatRupiah(totalPrice)}?`);
    if (!confirmed) return;
    
    setIsCheckingOut(true);
    
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const orderData = {
      items: cartItems,
      total: totalPrice,
      customer_name: userData.full_name || userData.username
    };
    
    try {
      const orderResponse = await fetch('http://localhost:5006/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(orderData)
      });
      
      const orderResult = await orderResponse.json();
      
      if (orderResult.success) {
        const tenantNotifications = {};
        cartItems.forEach(item => {
          if (item.created_by) {
            if (!tenantNotifications[item.created_by]) {
              tenantNotifications[item.created_by] = {
                type: 'checkout',
                tenant_id: item.created_by,
                order_id: orderResult.order_id,
                message: `New order from ${userData.full_name || userData.username}`,
                data: {
                  customer_name: userData.full_name || userData.username,
                  products: [],
                  total_amount: 0,
                  total_quantity: 0
                }
              };
            }
            const finalPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
            tenantNotifications[item.created_by].data.products.push(`${item.name} (${item.quantity}x)`);
            tenantNotifications[item.created_by].data.total_amount += finalPrice * item.quantity;
            tenantNotifications[item.created_by].data.total_quantity += item.quantity;
          }
        });
        
        for (const notif of Object.values(tenantNotifications)) {
          await fetch('http://localhost:5006/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(notif)
          });
        }
        
        localStorage.removeItem('cart');
        setCartItems([]);
        window.dispatchEvent(new Event('cartUpdated'));
        alert('Order placed successfully!');
      }
    } catch (error) {
      console.error('Order failed:', error);
      alert('Order failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    const finalPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
    return sum + (finalPrice * item.quantity);
  }, 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-800">
                <FiArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center pt-20">
          <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-md mx-4">
            <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Kamu belum login</h2>
            <p className="text-gray-600 mb-6">Login terlebih dahulu untuk melihat product cart</p>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
            >
              Login Sekarang
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link to="/" className="text-gray-600 hover:text-gray-800">
              <FiArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 mt-1">{cartItems.length} items</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {cartItems.length > 0 ? (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4">
                <img
                  src={item.image ? `http://localhost:5006${item.image}` : '/images/placeholder.svg'}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.svg';
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-gray-600 text-sm">{item.category_name}</p>
                  {item.discount ? (
                    <div className="flex flex-col">
                      <span className="text-gray-400 line-through text-sm">{formatRupiah(item.price)}</span>
                      <span className="text-blue-600 font-bold">{formatRupiah(item.price * (1 - item.discount / 100))}</span>
                      <span className="text-red-600 text-xs">-{item.discount}%</span>
                    </div>
                  ) : (
                    <p className="text-blue-600 font-bold">{formatRupiah(item.price)}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total: {formatRupiah(totalPrice)}</span>
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isCheckingOut 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isCheckingOut ? 'Processing...' : 'Checkout'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <FiShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some products to get started</p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;