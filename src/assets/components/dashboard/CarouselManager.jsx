import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiImage, FiX, FiSave, FiEye, FiEyeOff, FiUpload } from 'react-icons/fi';
import { api } from '../../../services/api';

const CarouselManager = () => {
  const [carouselItems, setCarouselItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchCarouselItems();
  }, []);

  const fetchCarouselItems = async () => {
    try {
      const items = await api.getCarousel();
      setCarouselItems(items.map(item => ({
        ...item,
        order: item.display_order,
        buttonText: item.button_text,
        buttonLink: item.button_link
      })));
    } catch (error) {
      console.error('Error fetching carousel items:', error);
      showNotification('Error loading carousel items', 'error');
    } finally {
      setLoading(false);
    }
  };
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    active: true,
    order: 1,
    buttonText: 'Shop Now',
    buttonLink: '/products'
  });
  const [notification, setNotification] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [uploading, setUploading] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', image: '', active: true, order: 1, buttonText: 'Shop Now', buttonLink: '/products' });
    setEditingItem(null);
    setShowForm(false);
    setPreviewImage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        image: formData.image,
        active: formData.active,
        display_order: formData.order,
        button_text: formData.buttonText,
        button_link: formData.buttonLink
      };

      if (editingItem) {
        await api.updateCarousel(editingItem.id, submitData);
        showNotification('Carousel item updated successfully!');
      } else {
        await api.createCarousel(submitData);
        showNotification('Carousel item created successfully!');
      }
      resetForm();
      fetchCarouselItems();
    } catch (error) {
      showNotification('Error saving carousel item: ' + error.message, 'error');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      image: item.image,
      active: item.active,
      order: item.order || 1,
      buttonText: item.buttonText || 'Shop Now',
      buttonLink: item.buttonLink || '/products'
    });
    setPreviewImage(item.image);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this carousel item?')) {
      try {
        await api.deleteCarousel(id);
        showNotification('Carousel item deleted successfully!');
        fetchCarouselItems();
      } catch (error) {
        showNotification('Error deleting carousel item: ' + error.message, 'error');
      }
    }
  };

  const moveItem = (id, direction) => {
    setCarouselItems(items => {
      const itemIndex = items.findIndex(item => item.id === id);
      if (itemIndex === -1) return items;
      
      const newItems = [...items];
      const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
      
      if (targetIndex >= 0 && targetIndex < newItems.length) {
        [newItems[itemIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[itemIndex]];
        // Update order numbers
        newItems.forEach((item, index) => {
          item.order = index + 1;
        });
      }
      
      return newItems;
    });
  };

  const handleImageChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, image: value });
    setPreviewImage(value);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('Uploading file:', file.name);
    setUploading(true);
    try {
      const result = await api.uploadFile(file, 'carousel');
      console.log('Upload result:', result);
      const imageUrl = `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5005'}${result.url}`;
      setFormData({ ...formData, image: imageUrl });
      setPreviewImage(imageUrl);
      showNotification('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('Error uploading image: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (id) => {
    try {
      const item = carouselItems.find(item => item.id === id);
      if (item) {
        await api.updateCarousel(id, {
          ...item,
          active: !item.active,
          display_order: item.order,
          button_text: item.buttonText,
          button_link: item.buttonLink
        });
        fetchCarouselItems();
      }
    } catch (error) {
      showNotification('Error updating carousel item: ' + error.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
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
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Carousel Management</h2>
          <p className="text-sm text-gray-600">Manage homepage carousel slides and banners</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Add Carousel Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Slides</p>
              <p className="text-2xl font-bold text-gray-900">{carouselItems.length}</p>
            </div>
            <FiImage className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Slides</p>
              <p className="text-2xl font-bold text-green-600">{carouselItems.filter(item => item.active).length}</p>
            </div>
            <FiEye className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Slides</p>
              <p className="text-2xl font-bold text-red-600">{carouselItems.filter(item => !item.active).length}</p>
            </div>
            <FiEyeOff className="h-8 w-8 text-red-500" />
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

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingItem ? 'Edit Carousel Item' : 'Add New Carousel Item'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.image}
                        onChange={handleImageChange}
                        placeholder="Image URL or upload file below"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <label className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                        <FiUpload className="mr-2 h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    {previewImage && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">Preview:</p>
                        <img
                          src={previewImage?.startsWith('http') ? previewImage : `http://localhost:5002${previewImage}`}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg border"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      placeholder="Shop Now"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                    <input
                      type="text"
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      placeholder="/products"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                      Active (Show on homepage)
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiSave className="mr-2 h-4 w-4" />
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Carousel Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {carouselItems
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                {item.image ? (
                  <img
                    src={item.image?.startsWith('http') ? item.image : `http://localhost:5002${item.image}`}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center">
                    <FiImage className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="absolute top-2 left-2">
                <span className="bg-blue-500 text-white px-2 py-1 text-xs font-semibold rounded">
                  #{item.order || index + 1}
                </span>
              </div>
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-2">
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                {item.buttonText && (
                  <div className="text-xs text-blue-600">
                    Button: "{item.buttonText}" → {item.buttonLink}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t">
                <div className="flex space-x-1">
                  <button
                    onClick={() => moveItem(item.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveItem(item.id, 'down')}
                    disabled={index === carouselItems.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => toggleActive(item.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.active 
                        ? 'text-gray-600 hover:bg-gray-50' 
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={item.active ? 'Deactivate' : 'Activate'}
                  >
                    {item.active ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {carouselItems.length === 0 && (
        <div className="text-center py-12">
          <FiImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No carousel items found</p>
        </div>
      )}
    </div>
  );
};

export default CarouselManager;