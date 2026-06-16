import { useEffect, useRef, useState, useCallback } from 'react';
import { FiSearch, FiX, FiTrendingUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../config/api';
import HeadingTypography from './HeadingTypography';
import { api } from '../../services/api';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
    api.getProducts().then(data => setProducts(data || [])).catch(() => {});
  }, []);

  const buildSuggestions = useCallback((q) => {
    if (!q.trim()) { setSuggestions([]); return; }
    const lower = q.toLowerCase();
    const seen = new Set();
    const result = [];

    for (const p of products) {
      if (result.length >= 6) break;
      if (p.name.toLowerCase().includes(lower)) {
        const key = `p-${p.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push({ type: 'product', label: p.name, id: p.id, image: p.image, price: p.price, discount: p.discount });
        }
      }
    }

    const cats = [...new Set(
      products.filter(p => p.category_name?.toLowerCase().includes(lower)).map(p => p.category_name)
    )].slice(0, 2);
    for (const cat of cats) {
      if (!seen.has(`c-${cat}`) && result.length < 8) {
        seen.add(`c-${cat}`);
        result.push({ type: 'category', label: cat });
      }
    }

    setSuggestions(result);
  }, [products]);

  useEffect(() => {
    buildSuggestions(searchTerm);
    setShowSuggestions(!!searchTerm.trim());
    setActiveSuggestion(-1);
  }, [searchTerm, buildSuggestions]);

  const handleSelect = (s) => {
    setShowSuggestions(false);
    if (s.type === 'product') {
      navigate(`/product/${s.id}`);
    } else {
      onSearchChange(s.label);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || !suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSuggestion(p => Math.min(p + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSuggestion(p => Math.max(p - 1, -1)); }
    else if (e.key === 'Enter' && activeSuggestion >= 0) { e.preventDefault(); handleSelect(suggestions[activeSuggestion]); }
    else if (e.key === 'Escape') setShowSuggestions(false);
  };

  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const highlight = (text, q) => {
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<span className="font-bold text-red-600">{text.slice(idx, idx + q.length)}</span>{text.slice(idx + q.length)}</>;
  };

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

          <input
            ref={inputRef}
            type="text"
            placeholder="Cari produk mahasiswa..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => searchTerm.trim() && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="block w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-full shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                      transition-all duration-300 hover:border-red-300 text-gray-700
                      bg-white/90 backdrop-blur-sm"
          />

          {searchTerm && (
            <button
              onClick={() => { onSearchChange(''); inputRef.current?.focus(); }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center group"
            >
              <div className="p-1 rounded-full group-hover:bg-gray-100 transition-colors">
                <FiX className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              </div>
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FiTrendingUp className="w-3 h-3" /> Saran pencarian
                </span>
              </div>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onMouseDown={() => handleSelect(s)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors ${activeSuggestion === idx ? 'bg-red-50' : ''}`}
                >
                  {s.type === 'product' ? (
                    <>
                      <img
                        src={getImageUrl(s.image)}
                        alt={s.label}
                        className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => { e.target.src = '/images/placeholder.svg'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{highlight(s.label, searchTerm)}</p>
                        <p className="text-xs text-red-600 font-medium">
                          {s.discount ? formatRupiah(s.price * (1 - s.discount / 100)) : formatRupiah(s.price)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">Produk</span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiSearch className="w-4 h-4 text-red-500" />
                      </div>
                      <p className="text-sm text-gray-800 flex-1">{highlight(s.label, searchTerm)}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">Kategori</span>
                    </>
                  )}
                </button>
              ))}
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
