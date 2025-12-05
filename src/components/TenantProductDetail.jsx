import { useState, useEffect } from 'react';
import { FiX, FiHeart, FiMessageCircle, FiShoppingCart, FiStar, FiUser, FiClock } from 'react-icons/fi';
import { api } from '../services/api';

const TenantProductDetail = ({ product, onClose }) => {
  const [stats, setStats] = useState({
    totalLikes: 0,
    totalComments: 0,
    totalOrders: 0,
    totalQuantity: 0,
    orderStats: {
      pending: 0,
      accepted: 0,
      completed: 0,
      confirmed: 0,
      rejected: 0,
      disputed: 0
    }
  });
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (product?.id) {
      fetchAllData();
    }
  }, [product]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch comments first
      const commentsResponse = await fetch(`http://localhost:5006/api/comments/product/${product.id}`);
      let commentsData = [];
      if (commentsResponse.ok) {
        commentsData = await commentsResponse.json();
        setComments(commentsData);
      }

      // Fetch likes
      const likesResponse = await fetch(`http://localhost:5006/api/likes/products/${product.id}/status`);
      let likesCount = 0;
      if (likesResponse.ok) {
        const likesData = await likesResponse.json();
        likesCount = likesData.likesCount || 0;
      }
      
      // Get orders
      const orders = await api.getTenantOrders();
      const productOrders = orders.filter(order => order.product_id === product.id);
      
      const orderStats = {
        pending: productOrders.filter(o => o.status === 'pending').length,
        accepted: productOrders.filter(o => o.status === 'accepted').length,
        completed: productOrders.filter(o => o.status === 'completed').length,
        confirmed: productOrders.filter(o => o.status === 'confirmed').length,
        rejected: productOrders.filter(o => o.status === 'rejected').length,
        disputed: productOrders.filter(o => o.status === 'disputed').length
      };

      // Calculate total quantity sold
      const totalQuantity = productOrders.reduce((sum, order) => sum + (order.quantity || 0), 0);

      // Set all stats at once
      setStats({
        totalLikes: likesCount,
        totalComments: commentsData.length,
        totalOrders: productOrders.length,
        totalQuantity: totalQuantity,
        orderStats
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (!product) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={product.image ? `http://localhost:5006${product.image}` : '/images/placeholder.svg'}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-blue-600">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
                </p>
                {product.discount && (
                  <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
                    -{product.discount}% OFF
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <FiHeart className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{stats.totalLikes}</p>
              <p className="text-sm text-gray-600">Likes</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <FiMessageCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{stats.totalComments}</p>
              <p className="text-sm text-gray-600">Comments</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <FiShoppingCart className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{stats.totalQuantity}</p>
              <p className="text-sm text-gray-600">Quantity Sold</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <FiStar className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{product.rating || 0}</p>
              <p className="text-sm text-gray-600">Rating</p>
            </div>
          </div>

          {/* Order Status Statistics */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-4">Order Status Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-yellow-600">{stats.orderStats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-blue-600">{stats.orderStats.accepted}</p>
                <p className="text-sm text-gray-600">Accepted</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-green-600">{stats.orderStats.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-purple-600">{stats.orderStats.confirmed}</p>
                <p className="text-sm text-gray-600">Confirmed</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-red-600">{stats.orderStats.rejected}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-orange-600">{stats.orderStats.disputed}</p>
                <p className="text-sm text-gray-600">Disputed</p>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Recent Comments & Reviews</h4>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {comments.slice(0, 5).map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiUser className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-medium text-gray-900 text-sm">{comment.name}</h5>
                        {comment.comment_type === 'review' && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Review
                          </span>
                        )}
                        <div className="flex items-center text-gray-500 text-xs">
                          <FiClock className="w-3 h-3 mr-1" />
                          <span>{formatDate(comment.created_at)}</span>
                        </div>
                      </div>
                      {comment.comment_type === 'review' && comment.rating && (
                        <div className="mb-1">
                          {renderStars(comment.rating)}
                        </div>
                      )}
                      <p className="text-gray-700 text-sm">{comment.comment}</p>
                    </div>
                  </div>
                ))}
                {comments.length > 5 && (
                  <p className="text-center text-gray-500 text-sm">
                    And {comments.length - 5} more comments...
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiMessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No comments yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantProductDetail;