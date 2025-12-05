import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiPackage, FiX, FiSave, FiUpload, FiRefreshCw } from 'react-icons/fi';
import { api } from '../../../services/api';
import { imageMapper } from '../../../utils/imageMapper';
import { getImageUrl } from '../../../utils/imageUtils';
import RefreshIndicator from './RefreshIndicator';


const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    long_description: '',
    price: '',
    image: '',
    rating: 5,
    stock: 'available',
    category: '',
    discount: '',
    slug: '',
    whatsapp: ''
  });
  const [notification, setNotification] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);
      setProducts(productsRes);
      setCategories(categoriesRes);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Auto refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category_id.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      long_description: '',
      price: '',
      image: '',
      rating: 5,
      stock: 'available',
      category: '',
      discount: '',
      slug: '',
      whatsapp: ''
    });
    setEditingProduct(null);
    setShowAddForm(false);
    setImageKey(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Find category ID
      const categoryId = categories.find(cat => 
        cat.name.toLowerCase().replace(/\s+/g, '-') === formData.category.toLowerCase()
      )?.id || 1;
      
      const submitData = {
        name: formData.name || '',
        description: formData.description || '',
        long_description: formData.long_description || '',
        price: parseFloat(formData.price) || 0,
        image: formData.image || '',
        rating: parseInt(formData.rating) || 0,
        stock: formData.stock || 'available',
        category_id: categoryId,
        discount: formData.discount || '',
        whatsapp: formData.whatsapp || ''
      };
      
      console.log('Submitting data:', submitData);
      
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, submitData);
        showNotification('Product updated successfully!');
        // Force refresh data immediately
        await fetchData();
      } else {
        await api.createProduct(submitData);
        showNotification('Product created successfully!');
        await fetchData();
      }
      resetForm();
    } catch (error) {
      showNotification('Error saving product: ' + error.message, 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await api.uploadFile(file, 'products');
      const imageUrl = `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5006'}${result.url}`;
      
      // Force component re-render by updating formData and image key
      setFormData(prev => ({ ...prev, image: imageUrl }));
      setImageKey(prev => prev + 1);
      showNotification('Image uploaded successfully!');
      
      // Clear file input
      e.target.value = '';
    } catch (error) {
      showNotification('Error uploading image: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    
    // Find category name from category_id
    const categoryName = categories.find(cat => cat.id === product.category_id)?.name || '';
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
    
    setFormData({
      name: product.name || '',
      description: product.description || '',
      long_description: product.long_description || '',
      price: product.price?.toString() || '0',
      image: product.image || '',
      rating: product.rating || 0,
      stock: product.stock_status || product.stock || 'available',
      category: categorySlug,
      discount: product.discount || '',
      slug: product.slug || '',
      whatsapp: product.whatsapp || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(productId);
        showNotification('Product deleted successfully!');
        await fetchData();
      } catch (error) {
        showNotification('Error deleting product: ' + error.message, 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Product Management</h2>
        <div className="flex items-center gap-4">
          <RefreshIndicator lastUpdate={lastUpdate} isRefreshing={isRefreshing} />
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Refresh Data"
              disabled={isRefreshing}
            >
              <FiRefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
              notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
            } text-white`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black opacity-50 flex items-center justify-center z-40 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[95vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingProduct ? 'Update product information' : 'Fill in the details to create a new product'}
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter product name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rp) *</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0"
                        min="0"
                        step="1000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Product Description</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief product description"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description</label>
                      <textarea
                        value={formData.long_description}
                        onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                        placeholder="Detailed product information, features, specifications..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Product Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.name.toLowerCase().replace(/\s+/g, '-')}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
                      <select
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="available">✅ Available</option>
                        <option value="limited">⚠️ Limited Stock</option>
                        <option value="sold-out">❌ Sold Out</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <select
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        {[1,2,3,4,5].map(num => (
                          <option key={num} value={num}>{'⭐'.repeat(num)} ({num} Star{num > 1 ? 's' : ''})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Product Image */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Product Image</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Image URL</label>
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <div className="text-center">
                        <span className="text-sm text-gray-500">or</span>
                      </div>
                      <label className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors">
                        <FiUpload className="mr-2 h-5 w-5" />
                        {uploading ? 'Uploading...' : 'Upload Image File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      <p className="text-xs text-gray-500">Supported: JPG, PNG, WebP (Max 5MB)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Preview</label>
                      {formData.image ? (
                        <div className="w-full h-48 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <img
                            key={`${formData.image}-${imageKey}`}
                            src={getImageUrl(formData.image)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onLoad={(e) => {
                              e.target.style.display = 'block';
                              e.target.nextSibling.style.display = 'none';
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-500">
                            <FiPackage className="h-8 w-8 mb-2" />
                            <span className="text-sm">Loading image...</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
                          <FiPackage className="h-12 w-12 mb-2" />
                          <span className="text-sm">No image selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                      <input
                        type="text"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        placeholder="10% or Rp 50000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Link</label>
                      <input
                        type="url"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        placeholder="https://wa.me/6281234567890"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="product-url-slug"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Used for SEO-friendly URLs (auto-generated if empty)</p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    <FiSave className="mr-2 h-4 w-4" />
                    {uploading ? 'Processing...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={product.image ? getImageUrl(product.image) : '/images/placeholder.svg'}
                alt={product.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = '/images/placeholder.svg';
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{getCategoryName(product.category_id)}</p>
              <p className="text-lg font-bold text-blue-600 mb-3">
                Rp {parseInt(product.price).toLocaleString()}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Stock: {product.stock || 'N/A'}</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
};

export default ProductManager;