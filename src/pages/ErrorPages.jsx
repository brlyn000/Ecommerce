import { FiHome, FiRefreshCw, FiLock, FiAlertTriangle, FiServer } from 'react-icons/fi';

const ErrorPage = ({ code, title, message, showRetry = false }) => {

  const getIcon = () => {
    switch (code) {
      case 401: return <FiLock className="w-16 h-16 text-red-500" />;
      case 403: return <FiLock className="w-16 h-16 text-orange-500" />;
      case 404: return <FiAlertTriangle className="w-16 h-16 text-yellow-500" />;
      case 500: return <FiServer className="w-16 h-16 text-red-600" />;
      default: return <FiAlertTriangle className="w-16 h-16 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-red-100">
          <div className="flex justify-center mb-6">
            {getIcon()}
          </div>
          
          <h1 className="text-6xl font-bold text-gray-800 mb-4">{code}</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">{title}</h2>
          <p className="text-gray-600 mb-8">{message}</p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <FiHome className="mr-2" />
              Kembali ke Beranda
            </button>
            
            {showRetry && (
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                <FiRefreshCw className="mr-2" />
                Coba Lagi
              </button>
            )}
            
            <button
              onClick={() => window.history.back()}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotFound = () => (
  <ErrorPage
    code={404}
    title="Halaman Tidak Ditemukan"
    message="Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan atau dihapus."
  />
);

export const Unauthorized = () => (
  <ErrorPage
    code={401}
    title="Akses Ditolak"
    message="Anda perlu login terlebih dahulu untuk mengakses halaman ini."
  />
);

export const Forbidden = () => (
  <ErrorPage
    code={403}
    title="Akses Dilarang"
    message="Anda tidak memiliki izin untuk mengakses halaman ini."
  />
);

export const ServerError = () => (
  <ErrorPage
    code={500}
    title="Server Error"
    message="Terjadi kesalahan pada server. Silakan coba lagi nanti."
    showRetry={true}
  />
);

export const BadRequest = () => (
  <ErrorPage
    code={400}
    title="Permintaan Tidak Valid"
    message="Permintaan yang Anda kirim tidak dapat diproses."
  />
);

export default ErrorPage;