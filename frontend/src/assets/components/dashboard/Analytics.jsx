import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiUsers, FiPackage, FiMail, FiShoppingBag, FiDollarSign, FiRefreshCw, FiDownload } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { API_BASE_URL } from '../../../config/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
const fmtDate = (d) => new Date(d).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });

const lineOpts = (label, isCurrency = false) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => isCurrency ? fmt(ctx.raw) : `${label}: ${ctx.raw}` } } },
  scales: { y: { beginAtZero: true, ticks: { callback: (v) => isCurrency ? `Rp${(v/1000).toFixed(0)}k` : v } }, x: { grid: { display: false } } },
});

const barOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
};

const donutOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
};

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-5 rounded-xl shadow-sm border">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend !== undefined && (
          <p className={`text-xs flex items-center gap-1 mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <FiTrendingUp className="h-3 w-3" />{trend >= 0 ? '+' : ''}{trend}%
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}><Icon className="h-5 w-5 text-white" /></div>
    </div>
  </motion.div>
);

const EmptyChart = ({ title }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border">
    <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
    <div className="h-56 flex items-center justify-center text-gray-400 text-sm">Tidak ada data dalam 30 hari terakhir</div>
  </div>
);

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [orderAnalytics, setOrderAnalytics] = useState(null);
  const [productAnalytics, setProductAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
    window.addEventListener('productChanged', fetchAll);
    return () => window.removeEventListener('productChanged', fetchAll);
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      const [ov, oa, pa] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/overview`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/analytics/orders`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/analytics/products`, { headers }).then(r => r.json()),
      ]);
      setOverview(ov);
      setOrderAnalytics(oa);
      setProductAnalytics(pa);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    // Title
    doc.setFontSize(18);
    doc.setTextColor(220, 38, 38);
    doc.text('Analytics Report - EkrafMarket', 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Digenerate: ${now}`, 14, 26);

    let y = 34;

    // Overview stats
    if (o && Object.keys(o).length > 0) {
      doc.setFontSize(13);
      doc.setTextColor(30);
      doc.text('Ringkasan Platform', 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [['Metrik', 'Nilai']],
        body: [
          ['Total Revenue', fmt(o.revenue || 0)],
          ['Total Orders', String(o.orders || 0)],
          ['Pending Orders', String(o.pendingOrders || 0)],
          ['Total Users', String(o.users || 0)],
          ['Total Tenants', String(o.tenants || 0)],
          ['Total Produk', String(o.products || 0)],
          ['Stok Habis', String(o.soldOutProducts || 0)],
          ['Pesan Masuk', String(o.contacts || 0)],
        ],
        headStyles: { fillColor: [220, 38, 38] },
        alternateRowStyles: { fillColor: [254, 242, 242] },
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // Revenue Trend
    if (overview?.revenueTrend?.length > 0) {
      doc.setFontSize(13);
      doc.setTextColor(30);
      doc.text('Revenue Trend (30 hari)', 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [['Tanggal', 'Revenue']],
        body: overview.revenueTrend.map(d => [
          new Date(d.date).toLocaleDateString('id-ID'),
          fmt(parseFloat(d.total)),
        ]),
        headStyles: { fillColor: [16, 185, 129] },
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // Order Trend
    if (overview?.orderTrend?.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.setTextColor(30);
      doc.text('Order Trend (30 hari)', 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [['Tanggal', 'Jumlah Order']],
        body: overview.orderTrend.map(d => [
          new Date(d.date).toLocaleDateString('id-ID'),
          String(d.count),
        ]),
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // Top Tenants
    if (orderAnalytics?.topTenantsByOrders?.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.setTextColor(30);
      doc.text('Top Tenant by Revenue', 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [['#', 'Username', 'Toko', 'Orders', 'Revenue']],
        body: orderAnalytics.topTenantsByOrders.map((t, i) => [
          String(i + 1),
          t.username,
          t.store_name || '-',
          String(t.order_count),
          fmt(t.revenue),
        ]),
        headStyles: { fillColor: [220, 38, 38] },
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // Top Products
    if (productAnalytics?.topProducts?.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.setTextColor(30);
      doc.text('Top Produk (by Likes)', 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [['#', 'Produk', 'Kategori', 'Stok', 'Likes', 'Rating']],
        body: productAnalytics.topProducts.map((p, i) => [
          String(i + 1),
          p.name,
          p.category || '-',
          String(p.stock),
          String(p.likes_count || 0),
          String(parseFloat(p.rating || 0).toFixed(1)),
        ]),
        headStyles: { fillColor: [124, 58, 237] },
        margin: { left: 14, right: 14 },
      });
    }

    doc.save(`analytics_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
    </div>
  );

  const o = overview?.overview || {};

  // Revenue trend chart data
  const revChartData = overview?.revenueTrend?.length > 0 ? {
    labels: overview.revenueTrend.map(d => fmtDate(d.date)),
    datasets: [{ label: 'Revenue', data: overview.revenueTrend.map(d => d.total), borderColor: '#10b981', backgroundColor: '#10b98120', borderWidth: 2, fill: true, tension: 0.4, pointBackgroundColor: '#10b981', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 4 }],
  } : null;

  // Order trend chart data
  const orderChartData = overview?.orderTrend?.length > 0 ? {
    labels: overview.orderTrend.map(d => fmtDate(d.date)),
    datasets: [{ label: 'Orders', data: overview.orderTrend.map(d => d.count), borderColor: '#3b82f6', backgroundColor: '#3b82f620', borderWidth: 2, fill: true, tension: 0.4, pointBackgroundColor: '#3b82f6', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 4 }],
  } : null;

  // User growth chart data
  const userChartData = overview?.userGrowth?.length > 0 ? {
    labels: overview.userGrowth.map(d => fmtDate(d.date)),
    datasets: [{ label: 'Users', data: overview.userGrowth.map(d => d.count), borderColor: '#8b5cf6', backgroundColor: '#8b5cf620', borderWidth: 2, fill: true, tension: 0.4, pointBackgroundColor: '#8b5cf6', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 4 }],
  } : null;

  // Products by category
  const catChartData = overview?.productsByCategory?.length > 0 ? {
    labels: overview.productsByCategory.map(c => c.category),
    datasets: [{ data: overview.productsByCategory.map(c => c.count), backgroundColor: COLORS, borderWidth: 2, borderColor: '#fff' }],
  } : null;

  // Orders by status donut
  const statusChartData = orderAnalytics?.ordersByStatus?.length > 0 ? {
    labels: orderAnalytics.ordersByStatus.map(s => s.status),
    datasets: [{ data: orderAnalytics.ordersByStatus.map(s => s.count), backgroundColor: COLORS, borderWidth: 2, borderColor: '#fff' }],
  } : null;

  // Top categories bar
  const topCatData = productAnalytics?.topCategories?.length > 0 ? {
    labels: productAnalytics.topCategories.map(c => c.category),
    datasets: [{ label: 'Produk', data: productAnalytics.topCategories.map(c => c.count), backgroundColor: '#ef4444', borderRadius: 4 }],
  } : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-sm text-gray-500 mt-0.5">Data lengkap platform 30 hari terakhir</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
            <FiDownload className="w-4 h-4" /> Export PDF
          </button>
          <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
            <FiRefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={fmt(o.revenue || 0)} icon={FiDollarSign} color="bg-emerald-500" />
        <StatCard title="Total Orders" value={o.orders || 0} icon={FiShoppingBag} color="bg-blue-500" />
        <StatCard title="Total Users" value={o.users || 0} icon={FiUsers} color="bg-violet-500" />
        <StatCard title="Total Tenants" value={o.tenants || 0} icon={FiUsers} color="bg-pink-500" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Produk" value={o.products || 0} icon={FiPackage} color="bg-sky-500" />
        <StatCard title="Pending Orders" value={o.pendingOrders || 0} icon={FiShoppingBag} color="bg-orange-500" />
        <StatCard title="Stok Habis" value={o.soldOutProducts || 0} icon={FiPackage} color="bg-red-500" />
        <StatCard title="Pesan Masuk" value={o.contacts || 0} icon={FiMail} color="bg-teal-500" />
      </div>

      {/* Row 1: Revenue + Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {revChartData ? (
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-3">📈 Revenue Trend (30 hari)</h3>
            <div className="h-56"><Line data={revChartData} options={lineOpts('Revenue', true)} /></div>
          </div>
        ) : <EmptyChart title="📈 Revenue Trend (30 hari)" />}

        {orderChartData ? (
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-3">🛒 Order Trend (30 hari)</h3>
            <div className="h-56"><Line data={orderChartData} options={lineOpts('Orders')} /></div>
          </div>
        ) : <EmptyChart title="🛒 Order Trend (30 hari)" />}
      </div>

      {/* Row 2: User Growth + Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {userChartData ? (
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-3">👥 Pertumbuhan User (30 hari)</h3>
            <div className="h-56"><Line data={userChartData} options={lineOpts('Users')} /></div>
          </div>
        ) : <EmptyChart title="👥 Pertumbuhan User (30 hari)" />}

        {statusChartData ? (
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-3">📦 Status Order</h3>
            <div className="h-56"><Doughnut data={statusChartData} options={donutOpts} /></div>
          </div>
        ) : <EmptyChart title="📦 Status Order" />}
      </div>

      {/* Row 3: Products by Category + Top Categories bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {catChartData ? (
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-3">🗂️ Produk per Kategori</h3>
            <div className="h-56"><Doughnut data={catChartData} options={donutOpts} /></div>
          </div>
        ) : <EmptyChart title="🗂️ Produk per Kategori" />}

        {topCatData ? (
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-3">🏆 Top Kategori</h3>
            <div className="h-56"><Bar data={topCatData} options={barOpts} /></div>
          </div>
        ) : <EmptyChart title="🏆 Top Kategori" />}
      </div>

      {/* Top Tenants Table */}
      {orderAnalytics?.topTenantsByOrders?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-5 border-b">
            <h3 className="font-semibold text-gray-900">🏪 Top Tenant by Revenue</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['#', 'Tenant', 'Toko', 'Total Orders', 'Revenue'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orderAnalytics.topTenantsByOrders.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-bold text-gray-500">#{i + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                          {t.username?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{t.username}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{t.store_name || '-'}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-blue-600">{t.order_count}</td>
                    <td className="px-5 py-3 text-sm font-bold text-emerald-600">{fmt(t.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Products Table */}
      {productAnalytics?.topProducts?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-5 border-b">
            <h3 className="font-semibold text-gray-900">⭐ Top Produk (by Likes)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['#', 'Produk', 'Kategori', 'Stok', 'Likes', 'Rating'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productAnalytics.topProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-bold text-gray-500">#{i + 1}</td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-5 py-3"><span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{p.category || '-'}</span></td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold ${p.stock <= 0 ? 'text-red-600' : p.stock <= 5 ? 'text-orange-600' : 'text-green-600'}`}>
                        {p.stock <= 0 ? '❌ Habis' : p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-pink-600 font-semibold">❤️ {p.likes_count || 0}</td>
                    <td className="px-5 py-3 text-sm text-yellow-600 font-semibold">⭐ {parseFloat(p.rating || 0).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
