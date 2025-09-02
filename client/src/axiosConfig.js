// src/utils/axiosConfig.js
import axios from 'axios';

// ✅ FIXED: Environment-based URL selection
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://sheyrooms-backend.vercel.app/api';
  }
  // For development, use localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000, // ✅ Increased timeout for production
  headers: {
    'Content-Type': 'application/json',
  }
});

console.log('🌐 API Base URL:', getBaseURL());

// ✅ Enhanced request interceptor with better debugging
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Request with token:', {
        url: config.baseURL + config.url,
        method: config.method?.toUpperCase(),
        hasToken: true,
        tokenPreview: token.substring(0, 20) + '...'
      });
    } else {
      console.warn('⚠️ No token found for request:', config.baseURL + config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('📤 Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ✅ Enhanced response interceptor with detailed error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase()
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.response?.data?.message,
      data: error.response?.data
    });

    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('🔒 Authentication failed - clearing tokens');
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export { axiosInstance };

// ✅ Your existing API methods remain the same
export const roomsAPI = {
  getAll: (params = {}) => axiosInstance.get('/rooms/getallrooms', { params }),
  getById: (roomId) => axiosInstance.get(`/rooms/getroombyid/${roomId}`),
  search: (searchParams) => axiosInstance.post('/rooms/search', searchParams),
  getFavorites: (roomIds) => axiosInstance.post('/rooms/getfavorites', { roomIds }),
  addReview: (roomId, review) => axiosInstance.post(`/rooms/${roomId}/reviews`, review),
};

export const bookingsAPI = {
  create: (bookingData) => axiosInstance.post('/bookings/bookroom', bookingData),
  getUserBookings: (userId, params = {}) => axiosInstance.post('/bookings/getuserbookings', 
    { userid: userId }, 
    { params }
  ),
  cancel: (bookingId, roomId, reason) => axiosInstance.post('/bookings/cancelBooking', {
    bookingid: bookingId,
    roomid: roomId,
    reason
  }),
  modify: (bookingId, modifications) => axiosInstance.post('/bookings/modifyBooking', {
    bookingid: bookingId,
    ...modifications
  }),
  getAll: (params = {}) => axiosInstance.get('/bookings/getallbookings', { params }),
};

export const usersAPI = {
  login: (credentials) => axiosInstance.post('/users/login', credentials),
  register: (userData) => axiosInstance.post('/users/register', userData),
  verify: () => axiosInstance.get('/users/verify'),
  getAll: () => axiosInstance.get('/users/getallusers'),
  updateProfile: (userId, updates) => axiosInstance.put(`/users/profile/${userId}`, updates),
};

export default axiosInstance;
