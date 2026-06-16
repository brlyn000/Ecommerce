import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiX, FiTrendingUp } from 'react-icons/fi';
import { api } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../config/api';
import Navbar from '../assets/components/Navbar';

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debouncedTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (!debouncedTerm.trim()) {
      setProducts([]);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    fetchSearch(debouncedTerm.trim());
  }, [debouncedTerm]);

  const fetchSearch = async (q) => {
    try {
      setLoading(true);
      const data = await api.searchProducts(q);
      const results = data || [];
      setProducts(results);
      buildSuggestions(q, results);
      setShowSuggestions(true);
    } catch {
      setProducts([]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const buildSuggestions = useCallback((q, results) => {
    const seen = new Set();
    const list = [];

    for (const p of results) {
      if (list.length >= 6) break;
      seen.add(p.id);
      list.push({ type: 'product', label: p.name, id: p.id, image: p.image, price: p.price, discount: p.discount });
    }

    const categories = [...new Set(
      results.filter(p => p.category_name?.toLowerCase().includes(q.toLowerCase())).map(p => p.category_name)
    )].slice(0, 3);

    for (const cat of categories) {
      if (!seen.has(`cat-${cat}`) && list.length < 8) {
        seen.add(`cat-${cat}`);
        list.push({ type: 'category', label: cat });
      }
    }

    setSuggestions(list);
  }, []);

  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const handleSelectSuggestion = (s) => {
    setShowSuggestions(false);
    if (s.type === 'product') navigate(`/product/${s.id}`);
    else setSearchTerm(s.label);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || !suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSuggestion(p => Math.min(p + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSuggestion(p => Math.max(p - 1, -1)); }
    else if (e.key === 'Enter' && activeSuggestion >= 0) { e.preventDefault(); handleSelectSuggestion(suggestions[activeSuggestion]); }
    else if (e.key === 'Escape') setShowSuggestions(false);
  };

  const highlightMatch = (text, query) => {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<span className="font-bold text-red-600">{text.slice(idx, idx + query.length)}</span>{text.slice(idx + query.length)}</>;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setActiveSuggestion(-1); }}
                onKeyDown={handleKeyDown}
                onFocus={() => searchTerm.trim() && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search products..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(''); setProducts([]); setSuggestions([]); inputRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FiTrendingUp className="w-3 h-3" /> Saran pencarian
                    </span>
                  </div>
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onMouseDown={() => handleSelectSuggestion(s)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors ${activeSuggestion === idx ? 'bg-red-50' : ''}`}
                    >
                      {s.type === 'product' ? (
                        <>
                          <img src={getImageUrl(s.image)} alt={s.label} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" onError={(e) => { e.target.src = '/images/placeholder.svg'; }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 truncate">{highlightMatch(s.label, searchTerm)}</p>
                            <p className="text-xs text-red-600 font-medium">{s.discount ? formatRupiah(s.price * (1 - s.discount / 100)) : formatRupiah(s.price)}</p>
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">Produk</span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiSearch className="w-4 h-4 text-red-500" />
                          </div>
                          <p className="text-sm text-gray-800 flex-1">{highlightMatch(s.label, searchTerm)}</p>
                          <span className="text-xs text-gray-400 flex-shrink-0">Kategori</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {debouncedTerm && !loading && (
            <p className="text-gray-600 mb-4">{products.length} hasil untuk "{debouncedTerm}"</p>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
                  <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-32 object-cover rounded mb-3" onError={(e) => { e.target.src = '/images/placeholder.svg'; }} />
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-red-600 font-bold">
                      {product.discount ? formatRupiah(product.price * (1 - product.discount / 100)) : formatRupiah(product.price)}
                    </span>
                    <span className="text-xs text-gray-500">{product.category_name}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : debouncedTerm && !loading ? (
            <div className="text-center py-12">
              <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Produk tidak ditemukan</h3>
              <p className="text-gray-600">Coba dengan kata kunci lain</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cari Produk</h3>
              <p className="text-gray-600">Ketik kata kunci untuk mencari produk</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Search;
