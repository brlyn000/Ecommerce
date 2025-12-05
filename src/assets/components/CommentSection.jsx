import { useState, useEffect } from 'react';
import { FiSend, FiUser, FiClock, FiEdit, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { api } from '../../services/api';

const CommentSection = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const [commentType] = useState('comment');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');


  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadComments();
  }, [productId]);

  const loadComments = async () => {
    try {
      const response = await fetch(`http://localhost:5006/api/comments/product/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
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
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async (commentId) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await api.deleteComment(commentId);
        loadComments();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to comment');
      return;
    }
    
    if (!newComment.trim()) return;
    
    setLoading(true);
    
    try {
      // Send to backend API
      const response = await fetch('http://localhost:5006/api/comments', {
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
        // Reload comments from server
        loadComments();
        setNewComment('');
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
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
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-sm">
                {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">

              
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
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
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
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
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
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

                    <div className="flex items-center text-gray-500 text-sm">
                      <FiClock className="w-4 h-4 mr-1" />
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                  </div>
                  
                  {user && comment.user_id === user.id && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(comment)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <FiTrash2 className="w-4 h-4" />
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
    </div>
  );
};

export default CommentSection;