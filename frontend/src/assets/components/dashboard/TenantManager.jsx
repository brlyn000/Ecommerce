import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiUser, FiX, FiSave, FiEye, FiEyeOff, FiShoppingBag, FiBarChart2, FiInfo } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { getImageUrl } from '../../../config/api';
import Pagination from './Pagination';

const API_URL = API_BASE_URL;

const TenantManager = () => {
  const [tenants, setTenants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [editingTenant, setEditingTenant] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', business_name: '',
    phone: '', address: '', status: 'active'
  });
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => { fetchTenants(); }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_URL}/users/tenants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTenants(res.data);
    } catch {
      showNotif('Gagal memuat data tenant', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotif = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const resetForm = () => {
    setFormData({ username: '', email: '', password: '', business_name: '', phone: '', address: '', status: 'active' });
    setEditingTenant(null);
    setShowForm(false);
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (editingTenant) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await axios.put(`${API_URL}/users/tenants/${editingTenant.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showNotif('Tenant berhasil diperbarui!');
      } else {
        await axios.post(`${API_URL}/users/tenants`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showNotif('Tenant berhasil ditambahkan!');
      }
      fetchTenants();
      resetForm();
    } catch (err) {
      showNotif(err.response?.data?.message || 'Gagal menyimpan tenant', 'error');
    }
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setFormData({
      username: tenant.username || '',
      email: tenant.email || '',
      password: '',
      business_name: tenant.business_name || '',
      phone: tenant.phone || '',
      address: tenant.address || '',
      status: tenant.status || 'active'
    });
    setShowForm(true);
  };

  const handleViewDetail = (tenant) => {
    setSelectedTenant(tenant);
    setShowDetail(true);
  };

  const handleDelete = async (id) => {
    const tenant = tenants.find(t => t.id === id);
    if (!window.confirm(`Hapus tenant "${tenant?.username}"?\n\nSemua produk milik tenant ini juga akan ikut dihapus. Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.delete(`${API_URL}/users/tenants/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const msg = res.data.deletedProducts > 0
        ? `Tenant dihapus. ${res.data.deletedProducts} produk ikut dihapus.`
        : 'Tenant berhasil dihapus!';
      showNotif(msg);
      fetchTenants();
    } catch {
      showNotif('Gagal menghapus tenant', 'error');
    }
  };

  const toggleStatus = async (tenant) => {
    try {
      const token = localStorage.getItem('adminToken');
      const newStatus = tenant.status === 'active' ? 'inactive' : 'active';
      await axios.put(`${API_URL}/users/tenants/${tenant.id}`, { ...tenant, business_name: tenant.business_name, status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotif(`Status diubah menjadi ${newStatus}`);
      fetchTenants();
    } catch {
      showNotif('Gagal mengubah status', 'error');
    }
  };

  const filtered = tenants.filter(t =>
    t.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Manajemen Tenant</h2>
          <p className="text-sm text-gray-500 mt-0.5">Kelola akun tenant, verifikasi KTM dan data lengkap</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
          <FiPlus className="mr-2 h-4 w-4" /> Tambah Tenant
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Tenant', value: tenants.length, color: 'text-gray-900', icon: FiUser, bg: 'bg-red-100', ic: 'text-red-600' },
          { label: 'Tenant Aktif', value: tenants.filter(t => t.status === 'active').length, color: 'text-green-600', icon: FiShoppingBag, bg: 'bg-green-100', ic: 'text-green-600' },
          { label: 'Tenant Nonaktif', value: tenants.filter(t => t.status !== 'active').length, color: 'text-red-600', icon: FiBarChart2, bg: 'bg-red-100', ic: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            </div>
            <div className={`p-3 rounded-full ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.ic}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input type="text" placeholder="Cari nama, username, email, atau toko..."
            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
        </div>
      </div>

      {/* Notification toast */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
            className={`fixed top-4 right-4 z-[9999] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Tenant', 'Nama Lengkap', 'Toko / NIM', 'Kontak', 'Bergabung', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">Tidak ada tenant ditemukan</td></tr>
              ) : paginated.map((tenant, i) => (
                <motion.tr key={tenant.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{tenant.username?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{tenant.username}</p>
                        <p className="text-xs text-gray-500 truncate">{tenant.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{tenant.full_name || '-'}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900">{tenant.business_name || '-'}</p>
                    {tenant.nim && <p className="text-xs text-gray-500 mt-0.5">NIM: {tenant.nim}</p>}
                    {tenant.student_card_image && (
                      <span className="text-xs text-green-600 font-medium">✅ KTM Tersedia</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{tenant.phone || '-'}</td>
                  <td className="px-5 py-4 text-xs text-gray-500">
                    {new Date(tenant.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleStatus(tenant)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                        tenant.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}>
                      {tenant.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => handleViewDetail(tenant)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat Detail">
                        <FiInfo className="h-4 w-4" />
                      </button>
                      <button onClick={() => window.open(`/store/${tenant.id}`, '_blank')}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Lihat Toko">
                        <FiShoppingBag className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleEdit(tenant)}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Edit Tenant">
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(tenant.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Tenant">
                        <FiTrash2 className="h-4 w-4" />
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
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      </div>

      {/* ===================== DETAIL MODAL ===================== */}
      <AnimatePresence>
        {showDetail && selectedTenant && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white rounded-t-2xl px-6 pt-5 pb-4 border-b flex items-center justify-between z-10">
                <h3 className="text-lg font-bold text-gray-900">Detail Tenant</h3>
                <button onClick={() => setShowDetail(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiX className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Avatar + basic */}
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-2xl">{selectedTenant.username?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{selectedTenant.full_name || selectedTenant.username}</p>
                    <p className="text-sm text-gray-500">@{selectedTenant.username}</p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${
                      selectedTenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{selectedTenant.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                  </div>
                </div>

                {/* Info Akun */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Informasi Akun</p>
                  {[
                    { label: 'Email', value: selectedTenant.email },
                    { label: 'No. HP', value: selectedTenant.phone || '-' },
                    { label: 'Alamat', value: selectedTenant.address || '-' },
                    { label: 'Bergabung', value: new Date(selectedTenant.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  ].map(row => (
                    <div key={row.label} className="flex gap-2">
                      <span className="text-xs text-gray-500 w-24 flex-shrink-0 pt-0.5">{row.label}</span>
                      <span className="text-sm text-gray-900 flex-1 break-words">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Info Toko */}
                <div className="bg-red-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3">🏪 Informasi Toko</p>
                  {[
                    { label: 'Nama Toko', value: selectedTenant.business_name || '-' },
                    { label: 'NIM', value: selectedTenant.nim || '-' },
                  ].map(row => (
                    <div key={row.label} className="flex gap-2">
                      <span className="text-xs text-gray-500 w-24 flex-shrink-0 pt-0.5">{row.label}</span>
                      <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* KTM */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">🪪 Kartu Tanda Mahasiswa (KTM)</p>
                  {selectedTenant.student_card_image ? (
                    <div className="border-2 border-green-200 rounded-xl overflow-hidden">
                      <img
                        src={getImageUrl(selectedTenant.student_card_image)}
                        alt="KTM"
                        className="w-full object-contain max-h-64 bg-gray-50"
                        onError={e => { e.target.src = '/images/placeholder.svg'; }}
                      />
                      <div className="bg-green-50 px-4 py-2 flex items-center justify-between">
                        <span className="text-xs text-green-700 font-medium">✅ KTM Telah Diupload</span>
                        <a href={getImageUrl(selectedTenant.student_card_image)} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline">Buka gambar →</a>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                      <p className="text-sm text-gray-400">❌ KTM belum diupload</p>
                      <p className="text-xs text-gray-300 mt-1">Tenant belum melengkapi data KTM</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setShowDetail(false); handleEdit(selectedTenant); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium">
                    <FiEdit className="h-4 w-4" /> Edit Tenant
                  </button>
                  <button onClick={() => setShowDetail(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================== EDIT/ADD MODAL ===================== */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && resetForm()}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white rounded-t-2xl px-6 pt-5 pb-4 border-b flex items-center justify-between z-10">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingTenant ? 'Edit Tenant' : 'Tambah Tenant Baru'}
                </h3>
                <button onClick={resetForm} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiX className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.username} required
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <input type="email" value={formData.email} required
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Password {!editingTenant && <span className="text-red-500">*</span>}
                    {editingTenant && <span className="text-gray-400 font-normal ml-1">(kosongkan jika tidak ingin mengubah)</span>}
                  </label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={formData.password}
                      required={!editingTenant}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingTenant ? 'Password baru (opsional)' : 'Password'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Toko</label>
                  <input type="text" value={formData.business_name}
                    onChange={e => setFormData({ ...formData, business_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">No. HP</label>
                    <input type="text" value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent">
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Alamat</label>
                  <textarea value={formData.address} rows={2}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={resetForm}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">
                    Batal
                  </button>
                  <button type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium">
                    <FiSave className="h-4 w-4" />
                    {editingTenant ? 'Perbarui' : 'Simpan'} Tenant
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TenantManager;
