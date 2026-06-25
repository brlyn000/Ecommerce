import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiRefreshCw, FiEye, FiX, FiPackage, FiFilter, FiTrash2, FiDownload } from 'react-icons/fi';
import { API_BASE_URL } from '../../../config/api';
import Pagination from './Pagination';
import * as XLSX from 'xlsx';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const STATUS_COLORS = {
  pending:   'bg-orange-100 text-orange-700',
  completed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  mixed:     'bg-gray-100 text-gray-700',
  disputed:  'bg-yellow-100 text-yellow-700',
};

const Badge = ({ status }) => (
  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
    {status}
  </span>
);

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [detail, setDetail] = useState(null);
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleDelete = async (orderId) => {
    if (!window.confirm(`Hapus order ${orderId}? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/orders/admin/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setOrders(prev => prev.filter(o => o.order_id !== orderId));
    } catch {
      alert('Gagal menghapus order');
    }
  };

  const exportExcel = () => {
    const rows = filtered.map(o => ({
      'Order ID': o.order_id,
      'Customer': o.customer_name,
      'Email': o.customer_email || '',
      'Items': o.items.length,
      'Total': parseFloat(o.total),
      'Status': o.status,
      'Tanggal': new Date(o.created_at).toLocaleDateString('id-ID'),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `orders_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/orders/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      // Group by order_id
      const grouped = {};
      data.forEach(row => {
        if (!grouped[row.order_id]) {
          grouped[row.order_id] = {
            order_id: row.order_id,
            customer_name: row.customer_name,
            customer_email: row.customer_email,
            total: row.total,
            status: row.status,
            created_at: row.created_at,
            items: [],
          };
        }
        grouped[row.order_id].items.push({
          product_name: row.product_name,
          product_image: row.product_image,
          quantity: row.quantity,
          price: row.price,
          item_status: row.item_status,
          tenant_username: row.tenant_username,
          store_name: row.store_name,
        });
      });

      const list = Object.values(grouped).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(list);

      // Compute stats
      const s = { total: list.length, revenue: 0 };
      list.forEach(o => {
        s[o.status] = (s[o.status] || 0) + 1;
        if (o.status !== 'cancelled') s.revenue += parseFloat(o.total || 0);
      });
      setStats(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || o.order_id.toLowerCase().includes(q) || o.customer_name?.toLowerCase().includes(q) || o.customer_email?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manajemen Order</h2>
          <p className="text-sm text-gray-500 mt-0.5">Semua transaksi dari seluruh tenant</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors">
            <FiDownload className="w-4 h-4" /> Export Excel
          </button>
          <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors">
            <FiRefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Orders', value: stats.total || 0, color: 'border-l-gray-400' },
          { label: 'Pending', value: stats.pending || 0, color: 'border-l-orange-400' },
          { label: 'Confirmed', value: stats.confirmed || 0, color: 'border-l-green-400' },
          { label: 'Cancelled', value: stats.cancelled || 0, color: 'border-l-red-400' },
          { label: 'Revenue', value: fmt(stats.revenue || 0), color: 'border-l-emerald-400' },
        ].map(s => (
          <div key={s.label} className={`bg-white p-4 rounded-xl border border-l-4 shadow-sm ${s.color}`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-1 truncate">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari order ID, nama, atau email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400 w-4 h-4 flex-shrink-0" />
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Tanggal', 'Aksi'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                      <FiPackage className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Tidak ada order ditemukan
                    </td>
                  </tr>
                ) : paginated.map((o, i) => (
                  <motion.tr
                    key={o.order_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm font-mono font-medium text-gray-900">{o.order_id}</td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900">{o.customer_name}</p>
                      <p className="text-xs text-gray-500">{o.customer_email}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{o.items.length} item</td>
                    <td className="px-5 py-3 text-sm font-bold text-emerald-600">{fmt(o.total)}</td>
                    <td className="px-5 py-3"><Badge status={o.status} /></td>
                    <td className="px-5 py-3 text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setDetail(o)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(o.order_id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Order"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {detail && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white rounded-t-2xl px-6 pt-5 pb-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">Detail Order</h3>
                  <p className="text-xs font-mono text-gray-500 mt-0.5">{detail.order_id}</p>
                </div>
                <button onClick={() => setDetail(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Customer</p>
                  <p className="font-semibold text-gray-900">{detail.customer_name}</p>
                  <p className="text-sm text-gray-500">{detail.customer_email}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge status={detail.status} />
                    <span className="text-xs text-gray-400">{new Date(detail.created_at).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Items ({detail.items.length})</p>
                  <div className="space-y-2">
                    {detail.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                          <p className="text-xs text-gray-500">
                            Toko: {item.store_name || item.tenant_username} · {item.quantity}x · <Badge status={item.item_status} />
                          </p>
                        </div>
                        <p className="text-sm font-bold text-gray-900 ml-3 flex-shrink-0">{fmt(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-emerald-50 rounded-xl p-4 flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total Pembayaran</span>
                  <span className="text-xl font-bold text-emerald-600">{fmt(detail.total)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManager;
