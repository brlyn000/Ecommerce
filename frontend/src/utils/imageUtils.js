import { API_CONFIG } from '../config/api';

export const addCacheBuster = (imageUrl) => {
  if (!imageUrl) return '';
  
  // If it's already a full URL with cache buster, return as is
  if (imageUrl.includes('?t=')) return imageUrl;
  
  // Add cache buster timestamp
  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}t=${Date.now()}`;
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If it's already a full URL, add cache buster
  if (imagePath.startsWith('http')) {
    return addCacheBuster(imagePath);
  }
  
  // If it's a relative path, construct full URL with cache buster
  const baseUrl = API_CONFIG.SERVER_URL;
  return addCacheBuster(`${baseUrl}${imagePath}`);
};