// components/room/RoomCard.jsx - Enhanced Room Card
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, MapPin, Users, Wifi, Car, Coffee, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import Badge from '../../Components/ui/Badge';

const RoomCard = ({ room, fromdate, todate, onFavoriteToggle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const amenityIcons = {
    wifi: <Wifi size={16} />,
    parking: <Car size={16} />,
    breakfast: <Coffee size={16} />
  };

  const handleFavoriteClick = () => {
    setIsFavorited(!isFavorited);
    onFavoriteToggle?.(room._id, !isFavorited);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card className="overflow-hidden group">
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden rounded-t-xl">
        <motion.img
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          src={room.imageurls[currentImageIndex]?.url || room.imageurls[0]}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Image Navigation */}
        {room.imageurls.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {room.imageurls.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
              />
            ))}
          </div>
        )}

        {/* Top-right actions */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isFavorited ? 'bg-red-500 text-white' : 'bg-white/20 text-white'
              }`}
          >
            <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white"
          >
            <Share2 size={18} />
          </motion.button>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex space-x-2">
          {room.discountPercent > 0 && (
            <Badge variant="danger">{room.discountPercent}% OFF</Badge>
          )}
          <Badge variant="success">Available</Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin size={14} className="mr-1" />
              <span>{room.location?.wing} Wing, Floor {room.location?.floor}</span>
            </div>
          </div>

          {room.ratings?.average > 0 && (
            <div className="flex items-center bg-green-500 text-white px-2 py-1 rounded-lg text-sm font-semibold">
              <Star size={14} className="mr-1" fill="currentColor" />
              {room.ratings.average.toFixed(1)}
            </div>
          )}
        </div>

        {/* Room Features */}
        <div className="flex items-center text-sm text-gray-600 mb-4 space-x-4">
          <div className="flex items-center">
            <Users size={16} className="mr-1" />
            <span>Up to {room.maxcount} guests</span>
          </div>
          <div className="flex items-center space-x-2">
            {room.amenities?.slice(0, 3).map((amenity, index) => (
              <span key={index} className="flex items-center">
                {amenityIcons[amenity.name.toLowerCase()] || <div className="w-4 h-4 bg-gray-400 rounded" />}
              </span>
            ))}
            {room.amenities?.length > 3 && (
              <span className="text-xs text-gray-500">+{room.amenities.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {room.shortDescription || room.description.substring(0, 100) + '...'}
        </p>

        {/* Pricing */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center space-x-2">
              {room.discountPercent > 0 && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(room.originalPrice)}
                </span>
              )}
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(room.currentPrice || room.rentperday)}
              </span>
            </div>
            <p className="text-sm text-gray-500">per night</p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">Total for stay</p>
            <p className="font-semibold text-lg">
              {fromdate && todate ? formatPrice(room.currentPrice * calculateNights(fromdate, todate)) : 'Select dates'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Link
            to={`/rooms/${room.slug || room._id}`}
            className="flex-1"
          >
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>

          {fromdate && todate && (
            <Link
              to={`/book/${room._id}/${fromdate}/${todate}`}
              className="flex-2"
            >
              <Button variant="primary" className="w-full">
                Book Now
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
};

// Helper function
const calculateNights = (fromdate, todate) => {
  const from = new Date(fromdate);
  const to = new Date(todate);
  return Math.ceil((to - from) / (1000 * 60 * 60 * 24));
};

export default RoomCard;
