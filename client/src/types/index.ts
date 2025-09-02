// Room related types
export interface Room {
  id: string;
  _id: string;
  name: string;
    address: string;
  slug?: string;
  maxcount: number;
  phonenumber: string;
  rentperday: number;
  originalPrice?: number;
  discountPercent?: number;
  imageurls: string[];
  floor?: string | number; 
  currentbookings?: CurrentBooking[];
  type: 'Standard' | 'Deluxe' | 'Delux' | 'Suite' | 'Presidential' | 'Family';
  category?: 'Budget' | 'Mid-Range' | 'Luxury' | 'Premium';
  description: string;
  shortDescription?: string;
  amenities?: string[];
  roomFeatures?: RoomFeatures;
  location?: Location;
  pricing?: Pricing;
  availability?: Availability;
  policies?: Policies;
  createdAt?: string;
  updatedAt?: string;
  featured?: boolean;
  ratings?: {
    average?: number;
    count?: number;
  };
  
  // Computed properties
  currentPrice: number;
  primaryImage: string;
  displayPrice: number;
  amenitiesList?: string[];
  isAvailable?: boolean;
  locationInfo: Location;
  isFavorite?: boolean;
}

export interface ImageUrl {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface CurrentBooking {
  bookingId: string;
  fromdate: string;
  todate: string;
  userid: string;
  status: string;
}

export interface Amenity {
  name: string;
  icon?: string;
  category?: 'basic' | 'premium' | 'business';
}

export interface RoomFeatures {
  bedType?: string;
  roomSize?: number;
  maxOccupancy?: number;
  smokingAllowed?: boolean;
  petFriendly?: boolean;
  wifi?: boolean;
  airConditioning?: boolean;
  balcony?: boolean;
  cityView?: boolean;
  oceanView?: boolean;
}

export interface Location {
  city: string;
  state?: string;
  floor: string | number;
  wing?: string;
  roomNumber?: string;
}

export interface Pricing {
  weekdayRate?: number;
  weekendRate?: number;
  seasonalMultiplier?: Record<string, number>;
}

export interface Availability {
  isActive: boolean;
  maintenanceSchedule?: MaintenanceSchedule[];
}

export interface MaintenanceSchedule {
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface Ratings {
  count: number;
  total: number;
  average: number;
  totalReviews: number;
  breakdown?: RatingBreakdown;
}

export interface RatingBreakdown {
  cleanliness: number;
  comfort: number;
  location: number;
  service: number;
  value: number;
}

export interface Policies {
  cancellationPolicy?: string;
  checkInTime?: string;
  checkOutTime?: string;
  extraBedPolicy?: string;
  childPolicy?: string;
}

// Booking related types
export interface Booking {
  _id: string;
  roomId: string;
  userid: string;
  fromdate: string;
  todate: string;
  guestCount: {
    adults: number;
    children?: number;
    infants?: number;
  };
  primaryGuest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  additionalGuests?: any[];
  preferences?: any;
  addOns?: any[];
  specialRequests?: string;
  paymentMethod?: string;
  totalamount: number;
  totalNights: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'checked-in' | 'checked-out' | 'no-show';
  pricing?: {
    totalamount: number;
    totalNights?: number;
  };
  room: {
    _id: string;
    name: string;
    type: string;
    location?: {
      wing?: string;
      floor?: string;
      roomNumber?: string;
    };
    address?: string;
    primaryImage?: string;
  };
  createdAt: string;
  updatedAt?: string;
  
  // Computed properties added by frontend
  daysUntilCheckIn?: number;
  checkInDate?: string;
  checkOutDate?: string;
  statusDisplay?: string;
  canCancel?: boolean;
}


export interface Guests {
  adults: number;
  children: number;
  infants: number;
  details: GuestDetail[];
}

export interface GuestDetail {
  name: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  idType?: string;
  idNumber?: string;
  relation?: string;
}

export interface BookingPricing {
  roomRate?: number;
  totalNights?: number;
  subtotal?: number;
  taxes: Taxes;
  discounts?: Discounts;
  addOns?: AddOn[];
  totalamount: number;
}

export interface Taxes {
  gst?: number;
  serviceTax?: number;
  other?: number;
}

export interface Discounts {
  couponCode?: string;
  amount?: number;
  type?: 'fixed' | 'percentage';
}

export interface AddOn {
  name: string;
  price: number;
  quantity?: number;
}

export interface Payment {
  method: 'paypal' | 'stripe' | 'razorpay' | 'manual' | 'wallet';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partial';
  transactionId?: string;
  paymentDate?: string;
  refundAmount?: number;
  refundDate?: string;
}

export interface Preferences {
  earlyCheckIn?: boolean;
  lateCheckOut?: boolean;
  roomPreferences?: string[];
  dietaryRestrictions?: string[];
}

export interface Cancellation {
  cancelledAt: string;
  reason: string;
  refundAmount: number;
  cancelledBy: 'user' | 'admin' | 'system';
}

export interface Review {
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notifications {
  confirmationSent: boolean;
  reminderSent: boolean;
  checkInSent: boolean;
}

// User related types
export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  loyaltyProgram?: LoyaltyProgram;
  createdAt: string;
  updatedAt: string;
  phone?: string;
}

export interface LoyaltyProgram {
  points: number;
  totalSpent: number;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

// Search and filter types
export interface SearchFilters {
  destination: string;
  checkin: string;
  checkout: string;
  guests: number;
  roomType: string;
  priceRange: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
