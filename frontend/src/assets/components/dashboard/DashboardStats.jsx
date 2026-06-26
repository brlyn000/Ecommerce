import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiUsers, FiShoppingBag, FiDollarSign, FiAlertCircle, FiMail, FiTrendingUp, FiGrid } from 'react-icons/fi';
import { getAnalyticsOverview, getContactAnalytics } from '../../../services/api';
import { API_BASE_URL } from '../../../config/api';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const StatCard = ({ title, value, icon: Icon, color, sub, onClick, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    onClick={onClick}
    className={`bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-all ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
  >
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color} ml-3 flex-shrink-0`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
  </motion.div>
);

const DashboardStats = () => {
  const [overview, setOverview] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    window.addEventListener('productChanged', fetchData);
    return () => window.removeEventListener('productChanged', fetchData);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const [overviewData, contactData] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/overview`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        getContactAnalytics(),
      ]);
      setOverview(overviewData);
      setRecentActivity(contactData.recentActivity || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border animate-pulse">
            <div className="h-3 bg-gray-200 rounded mb-3 w-2/3" />
            <div className="h-7 bg-gray-200 rounded mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );

  const go = (menu) => window.dispatchEvent(new CustomEvent('switchMenu', { detail: menu }));
  const o = overview?.overview || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">Ringkasan semua aktivitas platform</p>
        </div>
        <button onClick={fetchData} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
          Refresh
        </button>
      </div>

      {/* Stat Cards Row 1 — Keuangan & Transaksi */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">💰 Transaksi & Pendapatan</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={fmt(o.revenue || 0)} icon={FiDollarSign} color="bg-emerald-500" sub="Semua order non-cancelled" delay={0} />
          <StatCard title="Total Orders" value={o.orders || 0} icon={FiShoppingBag} color="bg-blue-500" sub={`${o.pendingOrders || 0} pending`} onClick={() => go('orders')} delay={0.05} />
          <StatCard title="Pending Orders" value={o.pendingOrders || 0} icon={FiAlertCircle} color="bg-orange-500" sub="Menunggu konfirmasi" onClick={() => go('orders')} delay={0.1} />
          <StatCard title="Produk Habis" value={o.soldOutProducts || 0} icon={FiPackage} color="bg-red-500" sub="Stok = 0" onClick={() => go('products')} delay={0.15} />
        </div>
      </div>

      {/* Stat Cards Row 2 — Pengguna & Konten */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">👥 Pengguna & Konten</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={o.users || 0} icon={FiUsers} color="bg-violet-500" onClick={() => go('users')} delay={0.2} />
          <StatCard title="Total Tenants" value={o.tenants || 0} icon={FiUsers} color="bg-pink-500" onClick={() => go('tenants')} delay={0.25} />
          <StatCard title="Total Produk" value={o.products || 0} icon={FiPackage} color="bg-sky-500" onClick={() => go('products')} delay={0.3} />
          <StatCard title="Pesan Masuk" value={o.contacts || 0} icon={FiMail} color="bg-teal-500" onClick={() => go('contacts')} delay={0.35} />
        </div>
      </div>

      {/* Second Row — Recent Orders + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Order Terbaru</h3>
            <button onClick={() => go('orders')} className="text-xs text-red-600 hover:underline">Lihat semua →</button>
          </div>
          <div className="space-y-2">
            {(overview?.recentOrders || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada order</p>
            ) : (
              overview.recentOrders.map((order, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">{order.order_id} · {order.item_count} item</p>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900">{fmt(order.total)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      order.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{order.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Tambah Produk', desc: 'Buat listing baru', menu: 'products', color: 'bg-red-50 hover:bg-red-100 text-red-900', dot: 'bg-red-500' },
              { label: 'Kelola Order', desc: `${o.pendingOrders || 0} pending`, menu: 'orders', color: 'bg-blue-50 hover:bg-blue-100 text-blue-900', dot: 'bg-blue-500' },
              { label: 'Kelola Tenant', desc: `${o.tenants || 0} terdaftar`, menu: 'tenants', color: 'bg-pink-50 hover:bg-pink-100 text-pink-900', dot: 'bg-pink-500' },
              { label: 'Lihat Analytics', desc: 'Laporan lengkap', menu: 'analytics', color: 'bg-violet-50 hover:bg-violet-100 text-violet-900', dot: 'bg-violet-500' },
              { label: 'Kelola Kategori', desc: `${o.categories || 0} kategori`, menu: 'categories', color: 'bg-green-50 hover:bg-green-100 text-green-900', dot: 'bg-green-500' },
              { label: 'Pesan Masuk', desc: `${o.contacts || 0} pesan`, menu: 'contacts', color: 'bg-teal-50 hover:bg-teal-100 text-teal-900', dot: 'bg-teal-500' },
            ].map((a) => (
              <button key={a.menu} onClick={() => go(a.menu)} className={`p-3 rounded-lg transition-colors text-left ${a.color}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${a.dot}`} />
                  <p className="font-semibold text-sm">{a.label}</p>
                </div>
                <p className="text-xs opacity-70">{a.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Third Row — Produk per Kategori + Aktivitas Kontak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4">Produk per Kategori</h3>
          <div className="space-y-3">
            {(overview?.productsByCategory || []).map((cat, i) => {
              const max = Math.max(...(overview.productsByCategory.map(c => c.count)), 1);
              const pct = Math.round((cat.count / max) * 100);
              const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate">{cat.category}</span>
                    <span className="font-semibold text-gray-900 ml-2">{cat.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${colors[i % colors.length]} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4">Pesan Terbaru</h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Tidak ada pesan terbaru</p>
            ) : (
              recentActivity.slice(0, 5).map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    a.status === 'new' ? 'bg-red-500' : a.status === 'read' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 truncate"><span className="font-medium">{a.name}</span> — {a.subject}</p>
                    <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    a.status === 'new' ? 'bg-red-100 text-red-700' : a.status === 'read' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>{a.status === 'new' ? 'Baru' : a.status === 'read' ? 'Dibaca' : 'Dibalas'}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
