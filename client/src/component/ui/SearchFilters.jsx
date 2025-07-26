// components/ui/SearchFilters.jsx - Professional Search Component
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, Users, MapPin, SlidersHorizontal } from 'lucide-react';
import { DatePicker } from 'antd';
import moment from 'moment';
import Button from './Button';
import Card from './Card';

const { RangePicker } = DatePicker;

const SearchFilters = ({ onFiltersChange, loading }) => {
  const [filters, setFilters] = useState({
    destination: '',
    dates: null,
    guests: { adults: 2, children: 0 },
    priceRange: [1000, 25000],
    roomType: 'all',
    amenities: [],
    sortBy: 'price-low'
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);

  const roomTypes = [
    { value: 'all', label: 'All Room Types' },
    { value: 'Standard', label: 'Standard' },
    { value: 'Deluxe', label: 'Deluxe' },
    { value: 'Suite', label: 'Suite' },
    { value: 'Presidential', label: 'Presidential' }
  ];

  const amenitiesList = [
    { id: 'wifi', name: 'Free WiFi', icon: '📶' },
    { id: 'parking', name: 'Free Parking', icon: '🅿️' },
    { id: 'pool', name: 'Swimming Pool', icon: '🏊' },
    { id: 'gym', name: 'Fitness Center', icon: '💪' },
    { id: 'spa', name: 'Spa', icon: '🧘' },
    { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
    { id: 'bar', name: 'Bar', icon: '🍹' },
    { id: 'petFriendly', name: 'Pet Friendly', icon: '🐕' }
  ];

  const sortOptions = [
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];

  // Update parent component when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAmenityToggle = (amenityId) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleGuestChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      guests: { ...prev.guests, [type]: Math.max(0, value) }
    }));
  };

  const resetFilters = () => {
    setFilters({
      destination: '',
      dates: null,
      guests: { adults: 2, children: 0 },
      priceRange: [1000, 25000],
      roomType: 'all',
      amenities: [],
      sortBy: 'price-low'
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <Card className="overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Destination */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="inline mr-1" />
              Destination
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Where are you going?"
                value={filters.destination}
                onChange={(e) => handleFilterChange('destination', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          {/* Dates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Check-in / Check-out
            </label>
            <RangePicker
              format="DD MMM YYYY"
              value={filters.dates}
              onChange={(dates) => handleFilterChange('dates', dates)}
              className="w-full h-12"
              placeholder={['Check-in', 'Check-out']}
              disabledDate={(current) => current && current < moment().endOf('day')}
            />
          </div>

          {/* Guests */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users size={16} className="inline mr-1" />
              Guests
            </label>
            <button
              onClick={() => setShowGuestSelector(!showGuestSelector)}
              className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {filters.guests.adults + filters.guests.children} guest{filters.guests.adults + filters.guests.children !== 1 ? 's' : ''}
            </button>
            
            <AnimatePresence>
              {showGuestSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Adults</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleGuestChange('adults', filters.guests.adults - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                          disabled={filters.guests.adults <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{filters.guests.adults}</span>
                        <button
                          onClick={() => handleGuestChange('adults', filters.guests.adults + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Children</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleGuestChange('children', filters.guests.children - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                          disabled={filters.guests.children <= 0}
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{filters.guests.children}</span>
                        <button
                          onClick={() => handleGuestChange('children', filters.guests.children + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button
              variant="primary"
              size="lg"
              className="w-full h-12"
              loading={loading}
            >
              Search Hotels
            </Button>
          </div>
        </div>
      </Card>

      {/* Advanced Filters */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {loading ? 'Searching...' : 'Filter & Sort'}
        </h3>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            icon={<SlidersHorizontal size={16} />}
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
          >
            Reset
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Room Type */}
                <div>
                  <h4 className="font-medium mb-3">Room Type</h4>
                  <div className="space-y-2">
                    {roomTypes.map((type) => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="radio"
                          name="roomType"
                          value={type.value}
                          checked={filters.roomType === type.value}
                          onChange={(e) => handleFilterChange('roomType', e.target.value)}
                          className="mr-2"
                        />
                        {type.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-medium mb-3">Price Range (per night)</h4>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="1000"
                      max="25000"
                      step="500"
                      value={filters.priceRange[1]}
                      onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₹{filters.priceRange[0].toLocaleString()}</span>
                      <span>₹{filters.priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="font-medium mb-3">Amenities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {amenitiesList.map((amenity) => (
                      <label key={amenity.id} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity.id)}
                          onChange={() => handleAmenityToggle(amenity.id)}
                          className="mr-2"
                        />
                        <span className="mr-1">{amenity.icon}</span>
                        {amenity.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium mb-3">Sort by</h4>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchFilters;
