import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiImage, FiMessageCircle, FiEye } from 'react-icons/fi';
import { api } from '../services/api';
import TenantProductDetail from './TenantProductDetail';

const TenantProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    long_description: '',
    price: '',
    image: '',
    category_id: '',
    discount: '',
    whatsapp: '',
    stock_status: 'available',
    stock: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getUserProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrl = formData.image;
      
      // Upload image if file selected
      if (imageFile) {
        try {
          const uploadResult = await api.uploadFile(imageFile, 'products');
          imageUrl = uploadResult.imageUrl || uploadResult.url;
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          alert('Error uploading image: ' + uploadError.message);
          return;
        }
      }
      
      const productData = { ...formData, image: imageUrl };
      
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData);
      } else {
        await api.createProduct(productData);
      }
      
      setShowModal(false);
      setEditingProduct(null);
      setImageFile(null);
      setFormData({
        name: '',
        description: '',
        long_description: '',
        price: '',
        image: '',
        category_id: '',
        discount: '',
        whatsapp: '',
        stock_status: 'available',
        stock: ''
      });
      fetchProducts();
      window.dispatchEvent(new Event('productUpdated'));
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setImageFile(null);
    setFormData({
      name: product.name,
      description: product.description,
      long_description: product.long_description || '',
      price: product.price,
      image: product.image,
      category_id: product.category_id,
      discount: product.discount || '',
      whatsapp: product.whatsapp || '',
      stock_status: product.stock_status,
      stock: product.stock || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id);
        fetchProducts();
        window.dispatchEvent(new Event('productUpdated'));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Products</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <FiImage className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada produk</h3>
          <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan produk pertama Anda.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
            >
              <FiPlus className="w-4 h-4" />
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 group">
            <div className="relative overflow-hidden">
              <img
                src={product.image ? `http://localhost:5006${product.image}` : '/images/placeholder.svg'}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = '/images/placeholder.svg';
                }}
              />
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                  product.stock_status === 'available' ? 'bg-green-500 text-white' :
                  product.stock_status === 'limited' ? 'bg-yellow-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {product.stock_status === 'available' ? 'Tersedia' :
                   product.stock_status === 'limited' ? 'Terbatas' : 'Habis'}
                </span>
              </div>
              {product.discount && (
                <div className="absolute top-3 left-3">
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    -{product.discount}%
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-5">
              <h3 className="font-bold text-xl mb-3 text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
              
              <div className="space-y-3 mb-4">
                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{product.description}</p>
                
                {product.long_description && (
                  <p className="text-gray-500 text-xs line-clamp-1">
                    Detail: {product.long_description}
                  </p>
                )}
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
                  {product.discount ? (
                    <div className="space-y-1">
                      <span className="text-gray-500 line-through text-sm">{formatRupiah(product.price)}</span>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-600 font-bold text-xl">
                          {formatRupiah(product.price * (1 - product.discount / 100))}
                        </span>
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          HEMAT {product.discount}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-blue-600 font-bold text-xl">{formatRupiah(product.price)}</span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="font-semibold text-gray-700">Kategori</span>
                    <p className="text-gray-600 mt-1">{product.category_name}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="font-semibold text-gray-700">Stock</span>
                    <p className="text-gray-600 mt-1">{product.stock || 0} pcs</p>
                  </div>
                </div>
                
                {product.whatsapp && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">WhatsApp:</span> Tersedia
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div>
                    <span className="font-medium">Likes:</span> {product.likes_count || 0}
                  </div>
                  <div>
                    <span className="font-medium">Dibuat:</span> {new Date(product.created_at).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex space-x-2 w-full">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-1 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>Detail</span>
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-1 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <FiEdit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-1 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Hapus</span>
                  </button>
                </div>
                
                {product.whatsapp && (
                  <a
                    href={product.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold text-gray-900">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {editingProduct ? 'Perbarui informasi produk Anda' : 'Lengkapi informasi produk yang akan ditambahkan'}
              </p>
            </div>
            <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                <input
                  type="text"
                  placeholder="Masukkan nama produk"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  placeholder="Deskripsi produk (maksimal 2 baris)"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Detail (Opsional)</label>
                <textarea
                  placeholder="Deskripsi lengkap produk"
                  value={formData.long_description}
                  onChange={(e) => setFormData({...formData, long_description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diskon (%)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.discount}
                  onChange={(e) => setFormData({...formData, discount: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="100"
                />
              </div>
              
              {formData.price && formData.discount && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Preview Harga:</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 line-through text-sm">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(formData.price)}
                    </span>
                    <span className="text-blue-600 font-bold">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(formData.price * (1 - formData.discount / 100))}
                    </span>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      -{formData.discount}%
                    </span>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Produk</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.image && (
                  <div className="mt-3 flex items-center space-x-3">
                    <img 
                      src={formData.image.startsWith('http') ? formData.image : `http://localhost:5006${formData.image}`} 
                      alt="Current" 
                      className="w-16 h-16 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.svg';
                      }}
                    />
                    <p className="text-sm text-gray-500">Gambar saat ini</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link WhatsApp (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://wa.me/628123456789"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Stok</label>
                <select
                  value={formData.stock_status}
                  onChange={(e) => setFormData({...formData, stock_status: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="available">Tersedia</option>
                  <option value="limited">Terbatas</option>
                  <option value="sold-out">Habis</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    setImageFile(null);
                    setFormData({
                      name: '',
                      description: '',
                      long_description: '',
                      price: '',
                      image: '',
                      category_id: '',
                      discount: '',
                      whatsapp: '',
                      stock_status: 'available',
                      stock: ''
                    });
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {uploading ? 'Menyimpan...' : (editingProduct ? 'Update Produk' : 'Tambah Produk')}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Product Detail Modal */}
      {selectedProduct && (
        <TenantProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default TenantProductManager;