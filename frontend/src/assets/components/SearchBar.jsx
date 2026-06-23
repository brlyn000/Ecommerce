import { useEffect, useRef, useState, useCallback } from 'react';
import { FiSearch, FiX, FiTrendingUp, FiClock, FiTag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../config/api';
import HeadingTypography from './HeadingTypography';
import { api } from '../../services/api';

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

// Hitung ghost text: kata lanjutan dari suggestion yang cocok dengan akhir input
const getGhostText = (input, suggestions) => {
  if (!input.trim() || !suggestions.length) return '';
  const lower = input.toLowerCase();
  for (const s of suggestions) {
    if (s.type !== 'product' && s.type !== 'category') continue;
    const label = s.label.toLowerCase();
    if (label.startsWith(lower) && label !== lower) {
      return s.label.slice(input.length); // sisa kata setelah yang sudah diketik
    }
  }
  return '';
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

const SearchBar = ({ searchTerm, onSearchChange }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recentSearches, setRecentSearches] = useState(getRecent());
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const ghostText = getGhostText(searchTerm, suggestions);

  useEffect(() => {
    inputRef.current?.focus();
    api.getTrendingSearches().then(data => setTrending(data || [])).catch(() => {});
  }, []);

  const buildSuggestions = useCallback(async (q) => {
    if (!q.trim()) { setSuggestions([]); setLoading(false); return; }
    try {
      setLoading(true);
      const results = await api.searchProducts(q.trim());
      const seen = new Set();
      const list = [];
      for (const p of (results || [])) {
        if (list.length >= 5) break;
        seen.add(p.id);
        list.push({ type: 'product', label: p.name, id: p.id, image: p.image, price: p.price, discount: p.discount, score: p.ranking_score });
      }
      const cats = [...new Set(
        (results || []).filter(p => p.category_name?.toLowerCase().includes(q.toLowerCase())).map(p => p.category_name)
      )].slice(0, 2);
      for (const cat of cats) {
        if (!seen.has(`c-${cat}`) && list.length < 8) {
          seen.add(`c-${cat}`);
          list.push({ type: 'category', label: cat });
        }
      }
      setSuggestions(list);
    } catch { setSuggestions([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setActiveSuggestion(-1);
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buildSuggestions(searchTerm), 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, buildSuggestions]);

  const handleFocus = () => setShowDropdown(true);
  const handleBlur = () => setTimeout(() => setShowDropdown(false), 150);

  const handleSelect = (s) => {
    setShowDropdown(false);
    if (s.type === 'product') {
      saveRecent(s.label);
      setRecentSearches(getRecent());
      api.trackProductClick(s.id).catch(() => {});
      navigate(`/product/${s.id}`);
    } else if (s.type === 'category' || s.type === 'recent' || s.type === 'trending') {
      saveRecent(s.label);
      setRecentSearches(getRecent());
      onSearchChange(s.label);
    }
  };

  const handleDeleteRecent = (e, term) => {
    e.stopPropagation();
    removeRecent(term);
    setRecentSearches(getRecent());
  };

  const handleKeyDown = (e) => {
    // Tab: terima ghost text
    if (e.key === 'Tab' && ghostText) {
      e.preventDefault();
      onSearchChange(searchTerm + ghostText);
      return;
    }
    const items = allDropdownItems();
    if (!showDropdown || !items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSuggestion(p => Math.min(p + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSuggestion(p => Math.max(p - 1, -1)); }
    else if (e.key === 'Enter' && activeSuggestion >= 0) { e.preventDefault(); handleSelect(items[activeSuggestion]); }
    else if (e.key === 'Escape') setShowDropdown(false);
  };

  const allDropdownItems = () => {
    if (searchTerm.trim()) return suggestions;
    const items = [];
    recentSearches.forEach(t => items.push({ type: 'recent', label: t }));
    trending.forEach(t => items.push({ type: 'trending', label: t.name, id: t.id, image: t.image, price: t.price, discount: t.discount }));
    return items;
  };

  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const highlight = (text, q) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<span className="font-bold text-red-600">{text.slice(idx, idx + q.length)}</span>{text.slice(idx + q.length)}</>;
  };

  const isOpen = showDropdown && (
    searchTerm.trim()
      ? (loading || suggestions.length > 0)
      : (recentSearches.length > 0 || trending.length > 0)
  );

  let flatIndex = 0;

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center mb-6">
          <HeadingTypography text='Cari Semuanya di E-Kraft' />
        </div>

        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>

          {/* Background wrapper — agar ghost text layer dan input berbagi background */}
          <div className="absolute inset-0 rounded-full bg-white/90 backdrop-blur-sm border-2 border-gray-200 hover:border-red-300 transition-all duration-300" />

          {/* Input — transparan agar ghost text terlihat */}
          <input
            ref={inputRef}
            type="text"
            placeholder={searchTerm ? '' : 'Cari produk mahasiswa...'}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="relative z-10 block w-full pl-12 pr-10 py-3 rounded-full bg-transparent
                      focus:outline-none focus:ring-2 focus:ring-red-500
                      text-gray-700 caret-gray-700"
          />

          {/* Ghost text layer — di atas background, di bawah input tapi pointer-events-none */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 z-10 w-full pl-12 pr-10 flex items-center pointer-events-none overflow-hidden"
          >
            {/* spacer tak terlihat selebar teks yang sudah diketik */}
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
              onClick={() => { onSearchChange(''); inputRef.current?.focus(); }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center group z-10"
            >
              <div className="p-1 rounded-full group-hover:bg-gray-100 transition-colors">
                <FiX className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              </div>
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">

              {/* Loading skeleton */}
              {searchTerm.trim() && loading && (
                <>{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</>
              )}

              {/* Search suggestions (produk + kategori) */}
              {searchTerm.trim() && !loading && suggestions.length > 0 && (
                <>
                  <div className="px-4 py-2 border-b border-gray-100">
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
                              <p className="text-sm text-gray-800 truncate">{highlight(s.label, searchTerm)}</p>
                              <p className="text-xs text-red-600 font-medium">{s.discount ? formatRupiah(s.price * (1 - s.discount / 100)) : formatRupiah(s.price)}</p>
                            </div>
                            <span className="text-xs text-gray-400 flex-shrink-0">Produk</span>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FiTag className="w-4 h-4 text-red-500" />
                            </div>
                            <p className="text-sm text-gray-800 flex-1">{highlight(s.label, searchTerm)}</p>
                            <span className="text-xs text-gray-400 flex-shrink-0">Kategori</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </>
              )}

              {/* No results */}
              {searchTerm.trim() && !loading && suggestions.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  Tidak ada saran untuk "{searchTerm}"
                </div>
              )}

              {/* Recent searches */}
              {!searchTerm.trim() && recentSearches.length > 0 && (
                <>
                  <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
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
                  <div className={`px-4 py-2 flex items-center gap-1 ${recentSearches.length > 0 ? 'border-t border-gray-100' : ''}`}>
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

        <div className="mt-2 text-sm text-gray-500 text-center">
          {!searchTerm && (
            <span className="animate-pulse">Coba cari: "desain", "makanan", "kerajinan"</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
