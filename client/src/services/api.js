// services/api.js - API Service Layer
import axios from 'axios';
import { safeLocalStorage } from '../utils/performance';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = safeLocalStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      safeLocalStorage.removeItem('currentUser');
      safeLocalStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const roomsAPI = {
  getAll: (params = {}) => api.get('/api/rooms/getallrooms', { params }),
  getById: (id) => api.get(`/api/rooms/getroombyid/${id}`),
  search: (searchParams) => api.post('/api/rooms/search', searchParams),
  getFavorites: (roomIds) => api.post('/api/rooms/getfavorites', { roomIds }),
  addReview: (roomId, review) => api.post(`/api/rooms/${roomId}/reviews`, review),
};

export const bookingsAPI = {
  create: (bookingData) => api.post('/api/bookings/bookroom', bookingData),
  getUserBookings: (userId, params = {}) => api.post('/api/bookings/getuserbookings', 
    { userid: userId }, 
    { params }
  ),
  cancel: (bookingId, roomId, reason) => api.post('/api/bookings/cancelBooking', {
    bookingid: bookingId,
    roomid: roomId,
    reason
  }),
  modify: (bookingId, modifications) => api.post('/api/bookings/modifyBooking', {
    bookingid: bookingId,
    ...modifications
  }),
  getAll: (params = {}) => api.get('/api/bookings/getallbookings', { params }),
};

export const usersAPI = {
  login: (credentials) => api.post('/api/users/login', credentials),
  register: (userData) => api.post('/api/users/register', userData),
  verify: () => api.get('/api/users/verify'),
  updateProfile: (userId, updates) => api.put(`/api/users/profile/${userId}`, updates),
  uploadAvatar: (userId, formData) => api.post(`/api/users/upload-avatar/${userId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStats: (userId) => api.get(`/api/users/stats/${userId}`),
};

export default api;
