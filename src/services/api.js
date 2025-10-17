const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';

const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const api = {
  // Products
  async getProducts() {
    return fetchWithTimeout(`${API_BASE_URL}/products`);
  },

  async getProductById(id) {
    return fetchWithTimeout(`${API_BASE_URL}/products/${id}`);
  },

  async getProductsByCategory(categoryId) {
    return fetchWithTimeout(`${API_BASE_URL}/products/category/${categoryId}`);
  },

  async createProduct(productData) {
    return fetchWithTimeout(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
  },

  async updateProduct(id, productData) {
    return fetchWithTimeout(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
  },

  async deleteProduct(id) {
    return fetchWithTimeout(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE'
    });
  },

  // Categories
  async getCategories() {
    return fetchWithTimeout(`${API_BASE_URL}/categories`);
  },

  async getCategoryById(id) {
    return fetchWithTimeout(`${API_BASE_URL}/categories/${id}`);
  },

  async createCategory(categoryData) {
    return fetchWithTimeout(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
  },

  async updateCategory(id, categoryData) {
    return fetchWithTimeout(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
  },

  async deleteCategory(id) {
    return fetchWithTimeout(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE'
    });
  },

  // Carousel
  async getCarousel() {
    return fetchWithTimeout(`${API_BASE_URL}/carousel`);
  },

  async getCarouselById(id) {
    return fetchWithTimeout(`${API_BASE_URL}/carousel/${id}`);
  },

  async createCarousel(carouselData) {
    return fetchWithTimeout(`${API_BASE_URL}/carousel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carouselData)
    });
  },

  async updateCarousel(id, carouselData) {
    return fetchWithTimeout(`${API_BASE_URL}/carousel/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carouselData)
    });
  },

  async deleteCarousel(id) {
    return fetchWithTimeout(`${API_BASE_URL}/carousel/${id}`, {
      method: 'DELETE'
    });
  },

  // File Upload
  async uploadFile(file, type = 'products') {
    console.log('API uploadFile called with:', file.name, type);
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}/upload/single?type=${type}`, {
        method: 'POST',
        body: formData
      });
      
      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Upload success:', result);
      return result;
    } catch (error) {
      console.error('Upload API error:', error);
      throw error;
    }
  },

  async uploadMultipleFiles(files, type = 'general') {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    formData.append('type', type);
    
    const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    
    return response.json();
  },

  // Contacts
  async getContacts() {
    return fetchWithTimeout(`${API_BASE_URL}/contacts`);
  },

  async createContact(contactData) {
    return fetchWithTimeout(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    });
  },

  async updateContactStatus(id, status) {
    return fetchWithTimeout(`${API_BASE_URL}/contacts/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  },

  async deleteContact(id) {
    return fetchWithTimeout(`${API_BASE_URL}/contacts/${id}`, {
      method: 'DELETE'
    });
  },

  // Analytics
  async getAnalyticsOverview() {
    return fetchWithTimeout(`${API_BASE_URL}/analytics/overview`);
  },

  async getProductAnalytics() {
    return fetchWithTimeout(`${API_BASE_URL}/analytics/products`);
  },

  async getContactAnalytics() {
    return fetchWithTimeout(`${API_BASE_URL}/analytics/contacts`);
  },

  // Comments
  async getCommentsByProductId(productId) {
    return fetchWithTimeout(`${API_BASE_URL}/comments/product/${productId}`);
  },

  async createComment(commentData) {
    return fetchWithTimeout(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData)
    });
  },

  async deleteComment(id) {
    return fetchWithTimeout(`${API_BASE_URL}/comments/${id}`, {
      method: 'DELETE'
    });
  }
};

// Individual exports for easier imports
export const getProducts = api.getProducts;
export const getProductById = api.getProductById;
export const getProductsByCategory = api.getProductsByCategory;
export const createProduct = api.createProduct;
export const updateProduct = api.updateProduct;
export const deleteProduct = api.deleteProduct;

export const getCategories = api.getCategories;
export const getCategoryById = api.getCategoryById;
export const createCategory = api.createCategory;
export const updateCategory = api.updateCategory;
export const deleteCategory = api.deleteCategory;

export const getCarousel = api.getCarousel;
export const getCarouselById = api.getCarouselById;
export const createCarousel = api.createCarousel;
export const updateCarousel = api.updateCarousel;
export const deleteCarousel = api.deleteCarousel;

export const uploadFile = api.uploadFile;
export const uploadMultipleFiles = api.uploadMultipleFiles;

export const getContacts = api.getContacts;
export const createContact = api.createContact;
export const updateContactStatus = api.updateContactStatus;
export const deleteContact = api.deleteContact;

export const getAnalyticsOverview = api.getAnalyticsOverview;
export const getProductAnalytics = api.getProductAnalytics;
export const getContactAnalytics = api.getContactAnalytics;

export const getCommentsByProductId = api.getCommentsByProductId;
export const createComment = api.createComment;
export const deleteComment = api.deleteComment;