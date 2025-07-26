// components/room/ResponsiveRoomCard.jsx - Mobile-Optimized Room Card
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, MapPin, Users, Wifi, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import Button from '../ui/Button';

const ResponsiveRoomCard = ({ room, fromdate, todate, isFavorite, onFavoriteToggle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === room.imageurls.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? room.imageurls.length - 1 : prev - 1
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden mb-4"
      >
        {/* Mobile Image Carousel */}
        <div className="relative h-48">
          <img
            src={room.imageurls[currentImageIndex]?.url || room.imageurls[currentImageIndex]}
            alt={room.name}
            className="w-full h-full object-cover"
          />
          
          {/* Image Navigation */}
          {room.imageurls.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-lg"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-lg"
              >
                <ChevronRight size={16} />
              </button>
              
              {/* Dots Indicator */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {room.imageurls.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex space-x-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFavoriteToggle?.(room._id, !isFavorite);
              }}
              className={`p-2 rounded-full shadow-lg ${
                isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-700'
              }`}
            >
              <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3">
            {room.discountPercent > 0 && (
              <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                {room.discountPercent}% OFF
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{room.name}</h3>
            {room.ratings?.average > 0 && (
              <div className="flex items-center bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold ml-2">
                <Star size={10} className="mr-1" fill="currentColor" />
                {room.ratings.average.toFixed(1)}
              </div>
            )}
          </div>

          <div className="flex items-center text-xs text-gray-600 mb-2">
            <MapPin size={12} className="mr-1" />
            <span>{room.type} Room • Up to {room.maxcount} guests</span>
          </div>

          <div className="flex items-center space-x-3 text-xs text-gray-500 mb-3">
            <div className="flex items-center">
              <Wifi size={12} className="mr-1" />
              <span>WiFi</span>
            </div>
            {room.amenities?.slice(0, 2).map((amenity, index) => (
              <span key={index}>• {amenity.name}</span>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-1">
                {room.discountPercent > 0 && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(room.originalPrice)}
                  </span>
                )}
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(room.currentPrice || room.rentperday)}
                </span>
              </div>
              <p className="text-xs text-gray-500">per night</p>
            </div>
            
            {fromdate && todate && (
              <Link to={`/book/${room._id}/${fromdate}/${todate}`}>
                <Button size="sm" className="px-4">
                  Book
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Tablet/Desktop version remains similar to previous implementation
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Desktop/Tablet layout */}
      {/* ... rest of the desktop implementation */}
    </motion.div>
  );
};

export default ResponsiveRoomCard;
