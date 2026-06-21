import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiHome, FiX, FiMapPin } from 'react-icons/fi';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5006/api';

export default function GoogleCompleteModal({ googleData, onSuccess, onClose }) {
  const [form, setForm] = useState({
    username: '',
    phone: '',
    role: 'user',
    store_name: '',
    nim: '',
    address: '',
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
    try {
      const fd = new FormData();
      fd.append('ktm', file);
      const res = await fetch(`${API}/upload/ktm`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.imageUrl) set('student_card_image', data.imageUrl);
    } catch {
      setError('Gagal upload KTM, coba lagi');
    } finally {
      setKtmUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.role === 'tenant' && !form.student_card_image) {
      setError('KTM wajib diupload untuk tenant');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/google/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google_id: googleData.google_id,
          email: googleData.email,
          full_name: googleData.full_name,
          username: form.username,
          phone: form.phone,
          role: form.role,
          address: form.address || undefined,
          store_name: form.role === 'tenant' ? form.store_name : undefined,
          nim: form.role === 'tenant' ? form.nim : undefined,
          student_card_image: form.role === 'tenant' ? form.student_card_image : undefined,
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <FiX className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6 pb-4 border-b">
          {googleData.picture && (
            <img src={googleData.picture} alt="" className="w-12 h-12 rounded-full" />
          )}
          <div>
            <p className="font-semibold text-gray-900">{googleData.full_name}</p>
            <p className="text-sm text-gray-500">{googleData.email}</p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1">Lengkapi Data Akun</h3>
        <p className="text-sm text-gray-500 mb-5">Isi data berikut untuk menyelesaikan pendaftaran.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3">
            {['user', 'tenant'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => set('role', r)}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  form.role === r
                    ? r === 'tenant' ? 'bg-red-600 text-white' : 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r === 'user' ? 'User / Pembeli' : 'Tenant / Penjual'}
              </button>
            ))}
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                value={form.address}
                onChange={e => set('address', e.target.value)}
                className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
                placeholder="Alamat lengkap (opsional)"
                rows={2}
              />
            </div>
          </div>

          {/* Tenant-only fields */}
          {form.role === 'tenant' && (
            <>
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
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIM <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.nim}
                  onChange={e => set('nim', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  placeholder="Nomor Induk Mahasiswa"
                  required
                />
              </div>

              {/* KTM Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kartu Tanda Mahasiswa (KTM) <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-red-400 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleKtmChange}
                    className="hidden"
                    id="ktm-upload-modal"
                  />
                  {ktmPreview ? (
                    <div>
                      <img src={ktmPreview} alt="KTM Preview" className="w-full max-h-40 object-contain rounded-lg mb-2" />
                      <label htmlFor="ktm-upload-modal" className="text-xs text-red-600 cursor-pointer hover:underline">
                        {ktmUploading ? 'Mengupload...' : 'Ganti foto'}
                      </label>
                    </div>
                  ) : (
                    <label htmlFor="ktm-upload-modal" className="cursor-pointer block">
                      <svg className="mx-auto h-10 w-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-500">Klik untuk upload foto KTM</span>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP maks 10MB</p>
                    </label>
                  )}
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <span className="text-red-500 text-sm">⚠</span>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || ktmUploading}
            className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Mendaftarkan...' : 'Selesaikan Pendaftaran'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
