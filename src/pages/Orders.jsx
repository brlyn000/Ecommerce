import { useState, useEffect } from 'react';
import { FiPackage, FiClock, FiCheck, FiX, FiArrowLeft, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import RatingModal from '../components/RatingModal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ratedOrders, setRatedOrders] = useState(new Set());

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const ordersData = await api.getUserOrders();
      setOrders(ordersData);
      
      // Check which products have been rated by user
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (user) {
        const rated = new Set();
        for (const order of ordersData) {
          if (order.status === 'confirmed') {
            try {
              const response = await fetch(`http://localhost:5006/api/comments/product/${order.product_id}`);
              if (response.ok) {
                const comments = await response.json();
                const hasRated = comments.some(c => c.user_id === user.id && c.comment_type === 'review');
                if (hasRated) {
                  rated.add(`${order.order_id}-${order.product_id}`);
                }
              }
            } catch (error) {
              console.error('Error checking rating status:', error);
            }
          }
        }
        setRatedOrders(rated);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="w-5 h-5 text-yellow-500" />;
      case 'accepted':
        return <FiPackage className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <FiCheck className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <FiX className="w-5 h-5 text-red-500" />;
      default:
        return <FiClock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-800">
                <FiArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center pt-20">
          <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-md mx-4">
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">Please login to view your orders</p>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
            >
              Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-800">
              <FiArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">{orders.length} orders found</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={`${order.order_id}-${order.product_id}`} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.order_id}</h3>
                    <p className="text-xs text-gray-400">Status: {order.status}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={order.product_image ? `http://localhost:5006${order.product_image}` : '/images/placeholder.svg'}
                    alt={order.product_name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.target.src = '/images/placeholder.svg';
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{order.product_name}</h4>
                    <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatRupiah(order.price * order.quantity)}
                    </p>
                  </div>
                </div>

                {order.status === 'rejected' && order.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                    <p className="text-sm text-red-700">{order.rejection_reason}</p>
                  </div>
                )}

                {(order.status === 'completed' || order.status === 'accepted') && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-blue-800 mb-2">Order Completed</p>
                    <p className="text-sm text-blue-700 mb-3">Have you received your order?</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={async () => {
                          try {
                            await api.confirmOrderReceived(order.order_id, 'received');
                            fetchOrders();
                          } catch (error) {
                            console.error('Error confirming order:', error);
                          }
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                      >
                        Pesanan Diterima
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await api.confirmOrderReceived(order.order_id, 'not_received');
                            fetchOrders();
                          } catch (error) {
                            console.error('Error reporting order:', error);
                          }
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                      >
                        Belum Diterima
                      </button>
                    </div>
                  </div>
                )}

                {order.status === 'confirmed' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-green-800 mb-2">Order Confirmed</p>
                    {ratedOrders.has(`${order.order_id}-${order.product_id}`) ? (
                      <div className="flex items-center space-x-2">
                        <FiCheck className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">Thank you for your review!</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-green-700 mb-3">How was your experience with this product?</p>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowRatingModal(true);
                          }}
                          className="bg-yellow-500 text-white px-4 py-2 rounded text-sm hover:bg-yellow-600 flex items-center space-x-2"
                        >
                          <FiStar className="w-4 h-4" />
                          <span>Rate Product</span>
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${order.status === 'pending' || order.status === 'accepted' || order.status === 'completed' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-600">Order Placed</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${order.status === 'accepted' || order.status === 'completed' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-600">Order Accepted</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${order.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-600">Order Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
      
      {/* Rating Modal */}
      {showRatingModal && selectedOrder && (
        <RatingModal
          order={selectedOrder}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedOrder(null);
          }}
          onRatingSubmitted={() => {
            const orderKey = `${selectedOrder.order_id}-${selectedOrder.product_id}`;
            setRatedOrders(prev => new Set([...prev, orderKey]));
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};

export default Orders;