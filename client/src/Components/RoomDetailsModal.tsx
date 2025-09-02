import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button.tsx";
import { Card, CardContent } from "./ui/card.tsx";
import { Badge } from "./ui/badge.tsx";
import { FavoriteButton } from './FavoriteButton.tsx'; // ✅ Add this import
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Users, 
  Star, 
  Wifi, 
  Car, 
  Coffee, 
  Tv,
  Bath,
  Bed,
  Calendar,
  Clock,
  Share2
} from "lucide-react";
import { Room } from '../types/index.ts';

interface RoomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
}

export default function RoomDetailsModal({ isOpen, onClose, room }: RoomDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index when room changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [room]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !room) return null;

  // Helper function to get image URLs
  const getImageUrl = (imageItem: any): string => {
    if (typeof imageItem === 'string') return imageItem;
    if (typeof imageItem === 'object' && imageItem?.url) return imageItem.url;
    if (typeof imageItem === 'object' && imageItem !== null) {
      const chars = [];
      let index = 0;
      while (imageItem[index] !== undefined) {
        chars.push(imageItem[index]);
        index++;
      }
      const url = chars.join('');
      if (url.startsWith('http')) return url;
    }
    return 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=400&fit=crop';
  };

  const images = room.imageurls?.map(img => getImageUrl(img)) || [getImageUrl(room.imageurls?.[0])];
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const amenities = [
    { icon: Wifi, label: 'Free WiFi', available: true },
    { icon: Car, label: 'Parking', available: true },
    { icon: Coffee, label: 'Coffee/Tea', available: true },
    { icon: Tv, label: 'Smart TV', available: true },
    { icon: Bath, label: 'Private Bath', available: true },
    { icon: Bed, label: 'King Bed', available: room.type === 'Suite' || room.type === 'Deluxe' },
  ];

  // ✅ Create room object for FavoriteButton
  const roomForFavorite = {
    id: room._id || room.id || '', 
    name: room.name || 'Room',
    location: room.location?.city || room.location?.wing || 'Premium Location',
    pricePerNight: room.rentperday || 0,
    image: images[0] || '',
    rating: room.ratings?.average || 4.5,
    type: room.type || 'Standard'
  };

  // ✅ Handle booking navigation
  const handleBookNow = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };
    
    // Close modal first, then navigate
    onClose();
    
    // Navigate to booking page (adjust the route as needed)
    window.location.href = `/book/${room._id}/${formatDate(today)}/${formatDate(tomorrow)}`;
  };

  // ✅ Handle share functionality
  const handleShare = async () => {
    const roomUrl = `${window.location.origin}/rooms/${room._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: room.name,
          text: `Check out this amazing ${room.type} room at SheyRooms`,
          url: roomUrl
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(roomUrl);
      // You can show a toast notification here
      console.log('Room link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <Card className="relative w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden shadow-2xl border-0 rounded-2xl bg-white">
        {/* ✅ Enhanced Header with Actions */}
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="bg-white/80 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-lg"
          >
            <Share2 className="w-5 h-5 text-gray-700" />
          </Button>
          
          {/* ✅ Favorite Button in Modal Header */}
          <FavoriteButton
            room={roomForFavorite}
            variant="floating"
            size="md"
            className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg relative top-0 right-0"
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="bg-white/80 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-lg"
          >
            <X className="w-5 h-5 text-gray-700" />
          </Button>
        </div>

        <CardContent className="p-0 overflow-y-auto max-h-[90vh]">
          {/* Image Gallery */}
          <div className="relative">
            <div className="aspect-[16/10] bg-gray-200 relative overflow-hidden">
              <img
                src={images[currentImageIndex]}
                alt={`${room.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 backdrop-blur-sm"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-4 flex space-x-2">
                {images.slice(0, 5).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-white shadow-lg'
                        : 'border-white/50 hover:border-white'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                {images.length > 5 && (
                  <div className="w-12 h-12 rounded-lg bg-black/50 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center text-white text-xs font-semibold">
                    +{images.length - 5}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Room Details */}
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{room.name}</h2>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="text-lg">{room.location?.city || room.location?.wing || 'Unknown Location'}</span>
                </div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold">{room.ratings?.average?.toFixed(1) || '4.5'}</span>
                    <span className="text-gray-500">({room.ratings?.count || 0} reviews)</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-600 font-semibold px-3 py-1">
                    {room.type || 'Standard'}
                  </Badge>
                </div>

                {/* ✅ Quick Action Buttons */}
                <div className="flex items-center space-x-3">
                  <FavoriteButton
                    room={roomForFavorite}
                    variant="inline"
                    showText={true}
                    className="flex-shrink-0"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </Button>
                </div>
              </div>
              
              <div className="text-right ml-6">
                <div className="text-3xl font-bold text-blue-600">
                  ₹{room.rentperday?.toLocaleString() || '0'}
                </div>
                <div className="text-gray-500 mb-2">per night</div>
                <div className="text-sm text-gray-500">+ taxes & fees</div>
              </div>
            </div>

            {/* ✅ Enhanced Room Features Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Room Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-600" />
                    <span>Up to {room.maxcount || 2} guests</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Bed className="w-5 h-5 text-gray-600" />
                    <span>{room.type === 'Suite' ? 'King Size Bed' : room.type === 'Deluxe' ? 'Queen Size Bed' : 'Double Bed'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Bath className="w-5 h-5 text-gray-600" />
                    <span>Private Bathroom</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <span>24/7 Room Service</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Amenities</h3>
                <div className="grid grid-cols-1 gap-3">
                  {amenities.filter(amenity => amenity.available).map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <amenity.icon className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About This Room</h3>
              <p className="text-gray-600 leading-relaxed">
                {room.description || `Experience comfort and luxury in our ${room.type || 'Standard'} room. This well-appointed space features modern amenities and elegant furnishings to ensure a memorable stay. Perfect for both business and leisure travelers seeking quality accommodation with exceptional service and attention to detail.`}
              </p>
            </div>

            {/* ✅ Policies Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Policies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Check-in/Check-out</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Check-in: 3:00 PM</p>
                    <p>Check-out: 11:00 AM</p>
                    <p>Early check-in available (subject to availability)</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cancellation</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Free cancellation up to 24 hours before arrival</p>
                    <p>No-show charges may apply</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <Button
                onClick={handleBookNow}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Now</span>
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-2 border-gray-300 hover:border-blue-500 py-3 text-lg font-semibold rounded-lg"
              >
                Close
              </Button>
            </div>

            {/* ✅ Contact Information */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                Questions about this room? Contact us at{' '}
                <span className="font-semibold text-blue-600">
                  {room.phonenumber || '+91 98765 43210'}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
