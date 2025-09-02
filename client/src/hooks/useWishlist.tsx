// src/hooks/useWishlist.ts
import { useEffect, useState, useCallback } from 'react';
import { wishlistAPI } from '../services/api.ts';

export interface WishlistItem {
  id: string;
  name: string;
  location: string;
  description?: string;
  pricePerNight: number;
  rating: number;
  image: string;
  type: 'hotel' | 'apartment' | 'resort';
  addedAt?: Date;
}

function extractImageFromCharObject(charObj: any): string | null {
  if (!charObj || typeof charObj !== 'object') return null;
  const chars: string[] = [];
  let i = 0;
  while (charObj[i.toString()] !== undefined) {
    chars.push(charObj[i.toString()]);
    i++;
  }
  const s = chars.join('');
  const match = s.match(/(https?:\/\/[^\s"'<>]+?\.(jpg|jpeg|png|gif|webp))/i);
  return match ? match[1] : null;
}

function getPrimaryImage(room: any): string {
  const fallback = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop';
  if (!room) return fallback;

  const arr = room.imageurls;
  if (Array.isArray(arr) && arr.length > 0) {
    const primary = arr.find((x: any) => x?.isPrimary && typeof x?.url === 'string');
    if (primary?.url?.startsWith('http')) return primary.url;

    const anyUrl = arr.find((x: any) => typeof x?.url === 'string');
    if (anyUrl?.url?.startsWith('http')) return anyUrl.url;

    const first = arr;
    const charUrl = extractImageFromCharObject(first);
    if (charUrl) return charUrl;
  }

  return fallback;
}

function mapRoomToWishlist(room: any): WishlistItem {
  const image = getPrimaryImage(room);
  const type = (() => {
    const t = (room?.type || '').toLowerCase();
    if (t.includes('suite')) return 'resort';
    if (t.includes('apartment')) return 'apartment';
    return 'hotel';
  })();

  return {
    id: room._id,
    name: room.name || 'Room',
    location: room.location?.wing
      ? `${room.location.wing} Wing${room.location.floor ? ` • Floor ${room.location.floor}` : ''}${room.location.roomNumber ? ` • ${room.location.roomNumber}` : ''}`
      : room.address || room.category || 'Premium Location',
    description: room.shortDescription || '',
    pricePerNight: room.currentPrice ?? room.rentperday ?? 0,
    rating: room.ratings?.average ?? 4.3,
    image,
    type,
  };
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await wishlistAPI.getWishlist();
      const payload = res.data?.data ?? res.data;

      // Accept either:
      // 1) Array of rooms
      // 2) Array of wishlist documents with roomId populated
      let rooms: any[] = [];
      if (Array.isArray(payload)) {
        rooms = payload.map((d: any) => d.roomId || d.room || d);
      } else if (Array.isArray(payload?.items)) {
        rooms = payload.items.map((d: any) => d.roomId || d.room || d);
      }

      const mapped = rooms.map(mapRoomToWishlist);
      setItems(mapped);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to load wishlist');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (roomId: string) => {
    await wishlistAPI.removeFromWishlist(roomId);
    setItems(prev => prev.filter(i => i.id !== roomId));
  }, []);

  const add = useCallback(async (roomId: string) => {
    await wishlistAPI.addToWishlist(roomId);
    await load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, error, load, remove, add, setItems };
}
