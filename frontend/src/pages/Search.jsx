import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiX, FiTrendingUp, FiClock, FiTag } from 'react-icons/fi';
import { api } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../config/api';
import Navbar from '../assets/components/Navbar';

const RECENT_KEY = 'ekraft_recent_searches';
const MAX_RECENT = 5;

const getRecent = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; } };
const saveRecent = (term) => {
  const prev = getRecent().filter(t => t !== term);
  localStorage.setItem(RECENT_KEY, JSON.stringify([term, ...prev].slice(0, MAX_RECENT)));
};
const removeRecent = (term) => {
  localStorage.setItem(RECENT_KEY, JSON.stringify(getRecent().filter(t => t !== term)));
};

const getGhostText = (input, suggestions) => {
  if (!input.trim() || !suggestions.length) return '';
  const lower = input.toLowerCase();
  for (const s of suggestions) {
    if (s.type !== 'product' && s.type !== 'category') continue;
    const label = s.label.toLowerCase();
    if (label.startsWith(lower) && label !== lower) {
      return s.label.slice(input.length);
    }
  }
  return '';
};

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
    <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-2.5 bg-gray-100 rounded w-1/3" />
    </div>
  </div>
);

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recentSearches, setRecentSearches] = useState(getRecent());
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debouncedTerm = useDebounce(searchTerm, 300);

  const ghostText = getGhostText(searchTerm, suggestions);

  useEffect(() => {
    api.getTrendingSearches().then(data => setTrending(data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!debouncedTerm.trim()) {
      setProducts([]);
      setSuggestions([]);
      setSuggestionLoading(false);
      return;
    }
    fetchSearch(debouncedTerm.trim());
  }, [debouncedTerm]);

  // Show suggestion skeleton immediately on type
  useEffect(() => {
    if (searchTerm.trim()) setSuggestionLoading(true);
    else setSuggestionLoading(false);
  }, [searchTerm]);

  const fetchSearch = async (q) => {
    try {
      setLoading(true);
      setSuggestionLoading(true);
      const data = await api.searchProducts(q);
      const results = data || [];
      setProducts(results);
      buildSuggestions(q, results);
      setShowDropdown(true);
    } catch {
      setProducts([]);
      setSuggestions([]);
    } finally {
      setLoading(false);
      setSuggestionLoading(false);
    }
  };

  const buildSuggestions = useCallback((q, results) => {
    const seen = new Set();
    const list = [];
    for (const p of results) {
      if (list.length >= 5) break;
      seen.add(p.id);
      list.push({ type: 'product', label: p.name, id: p.id, image: p.image, price: p.price, discount: p.discount });
    }
    const categories = [...new Set(
      results.filter(p => p.category_name?.toLowerCase().includes(q.toLowerCase())).map(p => p.category_name)
    )].slice(0, 2);
    for (const cat of categories) {
      if (!seen.has(`cat-${cat}`) && list.length < 8) {
        seen.add(`cat-${cat}`);
        list.push({ type: 'category', label: cat });
      }
    }
    setSuggestions(list);
  }, []);

  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const handleSelect = (s) => {
    setShowDropdown(false);
    if (s.type === 'product' || s.type === 'trending') {
      saveRecent(s.label);
      setRecentSearches(getRecent());
      api.trackProductClick(s.id).catch(() => {});
      navigate(`/product/${s.id}`);
    } else {
      saveRecent(s.label);
      setRecentSearches(getRecent());
      setSearchTerm(s.label);
    }
  };

  const handleDeleteRecent = (e, term) => {
    e.stopPropagation();
    removeRecent(term);
    setRecentSearches(getRecent());
  };

  const allDropdownItems = () => {
    if (searchTerm.trim()) return suggestions;
    const items = [];
    recentSearches.forEach(t => items.push({ type: 'recent', label: t }));
    trending.forEach(t => items.push({ type: 'trending', label: t.name, id: t.id, image: t.image, price: t.price, discount: t.discount }));
    return items;
  };

  const handleKeyDown = (e) => {
    // Tab: terima ghost text
    if (e.key === 'Tab' && ghostText) {
      e.preventDefault();
      setSearchTerm(searchTerm + ghostText);
      return;
    }
    const items = allDropdownItems();
    if (!showDropdown || !items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSuggestion(p => Math.min(p + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSuggestion(p => Math.max(p - 1, -1)); }
    else if (e.key === 'Enter' && activeSuggestion >= 0) { e.preventDefault(); handleSelect(items[activeSuggestion]); }
    else if (e.key === 'Escape') setShowDropdown(false);
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<span className="font-bold text-red-600">{text.slice(idx, idx + query.length)}</span>{text.slice(idx + query.length)}</>;
  };

  const isOpen = showDropdown && (
    searchTerm.trim()
      ? (suggestionLoading || suggestions.length > 0)
      : (recentSearches.length > 0 || trending.length > 0)
  );

  let flatIndex = 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />

              {/* Background wrapper */}
              <div className="absolute inset-0 rounded-lg bg-white border border-gray-300" />

              {/* Input — transparan agar ghost text terlihat */}
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setActiveSuggestion(-1); }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                placeholder="Cari produk..."
                className="relative z-10 w-full pl-10 pr-10 py-3 rounded-lg bg-transparent
                           focus:outline-none focus:ring-2 focus:ring-red-500
                           text-gray-700 caret-gray-700"
                autoFocus
              />

              {/* Ghost text layer */}
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 z-10 w-full pl-10 pr-10 flex items-center pointer-events-none overflow-hidden"
              >
                <span
                  className="whitespace-pre text-transparent text-base"
                  style={{ fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit' }}
                >
                  {searchTerm}
                </span>
                <span className="text-gray-400 text-base whitespace-pre" style={{ fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit' }}>
                  {ghostText}
                </span>
                {ghostText && (
                  <span className="ml-1.5 flex-shrink-0 text-xs text-gray-400 border border-gray-300 rounded px-1 py-0.5 leading-none">
                    Tab ↹
                  </span>
                )}
              </div>
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(''); setProducts([]); setSuggestions([]); inputRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">

                  {/* Loading skeleton */}
                  {searchTerm.trim() && suggestionLoading && (
                    <>{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</>
                  )}

                  {/* Suggestions (produk + kategori) */}
                  {searchTerm.trim() && !suggestionLoading && suggestions.length > 0 && (
                    <>
                      <div className="px-3 py-2 border-b border-gray-100">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FiTrendingUp className="w-3 h-3" /> Saran pencarian
                        </span>
                      </div>
                      {suggestions.map((s) => {
                        const idx = flatIndex++;
                        return (
                          <button
                            key={`s-${idx}`}
                            onMouseDown={() => handleSelect(s)}
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
                                  <FiTag className="w-4 h-4 text-red-500" />
                                </div>
                                <p className="text-sm text-gray-800 flex-1">{highlightMatch(s.label, searchTerm)}</p>
                                <span className="text-xs text-gray-400 flex-shrink-0">Kategori</span>
                              </>
                            )}
                          </button>
                        );
                      })}
                    </>
                  )}

                  {/* No results */}
                  {searchTerm.trim() && !suggestionLoading && suggestions.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">
                      Tidak ada saran untuk "{searchTerm}"
                    </div>
                  )}

                  {/* Recent searches */}
                  {!searchTerm.trim() && recentSearches.length > 0 && (
                    <>
                      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FiClock className="w-3 h-3" /> Pencarian terakhir
                        </span>
                        <button
                          onMouseDown={() => { localStorage.removeItem(RECENT_KEY); setRecentSearches([]); }}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          Hapus semua
                        </button>
                      </div>
                      {recentSearches.map((term) => {
                        const idx = flatIndex++;
                        return (
                          <button
                            key={`r-${term}`}
                            onMouseDown={() => handleSelect({ type: 'recent', label: term })}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors ${activeSuggestion === idx ? 'bg-red-50' : ''}`}
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FiClock className="w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-700 flex-1">{term}</p>
                            <span
                              onMouseDown={(e) => handleDeleteRecent(e, term)}
                              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                            >
                              <FiX className="w-3 h-3 text-gray-400" />
                            </span>
                          </button>
                        );
                      })}
                    </>
                  )}

                  {/* Trending searches */}
                  {!searchTerm.trim() && trending.length > 0 && (
                    <>
                      <div className={`px-3 py-2 flex items-center gap-1 ${recentSearches.length > 0 ? 'border-t border-gray-100' : ''}`}>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FiTrendingUp className="w-3 h-3 text-red-400" /> Trending sekarang
                        </span>
                      </div>
                      {trending.map((t) => {
                        const idx = flatIndex++;
                        return (
                          <button
                            key={`t-${t.id}`}
                            onMouseDown={() => handleSelect({ type: 'trending', label: t.name, id: t.id, image: t.image, price: t.price, discount: t.discount })}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors ${activeSuggestion === idx ? 'bg-red-50' : ''}`}
                          >
                            <img src={getImageUrl(t.image)} alt={t.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" onError={(e) => { e.target.src = '/images/placeholder.svg'; }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 truncate">{t.name}</p>
                              <p className="text-xs text-red-600 font-medium">{t.discount ? formatRupiah(t.price * (1 - t.discount / 100)) : formatRupiah(t.price)}</p>
                            </div>
                            <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full flex-shrink-0">🔥 Trending</span>
                          </button>
                        );
                      })}
                    </>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {debouncedTerm && !loading && (
            <p className="text-gray-600 mb-4">{products.length} hasil untuk "{debouncedTerm}"</p>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={() => { saveRecent(product.name); api.trackProductClick(product.id).catch(() => {}); }}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                >
                  <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-32 object-cover rounded mb-3" onError={(e) => { e.target.src = '/images/placeholder.svg'; }} />
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{highlightMatch(product.name, debouncedTerm)}</h3>
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
