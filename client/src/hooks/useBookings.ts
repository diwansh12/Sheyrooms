import { useState, useEffect } from 'react';
import { bookingsAPI } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Booking, Pagination } from '../types';

interface BookingData {
  roomId: string;
  checkIn: string;    // ISO string or parseable by new Date()
  checkOut: string;   // ISO string or parseable by new Date()
  adults?: number;
  children?: number;
  infants?: number;
  guestName?: string;
  totalAmount: number;   // must match server-calculated total
  totalNights: number;
  paymentMethod?: string; // 'manual' by default
  specialRequests?: string;
}

interface BookingResult {
  success: boolean;
  booking?: any;
  message: string;
  data?: any;
}

interface UseUserBookingsResult {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  fetchBookings: (params?: Record<string, any>) => Promise<void>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<BookingResult>;
  createBooking: (bookingData: BookingData) => Promise<BookingResult>;
}

export const useUserBookings = (): UseUserBookingsResult => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  useEffect(() => {
    if (user?._id) {
      fetchBookings();
    } else {
      setBookings([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // Extract URL string from character-indexed object ({"0":"h","1":"t","2":"t","3":"p",...})
  const extractImageFromCharObject = (charObj: any): string | null => {
    if (!charObj || typeof charObj !== 'object') return null;
    const chars: string[] = [];
    let i = 0;
    while (charObj[i.toString()] !== undefined) {
      chars.push(charObj[i.toString()]);
      i++;
    }
    const candidate = chars.join('');
    const match = candidate.match(/(https?:\/\/[^\s"'<>]+?\.(jpg|jpeg|png|gif|webp))/i);
    return match ? match[1] : null;
  };

  // Pick primary image from populated roomId
  const deriveRoomPrimaryImage = (room: any): string => {
    const fallback = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop';
    if (!room) return fallback;

    if (Array.isArray(room.imageurls) && room.imageurls.length > 0) {
      const primary = room.imageurls.find((x: any) => x?.isPrimary && typeof x?.url === 'string');
      if (primary?.url?.startsWith('http')) return primary.url;

      const anyUrl = room.imageurls.find((x: any) => typeof x?.url === 'string');
      if (anyUrl?.url?.startsWith('http')) return anyUrl.url;

      const first = room.imageurls[0];
      const charUrl = extractImageFromCharObject(first);
      if (charUrl) return charUrl;
    }

    return fallback;
  };

  // Fetch user's bookings
  const fetchBookings = async (params: Record<string, any> = {}): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const res = await bookingsAPI.getUserBookings(user!._id, params);

      if (res.data?.success) {
        const raw = res.data.data?.bookings || [];

        const processed: Booking[] = raw.map((b: any) => {
          const checkIn = new Date(b.fromdate);
          const checkOut = new Date(b.todate);

          const totalNights =
            b.pricing?.totalNights ??
            Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

          // Prefer lowercase pricing.totalamount; keep fallbacks
          const totalamount =
            b.pricing?.totalamount ??
            b.pricing?.totalAmount ??
            b.totalamount ??
            0;

          const daysUntilCheckIn = Math.ceil((checkIn.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          const canCancel =
            typeof b.canCancel === 'boolean'
              ? b.canCancel
              : b.status === 'confirmed' && daysUntilCheckIn > 1;

          const roomPrimaryImage = deriveRoomPrimaryImage(b.roomId);
          const roomName = b.roomId?.name || b.room || 'Hotel Room';

          return {
            ...b,
            pricing: {
              ...b.pricing,
              totalNights,
              totalamount,
            },
            daysUntilCheckIn,
            checkInDate: checkIn.toLocaleDateString('en-GB'),
            checkOutDate: checkOut.toLocaleDateString('en-GB'),
            statusDisplay: b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : 'Pending',
            canCancel,
            roomPrimaryImage,
            roomName,
          };
        });

        setBookings(processed);
        setPagination(res.data.data?.pagination || null);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Cancel a booking
  const cancelBooking = async (bookingId: string, reason: string = 'User requested cancellation'): Promise<BookingResult> => {
    try {
      const res = await bookingsAPI.cancelBooking(bookingId, reason);
      if (res.data?.success) {
        await fetchBookings();
        return {
          success: true,
          message: res.data.message,
          data: res.data.data,
        };
      }
      return { success: false, message: res.data?.message || 'Cancellation failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || 'Cancellation failed',
      };
    }
  };

  // Create a new booking
  const createBooking = async (bookingData: BookingData): Promise<BookingResult> => {
    try {
      const checkInDate = new Date(bookingData.checkIn);
      const checkOutDate = new Date(bookingData.checkOut);

      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        return { success: false, message: 'Invalid dates provided. Please check your date format.' };
      }

      // ISO date (yyyy-mm-dd) — ensure strings, not arrays
      const fromISO: string = checkInDate.toISOString().split('T')[0];
      const toISO: string = checkOutDate.toISOString().split('T')[0];

      // SAFE NAME HANDLING — strings get trim, arrays never do
      const rawUserName: string = typeof user?.name === 'string' && user.name ? user.name : 'Guest User';
      const userName: string = rawUserName.trim();
      const nameArray: string[] = userName.split(' ').filter(Boolean);

      const defaultFirst: string = nameArray.length > 0 ? nameArray[0] : 'Guest';
      const defaultLast: string = nameArray.length > 1 ? nameArray.slice(1).join(' ') : '';

      const rawGuestName: string = typeof bookingData.guestName === 'string' ? bookingData.guestName : '';
      const guestName: string = rawGuestName.trim();
      const guestNameArray: string[] = guestName ? guestName.split(' ').filter(Boolean) : nameArray;

      const guestFirstName: string = (guestNameArray.length > 0 ? guestNameArray[0] : defaultFirst).trim();
      const guestLastName: string = (guestNameArray.length > 1 ? guestNameArray.slice(1).join(' ') : defaultLast).trim();

      // Backend payload
      const payload = {
        roomId: bookingData.roomId,
        userid: user!._id,
        fromdate: fromISO,
        todate: toISO, // string, not string[]
        guestCount: {
          adults: bookingData.adults || 2,
          children: bookingData.children || 0,
          infants: bookingData.infants || 0,
        },
        primaryGuest: {
          firstName: guestFirstName,
          lastName: guestLastName,
          email: user!.email,
          phone: '+919876543210',
          age: null,
          idType: null,
          idNumber: null,
        },
        additionalGuests: [],
        preferences: {},
        addOns: [],
        specialRequests: bookingData.specialRequests || '',
        paymentMethod: bookingData.paymentMethod || 'manual',
        totalamount: bookingData.totalAmount, // lowercase expected by backend
        totalNights: bookingData.totalNights,
      };

      const res = await bookingsAPI.createBooking(payload);

      if (res.data?.success) {
        await fetchBookings();
        return {
          success: true,
          booking: res.data.data,
          message: res.data.message,
        };
      }

      return {
        success: false,
        message: res.data?.message || 'Booking failed',
      };
    } catch (err: any) {
      console.error('Booking creation error:', err);
      return {
        success: false,
        message: err?.response?.data?.message || err?.message || 'Booking failed',
      };
    }
  };

  return {
    bookings,
    loading,
    error,
    pagination,
    fetchBookings,
    cancelBooking,
    createBooking,
  };
};
