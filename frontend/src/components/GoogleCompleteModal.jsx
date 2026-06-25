import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiHome, FiX, FiMapPin, FiMail, FiHash } from 'react-icons/fi';
import { API_BASE_URL as API } from '../config/api';

export default function GoogleCompleteModal({ googleData, onSuccess, onClose }) {
  const [role, setRole] = useState('user');
  const [form, setForm] = useState({
    username: '',
    phone: '',
    address: '',
    store_name: '',
    nim: '',
    student_card_image: '',
  });
  const [ktmPreview, setKtmPreview] = useState('');
  const [ktmUploading, setKtmUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleKtmChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setKtmPreview(URL.createObjectURL(file));
    setKtmUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('ktm', file);
      const res = await fetch(`${API}/upload/ktm`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.imageUrl) set('student_card_image', data.imageUrl);
      else throw new Error();
    } catch {
      setError('Gagal upload KTM, coba lagi');
      setKtmPreview('');
    } finally {
      setKtmUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username.trim()) return setError('Username wajib diisi');
    if (!form.phone.trim()) return setError('No. HP wajib diisi');
    if (role === 'tenant') {
      if (!form.store_name.trim()) return setError('Nama toko wajib diisi');
      if (!form.nim.trim()) return setError('NIM wajib diisi');
      if (!form.student_card_image) return setError('KTM wajib diupload');
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/google/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google_id: googleData.google_id,
          email: googleData.email,
          full_name: googleData.full_name || googleData.name,
          username: form.username.trim(),
          phone: form.phone.trim(),
          role,
          address: form.address.trim() || undefined,
          store_name: role === 'tenant' ? form.store_name.trim() : undefined,
          nim: role === 'tenant' ? form.nim.trim() : undefined,
          student_card_image: role === 'tenant' ? form.student_card_image : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) onSuccess(data);
      else setError(data.message || 'Gagal mendaftar');
    } catch {
      setError('Tidak dapat terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  const isTenant = role === 'tenant';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl z-10 px-6 pt-6 pb-4 border-b">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <FiX className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            {googleData.picture && (
              <img src={googleData.picture} alt="" className="w-12 h-12 rounded-full border-2 border-red-100" />
            )}
            <div>
              <p className="font-semibold text-gray-900">{googleData.full_name || googleData.name}</p>
              <div className="flex items-center text-sm text-gray-500 gap-1">
                <FiMail className="w-3 h-3" />
                <span>{googleData.email}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-bold text-gray-900">Lengkapi Data Akun</h3>
            <p className="text-sm text-gray-500">Akun baru — isi data berikut untuk menyelesaikan pendaftaran.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Role Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Daftar sebagai</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'user', label: '👤 User / Pembeli', desc: 'Belanja produk' },
                { value: 'tenant', label: '🏪 Tenant / Penjual', desc: 'Jual produk' },
              ].map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => { setRole(r.value); setError(''); }}
                  className={`p-3 rounded-xl text-left border-2 transition-all ${
                    role === r.value
                      ? r.value === 'tenant'
                        ? 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className={`text-sm font-semibold ${role === r.value ? (r.value === 'tenant' ? 'text-red-700' : 'text-blue-700') : 'text-gray-700'}`}>
                    {r.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* === FIELD WAJIB USER & TENANT === */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Informasi Akun</p>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={form.username}
                  onChange={e => set('username', e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  placeholder="Buat username unik"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. HP <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat <span className="text-gray-400 text-xs">(opsional)</span>
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
                  placeholder="Alamat lengkap"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* === FIELD KHUSUS TENANT === */}
          {isTenant && (
            <>
              <div className="border-t border-gray-100" />
              <div className="space-y-4">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">
                  📋 Data Tenant (Wajib)
                </p>

                {/* Store Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Toko <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiHome className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={form.store_name}
                      onChange={e => set('store_name', e.target.value)}
                      className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      placeholder="Nama toko kamu"
                    />
                  </div>
                </div>

                {/* NIM */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIM <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={form.nim}
                      onChange={e => set('nim', e.target.value)}
                      className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      placeholder="Nomor Induk Mahasiswa"
                    />
                  </div>
                </div>

                {/* KTM Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kartu Tanda Mahasiswa (KTM) <span className="text-red-500">*</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                    form.student_card_image ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-red-400'
                  }`}>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleKtmChange}
                      className="hidden"
                      id="ktm-upload-modal"
                    />
                    {ktmPreview ? (
                      <div>
                        <img src={ktmPreview} alt="KTM Preview" className="w-full max-h-44 object-contain rounded-lg mb-2" />
                        <label htmlFor="ktm-upload-modal" className={`text-xs cursor-pointer hover:underline ${ktmUploading ? 'text-gray-400' : 'text-red-600'}`}>
                          {ktmUploading ? '⏳ Mengupload...' : '🔄 Ganti foto KTM'}
                        </label>
                        {form.student_card_image && !ktmUploading && (
                          <p className="text-xs text-green-600 mt-1">✅ KTM berhasil diupload</p>
                        )}
                      </div>
                    ) : (
                      <label htmlFor="ktm-upload-modal" className="cursor-pointer block">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600 font-medium">Klik untuk upload foto KTM</span>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — maks 10MB</p>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <span className="text-red-500 mt-0.5">⚠</span>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || ktmUploading}
            className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
          >
            {loading ? 'Mendaftarkan...' : 'Selesaikan Pendaftaran'}
          </button>

          <p className="text-xs text-center text-gray-400">
            Dengan mendaftar, kamu menyetujui syarat dan ketentuan EkrafMarket
          </p>
        </form>
      </motion.div>
    </div>
  );
}
