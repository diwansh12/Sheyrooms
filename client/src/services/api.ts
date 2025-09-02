import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// Types for parameters
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface GetAllUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isAdmin?: string;
}

export interface SearchRoomsParams {
  location?: string;
  checkin?: string;   // ISO date or yyyy-mm-dd
  checkout?: string;  // ISO date or yyyy-mm-dd
  guests?: number | string;
  type?: string;
  maxPrice?: number | string;
  minPrice?: number | string;
}

export interface GetUserBookingsParams {
  page?: number;
  limit?: number;
  status?: string;     // 'all' | 'pending' | 'confirmed' | etc.
  sortBy?: string;     // 'createdAt' etc.
  sortOrder?: 'asc' | 'desc';
}

export interface ModifyBookingBody {
  bookingid: string;
  newFromDate: string; // ISO string or yyyy-mm-dd
  newToDate: string;   // ISO string or yyyy-mm-dd
  additionalRequests?: string;
}

export interface CreateBookingBody {
  roomId: string;
  userid: string;
  fromdate: string; // yyyy-mm-dd
  todate: string;   // yyyy-mm-dd
  guestCount: {
    adults: number;
    children: number;
    infants: number;
  };
  primaryGuest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    age: number | null;
    idType: string | null;
    idNumber: string | null;
  };
  additionalGuests: any[];
  preferences: Record<string, any>;
  addOns: any[];
  specialRequests: string;
  paymentMethod: string; // 'manual' | 'paypal' | 'stripe' | 'razorpay' | 'wallet'
  totalamount: number;
  totalNights: number;
}

export interface AddRoomBody {
  [key: string]: any;
}

export interface WishlistAddBody {
  roomId: string;
}

// ✅ NEW: Profile-related interfaces
export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  timezone?: string;
  preferences?: {
    propertyTypes?: string[];
    amenities?: string[];
  };
  notifications?: {
    bookingUpdates?: boolean;
    priceDropsDeals?: boolean;
    messagesFromHosts?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
  };
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface Setup2FAResponse {
  qrCodeUrl: string;
  backupCodes: string[];
  secret: string;
}

export interface Enable2FAData {
  code: string;
  secret?: string;
}

export interface PaymentMethodData {
  type: 'visa' | 'mastercard' | 'amex' | 'paypal';
  cardholderName: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  email?: string; // for PayPal
}

export interface UpdatePaymentMethodData {
  cardholderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
}

export interface LoginDevice {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface GovernmentIdData {
  type: 'passport' | 'license' | 'national_id';
  number?: string;
  issuedDate?: string;
  expiryDate?: string;
}

export interface NotificationPreferences {
  bookingUpdates: boolean;
  priceDropsDeals: boolean;
  messagesFromHosts: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

// ✅ Clean baseURL configuration
const BASE_URL: string = (
  process.env.REACT_APP_API_URL || 
  'https://sheyrooms-backend.vercel.app/api'
).trim().replace(/\s+/g, '');

console.log('🌐 API Base URL:', BASE_URL);

// Create axios instance
const API: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Enhanced request interceptor with better token handling
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get fresh token for each request
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    // Clean URL
    if (config.url) {
      config.url = config.url.trim().replace(/\s+/g, '');
    }

    // Enhanced logging
    const baseURL = config.baseURL ?? '';
    const url = config.url ?? '';
    const method = (config.method ?? 'GET').toString().toUpperCase();
    const hasToken = !!token;
    const tokenPreview = token ? token.substring(0, 20) + '...' : 'None';

    console.log('📤 API Request:', {
      method,
      url: baseURL + url,
      hasToken,
      tokenPreview: hasToken ? tokenPreview : 'No token',
      data: config.data, 
      timestamp: new Date().toISOString()
    });

    return config;
  },
  (error) => {
    console.error('📤 Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// ✅ Enhanced response interceptor with better error handling
API.interceptors.response.use(
  (response) => {
    const status = response?.status;
    const url = response?.config?.url ?? '';
    const method = response?.config?.method?.toUpperCase() ?? '';
    
    console.log('✅ API Success:', {
      method,
      status,
      url,
      timestamp: new Date().toISOString()
    });
    
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const conf: AxiosRequestConfig | undefined = error?.config;
    const url = conf?.url ?? '';
    const baseURL = conf?.baseURL ?? '';
    const method = conf?.method?.toUpperCase() ?? '';
    const message = error?.response?.data?.message;
    const errorData = error?.response?.data;

    console.error('❌ API Error:', {
      method,
      status,
      url,
      message,
      fullURL: baseURL + url,
      errorData,
      timestamp: new Date().toISOString()
    });

    // ✅ Handle authentication errors properly
    if (status === 401) {
      console.log('🔒 Authentication failed - clearing tokens and redirecting');
      
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('currentUser');
      
      // Only redirect if not already on login page
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        
        console.log('🔄 Redirecting to login page');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Auth API calls (Enhanced)
export const authAPI = {
  login: (credentials: LoginCredentials) => {
    console.log('🔐 Attempting login for:', credentials.email);
    return API.post('/users/login', credentials);
  },
  
  register: (userData: RegisterData) => {
    console.log('📝 Attempting registration for:', userData.email);
    return API.post('/users/register', userData);
  },
  
  verifyToken: () => {
    console.log('🔍 Verifying token');
    return API.get('/users/verify');
  },
  
  getAllUsers: (params?: GetAllUsersParams) => {
    console.log('👥 Fetching all users with params:', params);
    return API.get('/users/getallusers', { params });
  },

  // ✅ NEW: Profile management endpoints
  getProfile: () => {
    console.log('👤 Fetching user profile');
    return API.get('/users/profile');
  },

  updateProfile: (profileData: UpdateProfileData) => {
    console.log('✏️ Updating user profile:', Object.keys(profileData));
    return API.put('/users/profile', profileData);
  },

  uploadProfilePhoto: (formData: FormData) => {
    console.log('📸 Uploading profile photo');
    return API.post('/users/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updatePassword: (passwordData: UpdatePasswordData) => {
    console.log('🔒 Updating password');
    return API.put('/users/password', passwordData);
  },

  // ✅ NEW: Two-Factor Authentication endpoints
  setup2FA: () => {
    console.log('🔐 Setting up 2FA');
    return API.post('/users/2fa/setup');
  },

  enable2FA: (data: Enable2FAData) => {
    console.log('✅ Enabling 2FA');
    return API.post('/users/2fa/enable', data);
  },

  disable2FA: (code: string) => {
    console.log('❌ Disabling 2FA');
    return API.post('/users/2fa/disable', { code });
  },

  // ✅ NEW: Account management endpoints
  deleteAccount: (userId: string, confirmationData?: { password: string }) => {
    console.log('🗑️ Deleting account for user:', userId);
    return API.delete(`/users/${userId}`, { data: confirmationData });
  },

  // ✅ NEW: Notification preferences
  updateNotificationPreferences: (preferences: NotificationPreferences) => {
    console.log('🔔 Updating notification preferences');
    return API.put('/users/notifications', preferences);
  },

  getNotificationPreferences: () => {
    console.log('🔔 Fetching notification preferences');
    return API.get('/users/notifications');
  },
};

// ✅ NEW: Payment Methods API
export const paymentMethodsAPI = {
  getPaymentMethods: () => {
    console.log('💳 Fetching payment methods');
    return API.get('/users/payment-methods');
  },

  addPaymentMethod: (paymentData: PaymentMethodData) => {
    console.log('➕ Adding payment method:', paymentData.type);
    return API.post('/users/payment-methods', paymentData);
  },

  updatePaymentMethod: (methodId: string, updateData: UpdatePaymentMethodData) => {
    console.log('✏️ Updating payment method:', methodId);
    return API.put(`/users/payment-methods/${methodId}`, updateData);
  },

  deletePaymentMethod: (methodId: string) => {
    console.log('🗑️ Deleting payment method:', methodId);
    return API.delete(`/users/payment-methods/${methodId}`);
  },

  setDefaultPaymentMethod: (methodId: string) => {
    console.log('⭐ Setting default payment method:', methodId);
    return API.put(`/users/payment-methods/${methodId}/default`);
  },

  // ✅ PayPal integration endpoints
  setupPayPal: () => {
    console.log('💰 Setting up PayPal payment');
    return API.post('/payments/paypal/setup');
  },

  confirmPayPal: (paymentId: string, payerId: string) => {
    console.log('✅ Confirming PayPal payment:', paymentId);
    return API.post('/payments/paypal/confirm', { paymentId, payerId });
  },
};

// ✅ NEW: Device Management API
export const deviceAPI = {
  getLoginDevices: () => {
    console.log('📱 Fetching login devices');
    return API.get('/users/devices');
  },

  signOutDevice: (deviceId: string) => {
    console.log('🚪 Signing out device:', deviceId);
    return API.post(`/users/devices/${deviceId}/signout`);
  },

  signOutAllDevices: () => {
    console.log('🚪 Signing out all devices');
    return API.post('/users/devices/signout-all');
  },
};

// ✅ NEW: Government ID Verification API
export const identityAPI = {
  uploadGovernmentId: (formData: FormData) => {
    console.log('🆔 Uploading government ID');
    return API.post('/users/identity/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getGovernmentId: () => {
    console.log('🆔 Fetching government ID details');
    return API.get('/users/identity');
  },

  updateGovernmentId: (idData: GovernmentIdData) => {
    console.log('✏️ Updating government ID');
    return API.put('/users/identity', idData);
  },

  deleteGovernmentId: () => {
    console.log('🗑️ Deleting government ID');
    return API.delete('/users/identity');
  },
};

// ✅ NEW: Security & Recovery API
export const securityAPI = {
  generateBackupCodes: () => {
    console.log('🔑 Generating backup codes');
    return API.post('/users/security/backup-codes');
  },

  downloadBackupCodes: () => {
    console.log('📥 Downloading backup codes');
    return API.get('/users/security/backup-codes/download');
  },

  getSecurityLog: (params?: { limit?: number; page?: number }) => {
    console.log('📊 Fetching security log');
    return API.get('/users/security/log', { params });
  },

  reportSuspiciousActivity: (details: { description: string; deviceInfo?: any }) => {
    console.log('🚨 Reporting suspicious activity');
    return API.post('/users/security/report', details);
  },
};

// ✅ Rooms API calls
export const roomsAPI = {
  getAllRooms: () => {
    console.log('🏠 Fetching all rooms');
    return API.get('/rooms/getallrooms');
  },
  
  getRoomById: (roomId: string) => {
    console.log('🏠 Fetching room by ID:', roomId);
    return API.get(`/rooms/getroombyid/${roomId}`);
  },
  
  addRoom: (roomData: AddRoomBody) => {
    console.log('➕ Adding new room');
    return API.post('/rooms/addroom', roomData);
  },
  
  searchRooms: (searchParams: SearchRoomsParams) => {
    console.log('🔍 Searching rooms with params:', searchParams);
    return API.get('/rooms/search', { params: searchParams });
  },
};

// ✅ Bookings API calls
export const bookingsAPI = {
  createBooking: (bookingData: CreateBookingBody) => {
    console.log('📝 Creating booking:', {
      roomId: bookingData.roomId,
      userid: bookingData.userid,
      fromdate: bookingData.fromdate,
      todate: bookingData.todate,
      totalamount: bookingData.totalamount
    });
    return API.post('/bookings/bookroom', bookingData);
  },

  getUserBookings: (userId: string, params?: GetUserBookingsParams) => {
    console.log('📋 Fetching user bookings for userId:', userId, 'with params:', params);
    return API.post('/bookings/getuserbookings', { userid: userId }, { params });
  },

  getAllBookings: (params?: Record<string, any>) => {
    console.log('📋 Fetching all bookings with params:', params);
    return API.get('/bookings/getallbookings', { params });
  },

  cancelBooking: (bookingId: string, reason: string) => {
    console.log('❌ Cancelling booking:', bookingId, 'reason:', reason);
    return API.post('/bookings/cancelBooking', { bookingId: bookingId, reason });
  },

  modifyBooking: (bookingData: ModifyBookingBody) => {
    console.log('✏️ Modifying booking:', bookingData.bookingid);
    return API.post('/bookings/modifyBooking', bookingData);
  },

  getBookingById: (bookingId: string) => {
    console.log('📋 Fetching booking by ID:', bookingId);
    return API.get(`/bookings/getbooking/${bookingId}`);
  },
};

// ✅ Wishlist API calls with enhanced logging
export const wishlistAPI = {
  getWishlist: () => {
    console.log('❤️ Fetching user wishlist');
    return API.get('/wishlist');
  },
  
  addToWishlist: (roomId: string) => {
    console.log('❤️ Adding room to wishlist:', roomId);
    return API.post('/wishlist/add', { roomId } as WishlistAddBody);
  },
  
  removeFromWishlist: (roomId: string) => {
    console.log('💔 Removing room from wishlist:', roomId);
    return API.post('/wishlist/remove', { roomId } as WishlistAddBody);
  },

  // ✅ NEW: Enhanced wishlist features
  getWishlistStats: () => {
    console.log('📊 Fetching wishlist statistics');
    return API.get('/wishlist/stats');
  },

  shareWishlist: (shareData: { email?: string; platform?: string }) => {
    console.log('📤 Sharing wishlist');
    return API.post('/wishlist/share', shareData);
  },

  exportWishlist: (format: 'json' | 'csv' | 'pdf' = 'json') => {
    console.log('📁 Exporting wishlist as:', format);
    return API.get(`/wishlist/export?format=${format}`);
  },
};

// ✅ NEW: User Preferences API
export const preferencesAPI = {
  getPreferences: () => {
    console.log('⚙️ Fetching user preferences');
    return API.get('/users/preferences');
  },

  updatePreferences: (preferences: Record<string, any>) => {
    console.log('⚙️ Updating user preferences');
    return API.put('/users/preferences', preferences);
  },

  resetPreferences: () => {
    console.log('🔄 Resetting user preferences to default');
    return API.post('/users/preferences/reset');
  },
};

// ✅ NEW: Analytics & Insights API
export const analyticsAPI = {
  getUserActivity: (params?: { startDate?: string; endDate?: string }) => {
    console.log('📈 Fetching user activity analytics');
    return API.get('/users/analytics/activity', { params });
  },

  getBookingHistory: (params?: { limit?: number; year?: number }) => {
    console.log('📊 Fetching booking history analytics');
    return API.get('/users/analytics/bookings', { params });
  },

  getSpendingAnalytics: (params?: { year?: number; currency?: string }) => {
    console.log('💰 Fetching spending analytics');
    return API.get('/users/analytics/spending', { params });
  },
};

// ✅ Debug utility functions (Enhanced)
export const debugAPI = {
  getCurrentToken: () => {
    const token = localStorage.getItem('token');
    console.log('🔍 Current token:', token ? token.substring(0, 30) + '...' : 'None');
    return token;
  },
  
  clearAllTokens: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('currentUser');
    console.log('🧹 All tokens cleared');
  },
  
  testConnection: async () => {
    try {
      const response = await API.get('/users/verify');
      console.log('✅ API connection test successful:', response.status);
      return true;
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      return false;
    }
  },

  // ✅ NEW: Enhanced debugging functions
  testAllEndpoints: async () => {
    console.log('🧪 Testing all API endpoints...');
    const results: Record<string, boolean> = {};
    
    const endpoints = [
      { name: 'auth.verify', call: () => authAPI.verifyToken() },
      { name: 'profile.get', call: () => authAPI.getProfile() },
      { name: 'rooms.getAll', call: () => roomsAPI.getAllRooms() },
      { name: 'wishlist.get', call: () => wishlistAPI.getWishlist() },
    ];

    for (const endpoint of endpoints) {
      try {
        await endpoint.call();
        results[endpoint.name] = true;
        console.log(`✅ ${endpoint.name}: SUCCESS`);
      } catch (error) {
        results[endpoint.name] = false;
        console.log(`❌ ${endpoint.name}: FAILED`);
      }
    }

    return results;
  },

  getApiInfo: () => {
    return {
      baseURL: BASE_URL,
      hasToken: !!localStorage.getItem('token'),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      environment: process.env.NODE_ENV || 'development'
    };
  }
};

export default API;

