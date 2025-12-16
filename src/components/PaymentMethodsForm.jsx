import { useState, useEffect } from 'react';
import { FiSave, FiCheck, FiX, FiUpload } from 'react-icons/fi';
import { getImageUrl, getApiUrl } from '../config/api';

const PaymentMethodsForm = () => {
  const [paymentMethods, setPaymentMethods] = useState({
    dana: { enabled: false, number: '' },
    ovo: { enabled: false, number: '' },
    shopeepay: { enabled: false, number: '' },
    bca: { enabled: false, number: '', name: '' },
    bri: { enabled: false, number: '', name: '' },
    mandiri: { enabled: false, number: '', name: '' },
    qris: { enabled: false, image: '' }
  });
  const [contactInfo, setContactInfo] = useState({
    whatsapp: '',
    instagram: ''
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('success');
  const [modalMessage, setModalMessage] = useState('');
  const [showQrisModal, setShowQrisModal] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(getApiUrl('/users/profile'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.payment_methods) {
          setPaymentMethods(data.payment_methods);
        }
        if (data.contact_info) {
          setContactInfo(data.contact_info);
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(getApiUrl('/users/payment-methods'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ payment_methods: paymentMethods })
      });

      if (response.ok) {
        setModalType('success');
        setModalMessage('Metode pembayaran berhasil diperbarui!');
      } else {
        setModalType('error');
        setModalMessage('Gagal memperbarui metode pembayaran.');
      }
    } catch (error) {
      setModalType('error');
      setModalMessage('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
      setShowModal(true);
    }
  };

  const updatePaymentMethod = (type, field, value) => {
    setPaymentMethods(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!contactInfo.whatsapp.trim() && !contactInfo.instagram.trim()) {
      setModalType('error');
      setModalMessage('Please provide either WhatsApp number or Instagram username for customer contact.');
      setShowModal(true);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(getApiUrl('/users/contact-info'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ contact_info: contactInfo })
      });
      
      if (response.ok) {
        setModalType('success');
        setModalMessage('Contact information updated successfully!');
      } else {
        setModalType('error');
        setModalMessage('Failed to update contact information.');
      }
    } catch (error) {
      setModalType('error');
      setModalMessage('Network error occurred.');
    } finally {
      setLoading(false);
      setShowModal(true);
    }
  };

  const handleQrisImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setModalType('error');
      setModalMessage('Ukuran file terlalu besar. Maksimal 5MB.');
      setShowModal(true);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setModalType('error');
      setModalMessage('File harus berupa gambar.');
      setShowModal(true);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('qrisImage', file);

    try {
      const response = await fetch(getApiUrl('/upload/qris'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        updatePaymentMethod('qris', 'image', data.imageUrl);
        setModalType('success');
        setModalMessage('Gambar QRIS berhasil diupload!');
      } else {
        const errorData = await response.json();
        setModalType('error');
        setModalMessage(errorData.error || 'Gagal mengupload gambar.');
      }
    } catch (error) {
      setModalType('error');
      setModalMessage('Terjadi kesalahan saat mengupload gambar.');
    } finally {
      setLoading(false);
      setShowModal(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods Form */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-red-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Metode Pembayaran</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* E-Wallet */}
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-4">E-Wallet</h4>
            <div className="space-y-4">
              {['dana', 'ovo', 'shopeepay'].map((method) => (
                <div key={method} className="border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center space-x-3 mb-3">
                    <input
                      type="checkbox"
                      checked={paymentMethods[method].enabled}
                      onChange={(e) => updatePaymentMethod(method, 'enabled', e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="font-medium text-gray-700 capitalize">{method}</span>
                  </label>
                  {paymentMethods[method].enabled && (
                    <input
                      type="tel"
                      placeholder={`Nomor ${method.toUpperCase()}`}
                      value={paymentMethods[method].number}
                      onChange={(e) => updatePaymentMethod(method, 'number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required={paymentMethods[method].enabled}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bank Transfer */}
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Bank Transfer</h4>
            <div className="space-y-4">
              {['bca', 'bri', 'mandiri'].map((bank) => (
                <div key={bank} className="border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center space-x-3 mb-3">
                    <input
                      type="checkbox"
                      checked={paymentMethods[bank].enabled}
                      onChange={(e) => updatePaymentMethod(bank, 'enabled', e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="font-medium text-gray-700">{bank.toUpperCase()}</span>
                  </label>
                  {paymentMethods[bank].enabled && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Nomor Rekening"
                        value={paymentMethods[bank].number}
                        onChange={(e) => updatePaymentMethod(bank, 'number', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required={paymentMethods[bank].enabled}
                      />
                      <input
                        type="text"
                        placeholder="Nama Pemilik Rekening"
                        value={paymentMethods[bank].name}
                        onChange={(e) => updatePaymentMethod(bank, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required={paymentMethods[bank].enabled}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* QRIS */}
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-4">QRIS</h4>
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  checked={paymentMethods.qris.enabled}
                  onChange={(e) => updatePaymentMethod('qris', 'enabled', e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <span className="font-medium text-gray-700">QRIS</span>
              </label>
              {paymentMethods.qris.enabled && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrisImageUpload}
                      className="hidden"
                      id="qris-upload"
                    />
                    <label
                      htmlFor="qris-upload"
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
                    >
                      <FiUpload className="mr-2" />
                      Upload Gambar QRIS
                    </label>
                  </div>
                  
                  {paymentMethods.qris.image && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Preview QRIS:</p>
                      <div className="relative inline-block">
                        <img
                          src={getImageUrl(paymentMethods.qris.image)}
                          alt="QRIS Preview"
                          className="w-48 h-48 object-contain border border-gray-300 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setShowQrisModal(true)}
                        />
                        <button
                          type="button"
                          onClick={() => updatePaymentMethod('qris', 'image', '')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Klik untuk memperbesar</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-50"
          >
            <FiSave className="mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan Metode Pembayaran'}
          </button>
        </form>
      </div>
      
      {/* Contact Information Form */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-red-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Contact Information *</h3>
        <p className="text-sm text-gray-600 mb-4">Provide at least one contact method for customers to reach you</p>
        
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
            <input
              type="tel"
              placeholder="e.g., 6281234567890 (without +)"
              value={contactInfo.whatsapp}
              onChange={(e) => setContactInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">Enter number with country code (e.g., 6281234567890)</p>
          </div>
          
          <div className="text-center text-gray-500 text-sm font-medium">OR</div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Username</label>
            <input
              type="text"
              placeholder="e.g., your_store_name"
              value={contactInfo.instagram}
              onChange={(e) => setContactInfo(prev => ({ ...prev, instagram: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">Enter username without @ symbol</p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-50"
          >
            <FiSave className="mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan Contact Info'}
          </button>
        </form>
      </div>

      {/* Status Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-full mr-3 ${
                modalType === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {modalType === 'success' ? (
                  <FiCheck className="h-6 w-6 text-green-600" />
                ) : (
                  <FiX className="h-6 w-6 text-red-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {modalType === 'success' ? 'Berhasil!' : 'Gagal!'}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">{modalMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                modalType === 'success' 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              OK
            </button>
          </div>
        </div>
      )}
      
      {/* QRIS Preview Modal */}
      {showQrisModal && paymentMethods.qris.image && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-2xl max-h-full">
            <button
              onClick={() => setShowQrisModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <FiX className="w-8 h-8" />
            </button>
            <img
              src={getImageUrl(paymentMethods.qris.image)}
              alt="QRIS Preview - Klik untuk menutup"
              className="max-w-full max-h-full object-contain rounded-lg cursor-pointer"
              onClick={() => setShowQrisModal(false)}
            />
            <p className="text-white text-center mt-2 text-sm">Klik gambar untuk menutup</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsForm;