import { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import { getApiUrl, getImageUrl } from '../config/api';

const PaymentMethodsDropdown = ({ product }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [qrisImageUrl, setQrisImageUrl] = useState('');

  useEffect(() => {
    fetchTenantPaymentMethods();
  }, [product]);

  const fetchTenantPaymentMethods = async () => {
    if (!product?.created_by) return;
    
    try {
      const response = await fetch(getApiUrl(`/users/${product.created_by}/payment-methods`));
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.payment_methods);
      }
    } catch (error) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethod = (type, method, config) => {
    if (!method.enabled) return null;

    const colors = {
      dana: 'bg-red-50 border-red-200',
      ovo: 'bg-red-50 border-red-200', 
      shopeepay: 'bg-orange-50 border-orange-200',
      bca: 'bg-red-50 border-red-200',
      bri: 'bg-red-50 border-red-200',
      mandiri: 'bg-yellow-50 border-yellow-200',
      qris: 'bg-gray-50 border-gray-200'
    };

    const iconColors = {
      dana: 'bg-red-500',
      ovo: 'bg-red-500',
      shopeepay: 'bg-orange-500', 
      bca: 'bg-red-600',
      bri: 'bg-red-600',
      mandiri: 'bg-yellow-600',
      qris: 'bg-gray-600'
    };

    return (
      <div key={type} className={`flex items-center p-3 rounded-lg border ${colors[type]}`}>
        <div className={`w-10 h-10 ${iconColors[type]} rounded-lg flex items-center justify-center mr-3`}>
          <span className="text-white font-bold text-xs">
            {type === 'shopeepay' ? 'SPay' : type.toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{config.name}</p>
          {type === 'qris' ? (
            method.image && (
              <div className="mt-2">
                <img 
                  src={getImageUrl(method.image)} 
                  alt="QRIS" 
                  className="w-32 h-32 object-contain border border-gray-300 rounded-lg cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={() => {
                    setQrisImageUrl(getImageUrl(method.image));
                    setShowQrisModal(true);
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">Klik untuk memperbesar</p>
              </div>
            )
          ) : (
            <>
              <p className="text-xs text-gray-600">{method.number}</p>
              {method.name && (
                <p className="text-xs text-gray-500">a.n. {method.name}</p>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const methodConfigs = {
    dana: { name: 'DANA' },
    ovo: { name: 'OVO' },
    shopeepay: { name: 'ShopeePay' },
    bca: { name: 'Bank BCA' },
    bri: { name: 'Bank BRI' },
    mandiri: { name: 'Bank Mandiri' },
    qris: { name: 'QRIS' }
  };

  const hasEnabledMethods = paymentMethods && Object.values(paymentMethods).some(method => method.enabled);

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hasEnabledMethods) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-6">
        <h3 className="font-medium text-sm text-red-600 mb-4">Payment Methods</h3>
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">Metode pembayaran belum tersedia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border-b border-gray-200 py-4 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="text-left">
          <h3 className="font-bold text-lg text-red-600">💳 Payment Methods</h3>
          <p className="text-xs text-gray-500 mt-1">
            {Object.values(paymentMethods || {}).filter(m => m.enabled).length} methods available
          </p>
        </div>
        {isOpen ? (
          <FiChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <FiChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-6 space-y-6">
          {/* E-Wallet */}
          {(paymentMethods.dana?.enabled || paymentMethods.ovo?.enabled || paymentMethods.shopeepay?.enabled) && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">E-Wallet</h4>
              <div className="space-y-3">
                {Object.entries(paymentMethods)
                  .filter(([type]) => ['dana', 'ovo', 'shopeepay'].includes(type))
                  .map(([type, method]) => renderPaymentMethod(type, method, methodConfigs[type]))}
              </div>
            </div>
          )}
          
          {/* Bank Transfer */}
          {(paymentMethods.bca?.enabled || paymentMethods.bri?.enabled || paymentMethods.mandiri?.enabled) && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Bank Transfer</h4>
              <div className="space-y-3">
                {Object.entries(paymentMethods)
                  .filter(([type]) => ['bca', 'bri', 'mandiri'].includes(type))
                  .map(([type, method]) => renderPaymentMethod(type, method, methodConfigs[type]))}
              </div>
            </div>
          )}
          
          {/* QRIS */}
          {paymentMethods.qris?.enabled && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">QRIS</h4>
              {renderPaymentMethod('qris', paymentMethods.qris, methodConfigs.qris)}
            </div>
          )}
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-700">
              💡 Setelah transfer, kirim bukti pembayaran via WhatsApp untuk konfirmasi pesanan.
            </p>
          </div>
        </div>
      )}
      
      {/* QRIS Modal */}
      {showQrisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-2xl max-h-full">
            <button
              onClick={() => setShowQrisModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <FiX className="w-8 h-8" />
            </button>
            <img
              src={qrisImageUrl}
              alt="QRIS - Klik untuk menutup"
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

export default PaymentMethodsDropdown;