import { getValidToken } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5006/api';

const authHeader = () => {
  const token = getValidToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const requireAuth = () => {
  const token = getValidToken();
  if (!token) throw new Error('Authentication required');
  return token;
};

const fetchWithTimeout = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const error = new Error();
      error.response = { status: response.status, statusText: response.statusText };
      switch (response.status) {
        case 401: error.message = 'Authentication required'; break;
        case 403: error.message = 'Access forbidden'; break;
        case 404: error.message = 'Resource not found'; break;
        case 500: error.message = 'Internal server error'; break;
        default:  error.message = `Request failed with status ${response.status}`;
      }
      throw error;
    }
    return response.json();
  } catch (error) {
    if (!error.response) {
      error.response = { status: 500, statusText: 'Network Error' };
      error.message = 'Network connection failed';
    }
    throw error;
  }
};

export const api = {
  // Products
  getProducts: () => fetchWithTimeout(`${API_BASE_URL}/products`),
  searchProducts: (q) => fetchWithTimeout(`${API_BASE_URL}/products/search?q=${encodeURIComponent(q)}`),
  getProductById: (id) => fetchWithTimeout(`${API_BASE_URL}/products/${id}`),
  getProductsByCategory: (categoryId) => fetchWithTimeout(`${API_BASE_URL}/products/category/${categoryId}`),

  createProduct: (productData) => {
    requireAuth();
    return fetchWithTimeout(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(productData),
    });
  },

  updateProduct: (id, productData) => {
    requireAuth();
    return fetchWithTimeout(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(productData),
    });
  },

  deleteProduct: (id) => {
    requireAuth();
    return fetchWithTimeout(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    });
  },

  getUserProducts: () => {
    requireAuth();
    return fetchWithTimeout(`${API_BASE_URL}/products/user/my-products`, { headers: authHeader() });
  },

  // Categories
  getCategories: () => fetchWithTimeout(`${API_BASE_URL}/categories`),
  getCategoryById: (id) => fetchWithTimeout(`${API_BASE_URL}/categories/${id}`),

  createCategory: (data) => fetchWithTimeout(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  updateCategory: (id, data) => fetchWithTimeout(`${API_BASE_URL}/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  deleteCategory: (id) => fetchWithTimeout(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' }),

  // Carousel
  getCarousel: () => fetchWithTimeout(`${API_BASE_URL}/carousel`),
  getCarouselById: (id) => fetchWithTimeout(`${API_BASE_URL}/carousel/${id}`),

  createCarousel: (data) => fetchWithTimeout(`${API_BASE_URL}/carousel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  updateCarousel: (id, data) => fetchWithTimeout(`${API_BASE_URL}/carousel/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  deleteCarousel: (id) => fetchWithTimeout(`${API_BASE_URL}/carousel/${id}`, { method: 'DELETE' }),

  // File Upload
  uploadFile: async (file, type = 'products') => {
    requireAuth();
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${API_BASE_URL}/upload/single?type=${type}`, {
      method: 'POST',
      headers: authHeader(),
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }
    return response.json();
  },

  uploadMultipleFiles: async (files, type = 'general') => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    formData.append('type', type);
    const response = await fetch(`${API_BASE_URL}/upload/multiple`, { method: 'POST', body: formData });
    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
    return response.json();
  },

  // Contacts
  getContacts: () => fetchWithTimeout(`${API_BASE_URL}/contacts`),

  createContact: (data) => fetchWithTimeout(`${API_BASE_URL}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  updateContactStatus: (id, status) => fetchWithTimeout(`${API_BASE_URL}/contacts/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }),

  deleteContact: (id) => fetchWithTimeout(`${API_BASE_URL}/contacts/${id}`, { method: 'DELETE' }),

  // Analytics
  getAnalyticsOverview: () => fetchWithTimeout(`${API_BASE_URL}/analytics/overview`),
  getProductAnalytics: () => fetchWithTimeout(`${API_BASE_URL}/analytics/products`),
  getContactAnalytics: () => fetchWithTimeout(`${API_BASE_URL}/analytics/contacts`),

  // Comments
  getCommentsByProductId: (productId) => fetchWithTimeout(`${API_BASE_URL}/comments/product/${productId}`),

  createComment: (data) => fetchWithTimeout(`${API_BASE_URL}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  updateComment: (id, data) => {
    requireAuth();
    return fetchWithTimeout(`${API_BASE_URL}/comments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(data),
    });
  },

  deleteComment: (id) => {
    requireAuth();
    return fetchWithTimeout(`${API_BASE_URL}/comments/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    });
  },

  // Likes
  toggleLike: (productId) => {
    requireAuth();
    return fetchWithTimeout(`${API_BASE_URL}/likes/products/${productId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
    });
  },

  // Like status is public — send token only if available (no throw)
  getLikeStatus: (productId) => fetchWithTimeout(`${API_BASE_URL}/likes/products/${productId}/status`, {
    headers: authHeader(),
  }),

  // Notifications
  createNotification: (data) => {
    requireAuth();
    return fetchWithTimeout(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(data),
    });
  },

  getTenantNotifications: async (type = null) => {
    requireAuth();
    const url = type ? `${API_BASE_URL}/notifications/tenant?type=${type}` : `${API_BASE_URL}/notifications/tenant`;
    try {
      const response = await fetchWithTimeout(url, { headers: authHeader() });
      return response.notifications || [];
    } catch {
      return [];
    }
  },

  markAllNotificationsAsRead: (type = null) => {
    requireAuth();
    return fetchWithTimeout(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ type }),
    });
  },

  markNotificationAsRead: (notificationId) => {
    requireAuth();
    return fetchWithTimeout(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: authHeader(),
    });
  },

  // Tenant Analytics
  getTenantProductAnalytics: () => {
    requireAuth();
    return fetchWithTimeout(`${API_BASE_URL}/tenant-analytics/products`, { headers: authHeader() });
  },

  getTenantOverviewStats: () => {
    requireAuth();
    return fetchWithTimeout(`${API_BASE_URL}/tenant-analytics/overview`, { headers: authHeader() });
  },

  getTenantChartData: (year, month) => {
    requireAuth();
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month && month !== 'all') params.append('month', month);
    return fetchWithTimeout(`${API_BASE_URL}/tenant-analytics/charts?${params}`, { headers: authHeader() });
  },

  // Orders
  getTenantOrders: () => {
    requireAuth();
    return fetchWithTimeout(`${API_BASE_URL}/orders/tenant`, { headers: authHeader() });
  },

  updateOrderStatus: (orderId, status, rejectionReason = null) => {
    requireAuth();
    return fetchWithTimeout(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ status, rejection_reason: rejectionReason }),
    });
  },

  getUserOrders: () => {
    requireAuth();
    return fetchWithTimeout(`${API_BASE_URL}/orders/user`, { headers: authHeader() });
  },

  confirmOrderReceived: (orderId, status) => {
    requireAuth();
    return fetchWithTimeout(`${API_BASE_URL}/orders/${orderId}/received`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ received_status: status }),
    });
  },
};

// Individual exports
export const { getProducts, getProductById, getProductsByCategory, createProduct, updateProduct,
  deleteProduct, getUserProducts, getCategories, getCategoryById, createCategory, updateCategory,
  deleteCategory, getCarousel, getCarouselById, createCarousel, updateCarousel, deleteCarousel,
  uploadFile, uploadMultipleFiles, getContacts, createContact, updateContactStatus, deleteContact,
  getAnalyticsOverview, getProductAnalytics, getContactAnalytics, getCommentsByProductId,
  createComment, deleteComment, toggleLike, getLikeStatus } = api;
