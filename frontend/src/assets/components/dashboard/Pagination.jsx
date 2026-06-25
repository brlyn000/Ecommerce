const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange }) => {
  if (totalPages <= 1 && totalItems <= pageSize) return null;

  const pages = [];
  const delta = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  const from = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>Tampil {from}–{to} dari {totalItems}</span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-red-500"
          >
            {[10, 20, 50, 100].map(s => <option key={s} value={s}>{s}/halaman</option>)}
          </select>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={i} className="px-2 py-1 text-xs text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                p === currentPage
                  ? 'bg-red-600 text-white border-red-600'
                  : 'border-gray-300 hover:bg-gray-100 text-gray-700'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
