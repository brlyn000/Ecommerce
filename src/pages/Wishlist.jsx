import { useState, useEffect } from 'react';
import { FiHeart, FiTrash2, FiUser, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      loadWishlist();
    }
  }, []);

  const loadWishlist = () => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      setWishlistItems(JSON.parse(saved));
    }
  };

  const removeFromWishlist = (productId) => {
    const updated = wishlistItems.filter(item => item.id !== productId);
    setWishlistItems(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
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
              <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center pt-20">
          <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-md mx-4">
            <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Kamu belum login</h2>
            <p className="text-gray-600 mb-6">Login terlebih dahulu untuk melihat wishlist</p>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
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
              <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-1">{wishlistItems.length} items</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistItems.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm p-4 relative flex flex-col">
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 right-2 p-2 text-red-500 hover:bg-red-50 rounded-full"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
                
                <Link to={`/product/${product.id}`}>
                  <img
                    src={product.image ? `http://localhost:5006${product.image}` : '/images/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded mb-3"
                    onError={(e) => {
                      e.target.src = '/images/placeholder.svg';
                    }}
                  />
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-blue-600 font-bold">{formatRupiah(product.price)}</span>
                    <span className="text-xs text-gray-500">{product.category_name}</span>
                  </div>
                </Link>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    
                    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                    const existingItem = cart.find(item => item.id === product.id);
                    
                    if (existingItem) {
                      existingItem.quantity += 1;
                    } else {
                      cart.push({ ...product, quantity: 1 });
                    }
                    
                    localStorage.setItem('cart', JSON.stringify(cart));
                    window.dispatchEvent(new Event('cartUpdated'));
                    
                    // Show success feedback
                    const button = e.target;
                    const originalText = button.textContent;
                    button.textContent = 'Added ✓';
                    button.style.backgroundColor = '#10b981';
                    setTimeout(() => {
                      button.textContent = originalText;
                      button.style.backgroundColor = '';
                    }, 1000);
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiHeart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Save items you love to your wishlist</p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;