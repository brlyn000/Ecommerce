import { useState, useEffect } from 'react';
import { FiSend, FiUser, FiClock, FiEdit, FiTrash2, FiCheck, FiX, FiStar, FiMessageCircle } from 'react-icons/fi';
import { api } from '../../services/api';
import { API_BASE_URL } from '../../config/api';

const CommentSection = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const [commentType] = useState('comment');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);


  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        } catch (error) {
        }
      }
    };
    
    fetchUser();
    loadComments();
  }, [productId]);

  const loadComments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/product/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
    }
  };



  const handleEdit = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.comment);
  };

  const handleUpdate = async (commentId) => {
    try {
      await api.updateComment(commentId, {
        comment: editText
      });
      setEditingComment(null);
      loadComments();
    } catch (error) {
    }
  };

  const handleDelete = (comment) => {
    setCommentToDelete(comment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      await api.deleteComment(commentToDelete.id);
      loadComments();
      setShowSuccessModal(true);
    } catch (error) {
    }
    setCommentToDelete(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to comment');
      return;
    }
    
    if (!newComment.trim()) return;
    
    setShowCommentModal(true);
  };

  const confirmSubmit = async () => {
    setShowCommentModal(false);
    setLoading(true);
    
    try {
      // Send to backend API
      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: productId,
          name: user.full_name || user.username,
          email: user.email,
          comment: newComment.trim(),
          comment_type: commentType,
          user_id: user.id
        })
      });
      
      if (response.ok) {
        loadComments();
        setNewComment('');
        setShowSuccessModal(true);
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      alert('Failed to add comment');
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

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Comments ({comments.length})</h3>
      
      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-sm">
                {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">

              
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={3}
                disabled={loading}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-500">
                  Commenting as {user.full_name || user.username}
                </span>
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <FiSend className="w-4 h-4" />
                  <span>{loading ? 'Posting...' : 'Post Comment'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl text-center">
          <p className="text-gray-600 mb-4">Please login to leave a comment</p>
          <a
            href="/login"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Login to Comment
          </a>
        </div>
      )}
      
      {/* Comments List */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                <FiUser className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{comment.name}</h4>
                    {comment.comment_type === 'review' && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Review
                      </span>
                    )}
                    <div className="flex items-center text-gray-500 text-sm">
                      <FiClock className="w-4 h-4 mr-1" />
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                  </div>
                  
                  {user && (comment.user_id === user.id || user.role === 'admin') && (
                    <div className="flex items-center space-x-2">
                      {comment.user_id === user.id && (
                        <button
                          onClick={() => handleEdit(comment)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(comment)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <FiTrash2 className="w-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                {editingComment === comment.id ? (
                  <div className="space-y-3">

                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdate(comment.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center"
                      >
                        <FiCheck className="w-4 h-4 mr-1" /> Save
                      </button>
                      <button
                        onClick={() => setEditingComment(null)}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 flex items-center"
                      >
                        <FiX className="w-4 h-4 mr-1" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {comment.rating && comment.comment_type === 'review' && (
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FiStar
                              key={star}
                              className={`w-4 h-4 ${
                                star <= comment.rating 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">({comment.rating}/5)</span>
                      </div>
                    )}
                    <p className="text-gray-700 leading-relaxed">{comment.comment}</p>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FiUser className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
      
      {/* Comment Confirmation Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <FiMessageCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Post Comment</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">Are you sure you want to post this comment?</p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">"{newComment}"</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCommentModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>Post Comment</>
                )}
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
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Comment Posted!</h3>
              
              <p className="text-gray-600 mb-6">
                Your comment has been posted successfully.
              </p>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && commentToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Comment</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">Are you sure you want to delete this comment?</p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">"{commentToDelete.comment}"</p>
              </div>
              
              <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCommentToDelete(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                Delete Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;