import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiUser, FiTrash2, FiMessageCircle, FiSend } from 'react-icons/fi';
import { getCommentsByProductId, createComment, deleteComment } from '../../services/api';

const CommentSection = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comment: '',
    rating: 5
  });

  useEffect(() => {
    if (productId) {
      fetchComments();
    }
  }, [productId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await getCommentsByProductId(productId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.comment) return;

    try {
      setSubmitting(true);
      await createComment({
        product_id: productId,
        ...formData
      });
      setFormData({ name: '', email: '', comment: '', rating: 5 });
      fetchComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('Hapus komentar ini?')) {
      try {
        await deleteComment(commentId);
        fetchComments();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onChange(star) : undefined}
            whileHover={interactive ? { scale: 1.2, rotate: 5 } : {}}
            whileTap={interactive ? { scale: 0.9 } : {}}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} transition-all duration-200`}
          >
            <FiStar
              className={`h-5 w-5 transition-all duration-200 ${
                star <= rating 
                  ? 'text-yellow-400 fill-current drop-shadow-sm' 
                  : interactive 
                    ? 'text-gray-300 hover:text-yellow-300' 
                    : 'text-gray-300'
              }`}
            />
          </motion.button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-white/80 to-blue-50/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-blue-500  rounded-2xl shadow-lg">
          <FiMessageCircle className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Komentar & Ulasan</h3>
      </div>
      
      {/* Comment Form */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="mb-10 p-6 bg-gradient-to-br from-white/60 to-blue-50/30 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Nama"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-blue-500 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 placeholder-gray-500"
              required
            />
          </div>
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-blue-500 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 placeholder-gray-500"
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Rating:</label>
          <div className="flex items-center space-x-1">
            {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
            <span className="ml-3 text-sm text-gray-600 font-medium">{formData.rating}/5</span>
          </div>
        </div>
        
        <div className="relative mb-6">
          <textarea
            placeholder="Tulis komentar Anda..."
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-blue-500 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 placeholder-gray-500 resize-none"
            required
          />
        </div>
        
        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
        >
          <FiSend className="h-4 w-4" />
          <span>{submitting ? 'Mengirim...' : 'Kirim Komentar'}</span>
        </motion.button>
      </motion.form>

      {/* Comments List */}
      <AnimatePresence>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <motion.div 
                key={i} 
                className="animate-pulse p-6 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </motion.div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FiMessageCircle className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">Belum ada komentar</p>
            <p className="text-gray-400 text-sm mt-1">Jadilah yang pertama memberikan ulasan!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group p-6 bg-gradient-to-br from-white/60 to-blue-50/30 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-full shadow-md">
                      <FiUser className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">{comment.name}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        {renderStars(comment.rating)}
                        <span className="text-xs text-gray-500 font-medium">{comment.rating}/5</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500 font-medium">
                      {new Date(comment.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <motion.button
                      onClick={() => handleDelete(comment.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Hapus komentar"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{comment.comment}</p>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommentSection;