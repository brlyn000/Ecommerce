import { useParams } from 'react-router-dom';
import { FaStar, FaRegStar, FaShoppingCart, FaHeart, FaShareAlt, FaChevronLeft } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import html2canvas from 'html2canvas';
import CommentSection from '../assets/components/CommentSection';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const productCardRef = useRef(null);
  const shareButtonRef = useRef(null);
  const shareDropdownRef = useRef(null);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.getProductById(id);
        setProduct(data);
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/90 to-yellow-50/90">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading product details...</p>
        <p className="text-sm text-gray-500 mt-2">Product ID: {id}</p>
      </div>
    );
  }

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/90 to-yellow-50/90 p-8">
      <div className="bg-white/95 rounded-3xl shadow-xl p-8 max-w-md text-center border border-gray-100 backdrop-blur-sm">
        <div className="text-8xl mb-4 text-yellow-400">😕</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">Sorry, the product you are looking for is not available.</p>
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-white to-yellow-50/80 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <a 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-all duration-300 group"
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
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-contain transition-transform duration-500 hover:scale-105 p-4"
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
                      {product.discount} OFF
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`absolute top-4 right-4 p-2 rounded-full shadow-sm transition-colors ${isWishlisted ? 'bg-red-100 text-red-500' : 'bg-white/90 text-gray-400 hover:bg-red-100 hover:text-red-500'}`}
                >
                  <FaHeart className={isWishlisted ? 'fill-current' : ''} />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {renderStars(product.rating)}
                </div>
                <span className="text-gray-600 text-sm">({product.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="ml-2 text-lg text-gray-400 line-through">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Product Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                <div className="mt-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {product.category_name || 'Uncategorized'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto space-y-4">
                <div className="flex space-x-4">
                  <a href={product.whatsapp} className="flex-1 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center">
                    <FaShoppingCart className="mr-2" />
                    ORDER NOW
                  </a>
                  <div className="relative">
                    <button 
                      ref={shareButtonRef}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowShareOptions(!showShareOptions);
                      }}
                      className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-300 shadow-sm"
                    >
                      <FaShareAlt className="text-blue-500" />
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
                <div className="flex items-center text-sm text-gray-500 mt-3">
                  <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Stock: {product.stock_status || 'available'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12 bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button className="py-4 px-6 text-center border-b-2 font-medium text-sm border-blue-500 text-blue-600">
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
        
        {/* Comment Section */}
        <div className="mt-8">
          <CommentSection productId={product.id} />
        </div>
      </div>
    </div>
  );
}