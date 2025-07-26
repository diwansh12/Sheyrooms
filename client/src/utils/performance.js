// utils/performance.js - Performance Utilities
import { lazy } from 'react';

// Lazy loading components
export const LazyHomeScreen = lazy(() =>
  import('../Screens/Homescreen').then(module => ({ default: module.default }))
);

export const LazyBookingScreen = lazy(() =>
  import('../Screens/Bookingscreen').then(module => ({ default: module.default }))
);

export const LazyProfileScreen = lazy(() =>
  import('../Screens/Profilescreen').then(module => ({ default: module.default }))
);

export const LazyAdminScreen = lazy(() =>
  import('../Screens/Adminscreen').then(module => ({ default: module.default }))
);

// Image optimization
export const optimizeImageUrl = (url, width = 800, quality = 80) => {
  if (!url) return '/placeholder-image.jpg';

  // If using Cloudinary or similar service
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},q_${quality},f_auto/`);
  }

  // For other CDNs, implement similar logic
  return url;
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Local storage with error handling
export const safeLocalStorage = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return defaultValue;
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }
};
