import { useState, useEffect } from 'react';
import { FiPackage, FiClock, FiCheck, FiX, FiArrowLeft, FiStar, FiMessageCircle, FiAlertTriangle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { getImageUrl, getApiUrl } from '../config/api';
import RatingModal from '../components/RatingModal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ratedOrders, setRatedOrders] = useState(new Set());
  const [cancelModal, setCancelModal] = useState({ show: false, orderId: null });
  const [cancelReason, setCancelReason] = useState('');

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

      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const profileRes = await fetch(getApiUrl('/profile'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!profileRes.ok) return;
      const user = await profileRes.json();

      const rated = new Set();

      for (const order of ordersData) {
        if ((order.item_status || order.status) === 'confirmed') {
          try {
            const response = await fetch(getApiUrl(`/comments/product/${order.product_id}`));
            if (response.ok) {
              const comments = await response.json();
              if (comments.some(c => c.user_id === user.id && c.comment_type === 'review'))
                rated.add(`${order.order_id}-${order.product_id}`);
            }
          } catch { /* ignore */ }
        }
      }

      setRatedOrders(rated);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      const res = await fetch(getApiUrl(`/orders/${cancelModal.orderId}/cancel`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ reason: cancelReason })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to cancel order');
      }
      setCancelModal({ show: false, orderId: null });
      setCancelReason('');
      fetchOrders();
    } catch (error) {
      alert(error.message);
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
      case 'pending': return <FiClock className="w-5 h-5 text-yellow-500" />;
      case 'accepted': return <FiPackage className="w-5 h-5 text-blue-500" />;
      case 'completed': return <FiCheck className="w-5 h-5 text-green-500" />;
      case 'confirmed': return <FiCheck className="w-5 h-5 text-green-600" />;
      case 'rejected': return <FiX className="w-5 h-5 text-red-500" />;
      case 'cancelled': return <FiX className="w-5 h-5 text-gray-500" />;
      default: return <FiClock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      case 'disputed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 inline-block"
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
                    {getStatusIcon(order.item_status || order.status)}
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.item_status || order.status)}`}>
                      {(order.item_status || order.status).charAt(0).toUpperCase() + (order.item_status || order.status).slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={getImageUrl(order.product_image)}
                    alt={order.product_name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.target.src = '/images/placeholder.svg';
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{order.product_name}</h4>
                    <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
                    <p className="text-lg font-bold text-red-600">
                      {formatRupiah(order.price * order.quantity)}
                    </p>
                  </div>
                </div>

                {(order.item_status || order.status) === 'pending' && (
                  <div className="mb-4">
                    <button
                      onClick={() => setCancelModal({ show: true, orderId: order.order_id })}
                      className="w-full bg-gray-100 text-red-600 border border-red-300 px-4 py-2 rounded-lg text-sm hover:bg-red-50 flex items-center justify-center space-x-2"
                    >
                      <FiX className="w-4 h-4" />
                      <span>Batalkan Pesanan</span>
                    </button>
                  </div>
                )}

                {(order.item_status || order.status) === 'cancelled' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-gray-700">Pesanan dibatalkan</p>
                    {order.cancellation_reason && (
                      <p className="text-xs text-gray-500 mt-1">Alasan: {order.cancellation_reason}</p>
                    )}
                  </div>
                )}

                {(order.item_status || order.status) === 'rejected' && (order.item_rejection_reason || order.rejection_reason) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                    <p className="text-sm text-red-700">{order.item_rejection_reason || order.rejection_reason}</p>
                  </div>
                )}

                {((order.item_status || order.status) === 'completed' || (order.item_status || order.status) === 'accepted') && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-red-800 mb-2">Item Completed</p>
                    <p className="text-sm text-red-700 mb-1">Product: {order.product_name}</p>
                    <p className="text-sm text-red-700 mb-3">Have you received this item?</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(getApiUrl(`/orders/${order.order_id}/received`), {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                              },
                              body: JSON.stringify({ 
                                received_status: 'received',
                                product_id: order.product_id
                              })
                            });
                            if (!response.ok) throw new Error('Failed to confirm order');
                            fetchOrders();
                          } catch (error) {
                            alert(error.message || 'Failed to confirm order');
                          }
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                      >
                        Item Diterima
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(getApiUrl(`/orders/${order.order_id}/received`), {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                              },
                              body: JSON.stringify({ 
                                received_status: 'not_received',
                                product_id: order.product_id
                              })
                            });
                            if (!response.ok) throw new Error('Failed to report order');
                            fetchOrders();
                          } catch (error) {
                            alert(error.message || 'Failed to report order');
                          }
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                      >
                        Belum Diterima
                      </button>
                    </div>
                  </div>
                )}

                {(order.item_status || order.status) === 'confirmed' && (
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

                {/* Contact Store Button */}
                {(order.tenant_whatsapp || order.tenant_phone) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-800 mb-2">Need Help?</p>
                  <div className="flex space-x-2">
                    {order.tenant_whatsapp && (
                      <button
                        onClick={() => {
                          const phone = order.tenant_whatsapp.replace(/[^0-9]/g, '');
                          const message = `Hi, saya ingin bertanya tentang pesanan #${order.order_id} untuk ${order.product_name}`;
                          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 flex items-center space-x-2"
                      >
                        <FiMessageCircle className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </button>
                    )}
                  </div>
                </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${(order.item_status || order.status) === 'pending' || (order.item_status || order.status) === 'accepted' || (order.item_status || order.status) === 'completed' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-600">Order Placed</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${(order.item_status || order.status) === 'accepted' || (order.item_status || order.status) === 'completed' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-600">Order Accepted</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${(order.item_status || order.status) === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
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
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
      
      {/* Cancel Modal */}
      {cancelModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <FiAlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Batalkan Pesanan</h3>
            </div>
            <p className="text-gray-600 mb-4">Apakah kamu yakin ingin membatalkan pesanan ini?</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alasan pembatalan (opsional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Tulis alasan pembatalan..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => { setCancelModal({ show: false, orderId: null }); setCancelReason(''); }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium"
              >
                Kembali
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

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