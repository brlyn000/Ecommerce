export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5006/api',
  SERVER_URL: import.meta.env.VITE_SERVER_URL || 'http://localhost:5006'
};

export const API_BASE_URL = API_CONFIG.BASE_URL;

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/images/placeholder.svg';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.SERVER_URL}${imagePath}`;
};

export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};