import { useParams } from 'react-router-dom';
import { FaStar, FaRegStar, FaShoppingCart, FaHeart, FaShareAlt, FaChevronLeft, FaPlus, FaMinus } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { getImageUrl, getApiUrl } from '../config/api';
import html2canvas from 'html2canvas';
import CommentSection from '../assets/components/CommentSection';
import LoginModal from '../assets/components/LoginModal';
import PaymentMethodsDropdown from '../components/PaymentMethodsDropdown';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [showOrderErrorModal, setShowOrderErrorModal] = useState(false);
  const [orderErrorMessage, setOrderErrorMessage] = useState('');
  const [orderSuccessData, setOrderSuccessData] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState('');
  const [tenantPaymentMethods, setTenantPaymentMethods] = useState(null);
  const [tenantContact, setTenantContact] = useState(null);
  const productCardRef = useRef(null);
  const shareButtonRef = useRef(null);
  const shareDropdownRef = useRef(null);

  // Fetch product data
  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (product) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        console.log('Profile updated - Current user:', currentUser);
        console.log('Product created_by:', product.created_by);
        if (currentUser.id == product.created_by && currentUser.store_name) {
          console.log('Updating store name to:', currentUser.store_name);
          setTenantContact(prev => ({
            ...prev,
            store_name: currentUser.store_name
          }));
        }
      }
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.getProductById(id);
        setProduct(data);
        setLikesCount(data.likes_count || 0);
        
        // Increment view count
        const viewsData = JSON.parse(localStorage.getItem('productViews') || '{}');
        viewsData[id] = (viewsData[id] || 0) + 1;
        localStorage.setItem('productViews', JSON.stringify(viewsData));
        
        // Get like status
        try {
          const likeStatus = await api.getLikeStatus(id);
          setIsLiked(likeStatus.liked);
        } catch (error) {
          // Ignore error if not authenticated
          setIsLiked(false);
        }
        
        // Get tenant contact info
        try {
          const response = await fetch(getApiUrl(`/users/${data.created_by}/payment-methods`));
          if (response.ok) {
            const contactData = await response.json();
            console.log('Contact data:', contactData);
            
            // Check if current user is the same tenant
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            console.log('Current user:', currentUser);
            console.log('Product created_by:', data.created_by);
            
            let storeName = '';
            if (currentUser.id == data.created_by && currentUser.store_name) {
              storeName = currentUser.store_name;
              console.log('Using current user store name:', storeName);
            }
            
            setTenantContact({
              ...contactData.contact_info,
              store_name: storeName
            });
          } else {
            // If no contact data, still check for store name
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (currentUser.id == data.created_by && currentUser.store_name) {
              setTenantContact({
                store_name: currentUser.store_name
              });
            }
          }
        } catch (error) {
          console.error('Error fetching tenant contact:', error);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [id]);

  // Handle clicks outside the share dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareDropdownRef.current && 
          !shareDropdownRef.current.contains(event.target) && 
          !shareButtonRef.current.contains(event.target)) {
        setShowShareOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const shareProduct = async (platform) => {
    const productUrl = window.location.href;
    const message = `Check out this product: ${product.name} - ${productUrl}`;
    
    try {
      // Capture product card as image
      const canvas = await html2canvas(productCardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: null
      });
      
      const imageUrl = canvas.toDataURL('image/png');
      
      switch(platform) {
        case 'whatsapp':
          if (navigator.share) {
            navigator.share({
              title: product.name,
              text: message,
              url: productUrl
            });
          } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(`${message}\n\n${productUrl}`)}`, '_blank');
          }
          break;
          
        case 'facebook':
          if (navigator.share) {
            navigator.share({
              title: product.name,
              text: message,
              url: productUrl
            });
          } else {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
          }
          break;
          
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${message}\n\n${productUrl}`)}`, '_blank');
          break;
          
        case 'copy':
          // Copy both text and image
          try {
            const blob = await (await fetch(imageUrl)).blob();
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            navigator.clipboard.writeText(productUrl);
            alert('Product image and link copied to clipboard!');
          } catch (err) {
            navigator.clipboard.writeText(productUrl);
            alert('Link copied to clipboard!');
          }
          break;
          
        case 'download':
          const link = document.createElement('a');
          link.download = `${product.name.replace(/\s+/g, '_')}.png`;
          link.href = imageUrl;
          link.click();
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to text-only sharing
      switch(platform) {
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(`${message}\n\n${productUrl}`)}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${message}\n\n${productUrl}`)}`, '_blank');
          break;
        case 'copy':
          navigator.clipboard.writeText(productUrl);
          alert('Link copied to clipboard!');
          break;
      }
    }
    
    setShowShareOptions(false);
  };

  const handleLikeAndWishlist = async () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    
    try {
      const result = await api.toggleLike(id);
      setIsLiked(result.liked);
      setLikesCount(prev => result.liked ? prev + 1 : Math.max(0, prev - 1));
      
      // Handle wishlist
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (result.liked) {
        // Add to wishlist
        const isInWishlist = savedWishlist.some(item => item.id === parseInt(id));
        if (!isInWishlist) {
          const updated = [...savedWishlist, product];
          localStorage.setItem('wishlist', JSON.stringify(updated));
          window.dispatchEvent(new Event('wishlistUpdated'));
          
          // Notification is now handled by backend in likeController
        }
      } else {
        // Remove from wishlist
        const updated = savedWishlist.filter(item => item.id !== parseInt(id));
        localStorage.setItem('wishlist', JSON.stringify(updated));
        window.dispatchEvent(new Event('wishlistUpdated'));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setShowLoginModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50/90 to-yellow-50/90">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
        <p className="text-gray-600">Loading product details...</p>
        <p className="text-sm text-gray-500 mt-2">Product ID: {id}</p>
      </div>
    );
  }

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50/90 to-yellow-50/90 p-8">
      <div className="bg-white/95 rounded-3xl shadow-xl p-8 max-w-md text-center border border-gray-100 backdrop-blur-sm">
        <div className="text-8xl mb-4 text-yellow-400">😕</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">Sorry, the product you are looking for is not available.</p>
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <FaChevronLeft className="mr-2" />
          Return to Catalog
        </a>
      </div>
    </div>
  );

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? 
        <FaStar key={i} className="text-yellow-400" /> : 
        <FaRegStar key={i} className="text-yellow-400" />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/80 via-white to-yellow-50/80 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <a 
            href="/" 
            className="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-all duration-300 group"
          >
            <FaChevronLeft className="mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </a>
        </div>

        {/* Product Card - This will be captured for sharing */}
        <div 
          ref={productCardRef}
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-gray-100"
          style={{ position: 'relative' }}
        >
          {/* Watermark for shared images */}
          <div className="absolute bottom-4 right-4 text-xs text-gray-400 opacity-70 hidden print:block">
            Shared from EkrafMarket.com
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 h-96 border border-gray-200">
                <img 
                  src={getImageUrl(product.image)} 
                  alt={product.name} 
                  className="w-full h-full object-contain transition-transform duration-500 hover:scale-105 p-4"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.svg';
                  }}
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex space-x-2">
                  {product.isNew && (
                    <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      NEW!
                    </span>
                  )}
                  {product.discount && (
                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      -{product.discount}%
                    </span>
                  )}
                </div>
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button 
                    onClick={handleLikeAndWishlist}
                    className={`p-2 rounded-full shadow-sm transition-colors flex items-center space-x-1 ${
                      isLiked 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/90 text-gray-600 hover:bg-red-100 hover:text-red-500'
                    }`}
                  >
                    <FaHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-xs font-medium">{likesCount}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              {/* Store Name */}
              <div className="mb-4">
                <a 
                  href={`/store/${product.created_by}`}
                  className="inline-flex items-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  🏪 Kunjungi Toko: {product.store_name || (tenantContact?.store_name) || `Store #${product.created_by}`}
                </a>
              </div>
              
              {/* Rating & Likes */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {renderStars(product.average_rating || 0)}
                  </div>
                  <span className="text-gray-600 text-sm">({product.review_count || 0} reviews)</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaHeart className="w-4 h-4 mr-1 text-red-400" />
                  <span className="text-sm font-medium">{likesCount} likes</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                {product.discount ? (
                  <div className="flex flex-col space-y-1">
                    <span className="text-lg text-gray-400 line-through">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
                    </span>
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-red-600">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price * (1 - product.discount / 100))}
                      </span>
                      <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
                        -{product.discount}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-red-600">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Product Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                <div className="mt-3">
                  <span className="inline-block bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                    {product.category_name || 'Uncategorized'}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <PaymentMethodsDropdown product={product} />
              </div>

              {/* Hubungi Penjual */}
              {tenantContact && (tenantContact.whatsapp || tenantContact.instagram) && (
                <div className="mb-6 bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="border-b border-gray-200 py-4 px-6">
                    <h3 className="font-bold text-lg text-red-600">💬 Hubungi Penjual</h3>
                    <p className="text-xs text-gray-500 mt-1">Chat langsung dengan penjual</p>
                  </div>
                  <div className="p-6 flex flex-col gap-3">
                    {tenantContact.whatsapp && (
                      <a
                        href={`https://wa.me/${tenantContact.whatsapp}?text=${encodeURIComponent(`Halo, saya tertarik dengan produk "${product.name}" - ${window.location.href}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Chat via WhatsApp
                      </a>
                    )}
                    {tenantContact.instagram && (
                      <a
                        href={`https://instagram.com/${tenantContact.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Chat via Instagram
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-auto space-y-4">
                <div className="flex space-x-3">
                  <button
                    disabled={product.stock <= 0}
                    onClick={() => {
                      const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
                      if (!token) {
                        setShowLoginModal(true);
                        return;
                      }
                      
                      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                      const existingItem = cart.find(item => item.id === product.id);
                      const currentQty = existingItem ? existingItem.quantity : 0;
                      
                      if (currentQty >= product.stock) {
                        setCartMessage(`Stok tidak mencukupi. Maksimal ${product.stock} pcs`);
                        setShowCartModal(true);
                        setTimeout(() => setShowCartModal(false), 2000);
                        return;
                      }
                      
                      if (existingItem) {
                        existingItem.quantity += 1;
                        setCartMessage(`Updated quantity to ${existingItem.quantity}`);
                      } else {
                        cart.push({ ...product, quantity: 1 });
                        setCartMessage('Added to cart successfully!');
                      }
                      
                      localStorage.setItem('cart', JSON.stringify(cart));
                      window.dispatchEvent(new Event('cartUpdated'));
                      setShowCartModal(true);
                      setTimeout(() => setShowCartModal(false), 2000);
                    }}
                    className={`flex-1 font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center ${
                      product.stock <= 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white hover:shadow-lg'
                    }`}
                  >
                    <FaShoppingCart className="mr-2" />
                    {product.stock <= 0 ? 'STOK HABIS' : 'ADD TO CART'}
                  </button>
                  <button
                    disabled={product.stock <= 0}
                    onClick={() => {
                      const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
                      if (!token) {
                        setShowLoginModal(true);
                        return;
                      }
                      
                      setOrderQuantity(1);
                      setQuantityError('');
                      setShowCheckoutModal(true);
                    }}
                    className={`flex-1 font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center ${
                      product.stock <= 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white hover:shadow-lg'
                    }`}
                  >
                    <FaShoppingCart className="mr-2" />
                    {product.stock <= 0 ? 'STOK HABIS' : 'ORDER NOW'}
                  </button>
                  <div className="relative">
                    <button 
                      ref={shareButtonRef}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowShareOptions(!showShareOptions);
                      }}
                      className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-300 shadow-sm"
                    >
                      <FaShareAlt className="text-red-500" />
                    </button>
                    
                    {/* Share Options Dropdown */}
                    {showShareOptions && (
                      <div 
                        ref={shareDropdownRef}
                        className="absolute right-0 bottom-0 mt-2 w-56 bg-white rounded-xl shadow-lg z-[1000] border border-gray-200 overflow-hidden"
                      >
                        <div className="py-1">
                          <button 
                            onClick={() => shareProduct('whatsapp')}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <img src="https://cdn-icons-png.flaticon.com/512/3670/3670051.png" className="w-5 h-5 mr-3" alt="WhatsApp" />
                            Share via WhatsApp
                          </button>
                          <button 
                            onClick={() => shareProduct('facebook')}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <img src="https://cdn-icons-png.flaticon.com/512/124/124010.png" className="w-5 h-5 mr-3" alt="Facebook" />
                            Share on Facebook
                          </button>
                          <button 
                            onClick={() => shareProduct('twitter')}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" className="w-5 h-5 mr-3" alt="Twitter" />
                            Share on Twitter
                          </button>
                          <button 
                            onClick={() => shareProduct('copy')}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <img src="https://cdn-icons-png.flaticon.com/512/1621/1621635.png" className="w-5 h-5 mr-3" alt="Copy" />
                            Copy Link & Image
                          </button>
                          <button 
                            onClick={() => shareProduct('download')}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <img src="https://cdn-icons-png.flaticon.com/512/3580/3580388.png" className="w-5 h-5 mr-3" alt="Download" />
                            Download Image
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>



                {/* Additional Info */}
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-3">
                  <div className={`flex items-center px-3 py-1 rounded-full ${product.stock <= 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <svg className={`w-4 h-4 mr-1 ${product.stock <= 0 ? 'text-red-500' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Status: {product.stock <= 0 ? 'Sold Out' : (product.stock_status || 'available')}
                  </div>
                  <div className={`flex items-center px-3 py-1 rounded-full ${product.stock <= 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                    <span className={`font-medium ${product.stock <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Stock: {product.stock || 0} pcs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        
        {/* Product Details */}
        <div className="mt-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button className="py-4 px-6 text-center border-b-2 font-medium text-sm border-red-500 text-red-600">
                  Product Details
                </button>
              </nav>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Complete Information</h3>
              <div className="prose max-w-none text-gray-600">
                {product.long_description || (
                  <p>No additional information available for this product.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Comment Section */}
        <div className="mt-8">
          <CommentSection productId={product.id} />
        </div>
        
        {/* Login Modal */}
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => {
            setShowLoginModal(false);
            window.location.reload();
          }}
        />
        
        {/* Cart Success Modal */}
        {showCartModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-auto transform animate-bounce-in">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-600 mb-4">{cartMessage}</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCartModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => {
                      setShowCartModal(false);
                      window.location.href = '/cart';
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    View Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Checkout Confirmation Modal */}
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaShoppingCart className="text-2xl text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Order</h3>
                <p className="text-gray-600 mb-4">Are you sure you want to order this product?</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 text-left">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      {product.discount ? (
                        <div className="flex flex-col">
                          <span className="text-gray-400 line-through text-sm">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
                          </span>
                          <span className="text-red-600 font-bold">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price * (1 - product.discount / 100))}
                          </span>
                        </div>
                      ) : (
                        <p className="text-red-600 font-bold">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Jumlah:</span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          if (orderQuantity > 1) {
                            setOrderQuantity(orderQuantity - 1);
                            setQuantityError('');
                          }
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                      >
                        <FaMinus className="w-3 h-3" />
                      </button>
                      <span className="w-12 text-center font-medium">{orderQuantity}</span>
                      <button
                        onClick={() => {
                          if (orderQuantity >= product.stock) {
                            setQuantityError(`Stok tidak mencukupi. Maksimal ${product.stock} pcs`);
                            return;
                          }
                          setOrderQuantity(orderQuantity + 1);
                          setQuantityError('');
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                      >
                        <FaPlus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  {orderQuantity > 1 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span className="font-bold text-red-600">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
                            (product.discount ? product.price * (1 - product.discount / 100) : product.price) * orderQuantity
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {quantityError && (
                    <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                      {quantityError}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (orderQuantity <= 0) {
                        setQuantityError('Jumlah pesanan tidak boleh 0');
                        return;
                      }
                      if (orderQuantity > product.stock) {
                        setQuantityError(`Stok tidak mencukupi. Tersedia: ${product.stock} pcs`);
                        return;
                      }
                      
                      try {
                        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                        
                        // Create order
                        const finalPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;
                        const orderData = {
                          items: [{ ...product, quantity: orderQuantity }],
                          total: finalPrice * orderQuantity,
                          customer_name: currentUser.full_name || currentUser.username
                        };
                        
                        const orderResponse = await fetch(getApiUrl('/orders'), {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('userToken')}`
                          },
                          body: JSON.stringify(orderData)
                        });
                        
                        const orderResult = await orderResponse.json();
                        
                        if (orderResult.success) {
                          setShowCheckoutModal(false);
                          setOrderSuccessData({
                            order_id: orderResult.order_id,
                            product_name: product.name,
                            quantity: orderQuantity,
                            total: finalPrice * orderQuantity
                          });
                          setShowOrderSuccessModal(true);
                          
                          // Contact seller directly using tenant contact info
                          setTimeout(() => {
                            if (tenantContact && tenantContact.whatsapp) {
                              const message = `Hi, I just placed an order #${orderResult.order_id}:\n\n- ${product.name} (${orderQuantity}x)\n\nTotal: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format((product.discount ? product.price * (1 - product.discount / 100) : product.price) * orderQuantity)}`;
                              window.open(`https://wa.me/${tenantContact.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
                            } else {
                              // Fallback to generic message
                              const message = `Hi, I want to order ${product.name} x${orderQuantity} (Order ID: ${orderResult.order_id}) - ${window.location.href}`;
                              window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                            }
                          }, 1000);
                        } else {
                          setShowCheckoutModal(false);
                          setOrderErrorMessage(orderResult.error || 'Order failed. Please try again.');
                          setShowOrderErrorModal(true);
                        }
                      } catch (error) {
                        console.error('Order failed:', error);
                        setShowCheckoutModal(false);
                        setOrderErrorMessage('Network error. Please check your connection and try again.');
                        setShowOrderErrorModal(true);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Confirm Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Order Success Modal */}
        {showOrderSuccessModal && orderSuccessData && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Berhasil!</h3>
                <p className="text-gray-600 mb-4">Pesanan Anda telah berhasil dibuat</p>
                
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <div className="text-sm text-gray-700">
                    <p><strong>Order ID:</strong> {orderSuccessData.order_id}</p>
                    <p><strong>Produk:</strong> {orderSuccessData.product_name}</p>
                    <p><strong>Jumlah:</strong> {orderSuccessData.quantity}x</p>
                    <p><strong>Total:</strong> {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(orderSuccessData.total)}</p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowOrderSuccessModal(false);
                      window.location.href = '/orders';
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Lihat Pesanan
                  </button>
                  <button
                    onClick={() => setShowOrderSuccessModal(false)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Order Error Modal */}
        {showOrderErrorModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Gagal!</h3>
                <p className="text-gray-600 mb-4">Maaf, pesanan Anda tidak dapat diproses</p>
                
                <div className="bg-red-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-700">{orderErrorMessage}</p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowOrderErrorModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      setShowOrderErrorModal(false);
                      setShowCheckoutModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}