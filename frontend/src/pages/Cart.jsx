import { useState, useEffect } from 'react';
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiUser, FiArrowLeft, FiCheck, FiPackage, FiMessageCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { getImageUrl, getApiUrl } from '../config/api';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderResults, setOrderResults] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [tenantContacts, setTenantContacts] = useState({});

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
    
    const item = cartItems.find(i => i.id === productId);
    if (item && newQuantity > (item.stock || Infinity)) {
      alert(`Stok tidak mencukupi. Maksimal ${item.stock} pcs`);
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

  const handleCheckout = () => {
    if (isCheckingOut) return;
    setShowCheckoutModal(true);
  };

  const confirmCheckout = async () => {
    setShowCheckoutModal(false);
    
    // Group items by tenant (created_by)
    const itemsByTenant = {};
    cartItems.forEach(item => {
      const tenantId = item.created_by;
      if (!itemsByTenant[tenantId]) {
        itemsByTenant[tenantId] = [];
      }
      itemsByTenant[tenantId].push(item);
    });
    
    const tenantCount = Object.keys(itemsByTenant).length;
    const confirmed = window.confirm(
      `Checkout ${cartItems.length} items from ${tenantCount} store(s) with total ${formatRupiah(totalPrice)}?`
    );
    if (!confirmed) return;
    
    setIsCheckingOut(true);
    
    // Validate stock before checkout
    const stockErrors = [];
    for (const item of cartItems) {
      if ((item.stock || 0) <= 0) {
        stockErrors.push(`"${item.name}" sudah habis (sold out)`);
      } else if (item.quantity > (item.stock || 0)) {
        stockErrors.push(`Stok "${item.name}" tidak mencukupi. Tersedia: ${item.stock}, diminta: ${item.quantity}`);
      }
    }
    if (stockErrors.length > 0) {
      alert(`Tidak dapat checkout:\n${stockErrors.join('\n')}`);
      setIsCheckingOut(false);
      return;
    }
    
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    try {
      const orderResults = [];
      const orderDetails = [];
      const contacts = {};
      
      // Create separate order for each tenant
      for (const [tenantId, items] of Object.entries(itemsByTenant)) {
        const tenantTotal = items.reduce((sum, item) => {
          const finalPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
          return sum + (finalPrice * item.quantity);
        }, 0);
        
        const orderData = {
          items: items,
          total: tenantTotal,
          customer_name: userData.full_name || userData.username
        };
        
        const orderResponse = await fetch(getApiUrl('/orders'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(orderData)
        });
        
        const orderResult = await orderResponse.json();
        if (orderResult.success) {
          orderResults.push(orderResult.order_id);
          orderDetails.push({
            orderId: orderResult.order_id,
            tenantId,
            items,
            total: tenantTotal
          });
          
          // Fetch tenant contact info
          try {
            const contactResponse = await fetch(getApiUrl(`/users/${tenantId}/payment-methods`));
            if (contactResponse.ok) {
              const contactData = await contactResponse.json();
              if (contactData.contact_info) {
                contacts[tenantId] = contactData.contact_info;
              }
            }
          } catch (error) {
            console.error('Error fetching tenant contact:', error);
          }
        } else {
          throw new Error(`Failed to create order for tenant ${tenantId}`);
        }
      }
      
      if (orderResults.length === tenantCount) {
        localStorage.removeItem('cart');
        setCartItems([]);
        window.dispatchEvent(new Event('cartUpdated'));
        setOrderResults(orderResults);
        setOrderDetails(orderDetails);
        setTenantContacts(contacts);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Order failed:', error);
      alert('Some orders failed. Please check your orders page and try again for failed items.');
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
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 inline-block"
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
            {/* Group items by tenant for display */}
            {Object.entries(
              cartItems.reduce((groups, item) => {
                const tenantId = item.created_by || 'unknown';
                if (!groups[tenantId]) groups[tenantId] = [];
                groups[tenantId].push(item);
                return groups;
              }, {})
            ).map(([tenantId, items]) => (
              <div key={tenantId} className="space-y-2">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <h3 className="font-medium text-gray-700">Store #{tenantId}</h3>
                  <p className="text-sm text-gray-500">{items.length} item(s)</p>
                </div>
                {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4">
                <img
                  src={getImageUrl(item.image)}
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
                      <span className="text-red-600 font-bold">{formatRupiah(item.price * (1 - item.discount / 100))}</span>
                      <span className="text-red-600 text-xs">-{item.discount}%</span>
                    </div>
                  ) : (
                    <p className="text-red-600 font-bold">{formatRupiah(item.price)}</p>
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
              </div>
            ))}
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Items from {Object.keys(cartItems.reduce((groups, item) => {
                    groups[item.created_by || 'unknown'] = true;
                    return groups;
                  }, {})).length} store(s)</span>
                  <span>{cartItems.length} items</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total: {formatRupiah(totalPrice)}</span>
                  <button 
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isCheckingOut 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isCheckingOut ? 'Processing...' : 'Checkout All Stores'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-right">
                  * Separate orders will be created for each store
                </p>
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
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
      
      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <FiShoppingCart className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Checkout</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Checkout <span className="font-semibold">{cartItems.length} items</span> with total:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-2xl font-bold text-red-600">{formatRupiah(totalPrice)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmCheckout}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Orders Placed Successfully!</h3>
              
              <p className="text-gray-600 mb-4">
                {orderResults.length} orders created
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Orders Created:</p>
                <div className="space-y-3">
                  {orderDetails.map((order, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiPackage className="w-4 h-4 mr-2" />
                          <span>#{order.orderId}</span>
                        </div>
                        <span className="text-sm font-medium text-red-600">
                          {formatRupiah(order.total)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {order.items.length} item(s) from Store #{order.tenantId}
                      </div>
                      {tenantContacts[order.tenantId] && (
                        <div className="flex space-x-2">
                          {tenantContacts[order.tenantId].whatsapp && (
                            <button
                              onClick={() => {
                                const itemsList = order.items.map(item => `- ${item.name} (${item.quantity}x)`).join('\n');
                                const message = `Hi, I just placed an order #${order.orderId}:\n\n${itemsList}\n\nTotal: ${formatRupiah(order.total)}`;
                                window.open(`https://wa.me/${tenantContacts[order.tenantId].whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
                              }}
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 flex items-center space-x-1"
                            >
                              <FiMessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>
                          )}
                          {tenantContacts[order.tenantId].instagram && (
                            <button
                              onClick={() => {
                                window.open(`https://instagram.com/${tenantContacts[order.tenantId].instagram}`, '_blank');
                              }}
                              className="bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600 flex items-center space-x-1"
                            >
                              <FiMessageCircle className="w-3 h-3" />
                              <span>Instagram</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Link
                  to="/orders"
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-medium text-center"
                  onClick={() => setShowSuccessModal(false)}
                >
                  View Orders
                </Link>
                <Link
                  to="/"
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium text-center"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;