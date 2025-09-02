import { useState, useEffect } from 'react';
import { roomsAPI } from '../services/api.ts';
import { Room, SearchFilters } from '../types';

// ✅ Define the return type interface
interface UseRoomsResult {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  searchRooms: (filters: Partial<SearchFilters>) => Promise<void>;
}

// ✅ Add explicit return type annotation
export const useRooms = (filters: Partial<SearchFilters> = {}): UseRoomsResult => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all rooms on mount
  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch all rooms from backend
  const fetchRooms = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomsAPI.getAllRooms();
      const rawRooms = response.data?.data || response.data;
      setRooms(processRooms(rawRooms));
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to fetch rooms'
      );
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Search rooms from backend
  const searchRooms = async (searchFilters: Partial<SearchFilters>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Clean up search parameters - remove empty values
      const cleanParams: any = {};
      
      if (searchFilters.destination?.trim()) {
        cleanParams.location = searchFilters.destination.trim();
      }
      if (searchFilters.checkin) {
        cleanParams.checkin = searchFilters.checkin;
      }
      if (searchFilters.checkout) {
        cleanParams.checkout = searchFilters.checkout;
      }
      if (searchFilters.guests) {
        cleanParams.guests = searchFilters.guests;
      }
      if (searchFilters.roomType?.trim()) {
        cleanParams.type = searchFilters.roomType.trim();
      }
      if (searchFilters.priceRange?.trim()) {
        cleanParams.maxPrice = searchFilters.priceRange.trim();
      }

      const response = await roomsAPI.searchRooms(cleanParams);
      const rawRooms = response.data?.data || response.data;
      setRooms(processRooms(rawRooms));
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Search request failed'
      );
      // Fall back to all rooms if search fails
      fetchRooms();
    } finally {
      setLoading(false);
    }
  };


function processRooms(rawRooms: any[]): Room[] {
  if (!Array.isArray(rawRooms)) return [];
  return rawRooms.map((room: any) => ({
    ...room,
    primaryImage: (() => {
      if (room.imageurls && Array.isArray(room.imageurls) && room.imageurls.length > 0) {
        const firstImage = room.imageurls[0];
        if (typeof firstImage === 'object') {
          // ✅ FIXED: Only get numeric keys and join them
          const urlString = Object.keys(firstImage)
            .filter(key => !isNaN(Number(key))) // Only numeric keys
            .sort((a, b) => Number(a) - Number(b)) // Sort by number
            .map(key => firstImage[key])
            .join('');
          
          if (urlString.startsWith('http') && urlString.includes('.jpg')) {
            return urlString;
          }
        }
      }
      return 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop';
    })(),
    displayPrice: room.currentPrice || room.rentperday,
    amenitiesList: Array.isArray(room.amenities)
      ? room.amenities.map((amenity: any) => amenity?.name || amenity)
      : [],
    isAvailable: room.availability?.isActive ?? true,
    locationInfo: room.location || {},
    isFavorite: false,
  }));
}


// Return the result (move this after processRooms, inside useRooms)
return {
  rooms,
  loading,
  error,
  refetch: fetchRooms,
  searchRooms,
};
}
