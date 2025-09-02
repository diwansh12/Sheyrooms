import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button.tsx";
import { Input } from "../Components/ui/input.tsx";
import { Card, CardContent } from "../Components/ui/card.tsx";
import { Badge } from "../Components/ui/badge.tsx";
import { useRooms } from "../hooks/useRooms.ts";
import { Room } from "../types/index.ts";
import {
  Search,
  MapPin,
  Star,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Dumbbell,
  Map,
  SlidersHorizontal,
  ChevronDown,
  Heart,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Award,
  Calendar,
  Users,
  ArrowRight,
  Eye,
  Bookmark,
  ChevronRight,
  Phone,
  Clock,
  Shield,
  Menu,
  X,
  ChevronLeft
} from "lucide-react";
import { FavoriteButton } from "../Components/FavoriteButton.tsx";
import { ImageWithFallback } from '../Components/figma/ImageWithFallback.tsx';
import { useWishlist } from '../hooks/useWishlist.tsx';
import RoomDetailsModal from '../Components/RoomDetailsModal.tsx';

// Enhanced Image URL Conversion Function
const getImageUrlAsString = (imageData: any): string => {
  if (!imageData) {
    return 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop';
  }
  
  if (typeof imageData === 'string' && imageData.trim() !== '') {
    return imageData;
  }
  
  if (Array.isArray(imageData)) {
    for (const item of imageData) {
      const url = getImageUrlAsString(item);
      if (url && !url.includes('unsplash.com')) {
        return url;
      }
    }
    if (imageData.length > 0) {
      return String(imageData[0]) || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop';
    }
  }
  
  if (typeof imageData === 'object' && imageData !== null) {
    if (imageData.url && typeof imageData.url === 'string') return imageData.url;
    if (imageData.src && typeof imageData.src === 'string') return imageData.src;
    if (imageData.href && typeof imageData.href === 'string') return imageData.href;
    if (imageData.default && typeof imageData.default === 'string') return imageData.default;
    
    const keys = Object.keys(imageData);
    if (keys.every(key => !isNaN(Number(key)))) {
      const chars = [];
      for (let i = 0; i < keys.length; i++) {
        if (imageData[i] !== undefined) {
          chars.push(imageData[i]);
        }
      }
      const url = chars.join('');
      if (url && url.startsWith('http')) {
        return url;
      }
    }
    
    try {
      const stringified = String(imageData);
      if (stringified.startsWith('http')) {
        return stringified;
      }
    } catch (e) {
      // Ignore conversion errors
    }
  }
  
  return 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop';
};

// Enhanced Image Component
interface EnhancedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const EnhancedImageWithFallback: React.FC<EnhancedImageProps> = ({ 
  src, 
  alt, 
  fallbackSrc = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop',
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
};

// Define interfaces
interface ExploreProperty {
  id: string;
  name: string;
  locationDisplay: string;
  description: string;
  pricePerNight: number;
  rating: number;
  image: string;
  categoryType: 'hotel' | 'apartment' | 'resort';
  _id: string;
  type?: string;
  maxcount?: number;
  imageurls?: any[];
  rentperday?: number;
  displayPrice?: number;
  ratings?: { average?: number; count?: number };
  location?: any;
  createdAt?: string;
  originalRoom: Room;
}

interface Destination {
  id: string;
  name: string;
  image: string;
  propertyCount: number;
  startingPrice: number;
  description: string;
  popular?: boolean;
}

interface Collection {
  id: string;
  title: string;
  description: string;
  image: string;
  properties: Room[];
  badge?: string;
}

export default function Explorescreen() {
  const navigate = useNavigate();
  const { rooms = [], loading: roomsLoading } = useRooms();
   const { items } = useWishlist();
  
  // ✅ Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'any' | 'hotel' | 'apartment' | 'resort'>('any');
  const [priceRange, setPriceRange] = useState({ min: 1000, max: 5000 });
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedRating, setSelectedRating] = useState<'any' | '3.5+' | '4.0+' | '4.5+'>('any');
  const [showMap, setShowMap] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'price' | 'rating' | 'newest'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal state
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Popular Destinations Data
  const popularDestinations: Destination[] = [
    {
      id: 'mumbai',
      name: 'Mumbai',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop',
      propertyCount: 150,
      startingPrice: 2500,
      description: 'Commercial capital with luxury hotels',
      popular: true
    },
    {
      id: 'delhi',
      name: 'New Delhi',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop',
      propertyCount: 120,
      startingPrice: 2000,
      description: 'Historic charm meets modern comfort'
    },
    {
      id: 'bangalore',
      name: 'Bangalore',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop',
      propertyCount: 95,
      startingPrice: 1800,
      description: 'Tech hub with contemporary stays'
    },
    {
      id: 'goa',
      name: 'Goa',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop',
      propertyCount: 80,
      startingPrice: 3000,
      description: 'Beach resorts and coastal retreats',
      popular: true
    }
  ];

  // Property Categories
  const propertyCategories = [
    {
      id: 'luxury',
      title: 'Luxury Hotels',
      description: 'Premium accommodations with world-class amenities',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop',
      count: 45,
      startingPrice: 5000
    },
    {
      id: 'business',
      title: 'Business Hotels',
      description: 'Perfect for corporate travelers and meetings',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300&h=200&fit=crop',
      count: 60,
      startingPrice: 3000
    },
    {
      id: 'family',
      title: 'Family Friendly',
      description: 'Spacious rooms ideal for family vacations',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=300&h=200&fit=crop',
      count: 35,
      startingPrice: 2500
    },
    {
      id: 'budget',
      title: 'Budget Stays',
      description: 'Comfortable accommodation at great prices',
      image: 'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=300&h=200&fit=crop',
      count: 80,
      startingPrice: 1200
    }
  ];

  // Collections
  const collections: Collection[] = [
    {
      id: 'trending',
      title: 'Trending Now',
      description: 'Most booked properties this month',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=250&fit=crop',
      properties: Array.isArray(rooms) ? rooms.slice(0, 6) : [],
      badge: 'Hot'
    },
    {
      id: 'highly-rated',
      title: 'Highly Rated',
      description: 'Top-rated properties by our guests',
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=250&fit=crop',
      properties: Array.isArray(rooms) ? rooms.filter(room => (room.ratings?.average || 4.2) >= 4.0).slice(0, 6) : [],
      badge: 'Top Rated'
    },
    {
      id: 'new',
      title: 'Recently Added',
      description: 'Newest properties on our platform',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=250&fit=crop',
      properties: Array.isArray(rooms) ? rooms.slice(-6) : [],
      badge: 'New'
    }
  ];

  // Transform room data
  const exploreProperties: ExploreProperty[] = Array.isArray(rooms) ? rooms.map((room: Room) => {
    let imageUrl = '';
    
    if (room.imageurls && Array.isArray(room.imageurls) && room.imageurls.length > 0) {
      imageUrl = getImageUrlAsString(room.imageurls[0]);
    }
    
    if (!imageUrl || imageUrl.includes('unsplash.com')) {
      imageUrl = getImageUrlAsString(room.primaryImage);
    }
    
    if (!imageUrl || imageUrl.includes('unsplash.com')) {
      const imageProps = ['image', 'imageUrl', 'photo', 'picture', 'thumbnail'];
      for (const prop of imageProps) {
        if ((room as any)[prop]) {
          const testUrl = getImageUrlAsString((room as any)[prop]);
          if (testUrl && !testUrl.includes('unsplash.com')) {
            imageUrl = testUrl;
            break;
          }
        }
      }
    }

    return {
      id: room._id,
      _id: room._id,
      name: room.name,
      locationDisplay: room.location?.city || room.location?.wing || room.address || "Premium Location",
      description: room.description || "Modern amenities and comfortable stay",
      pricePerNight: room.displayPrice || room.rentperday || 0,
      rating: room.ratings?.average || 4.5,
      image: imageUrl,
      categoryType: (
        room.type?.toLowerCase() === 'deluxe' ? 'hotel' :
        room.type?.toLowerCase() === 'suite' ? 'resort' :
        room.type?.toLowerCase() === 'presidential' ? 'resort' :
        'hotel'
      ) as 'hotel' | 'apartment' | 'resort',
      type: room.type,
      maxcount: room.maxcount,
      imageurls: room.imageurls,
      rentperday: room.rentperday,
      displayPrice: room.displayPrice,
      ratings: room.ratings,
      location: room.location,
      createdAt: room.createdAt,
      originalRoom: room
    };
  }) : [];

  // Apply filters
  const filteredProperties = exploreProperties.filter(property => {
    if (selectedType !== 'any' && property.categoryType !== selectedType) return false;
    if (property.pricePerNight < priceRange.min || property.pricePerNight > priceRange.max) return false;
    if (searchQuery && !property.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !property.locationDisplay.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedRating !== 'any') {
      const minRating = parseFloat(selectedRating.replace('+', ''));
      if (property.rating < minRating) return false;
    }
    return true;
  });

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.pricePerNight - b.pricePerNight;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      default:
        return 0;
    }
  });

  // Modal handlers
  const handleRoomView = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  // Navigation handlers
  const handleDestinationClick = (destination: Destination) => {
    setSearchQuery(destination.name);
    document.getElementById('properties-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategoryClick = (category: any) => {
    if (category.id === 'luxury') {
      setPriceRange({ min: 4000, max: 10000 });
    } else if (category.id === 'budget') {
      setPriceRange({ min: 1000, max: 2500 });
    }
    document.getElementById('properties-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickBook = (room: Room) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };
    
    navigate(`/book/${room._id}/${formatDate(today)}/${formatDate(tomorrow)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Enhanced Professional Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate('/')} 
                  className="text-blue-600 font-bold text-xl hover:text-blue-700 transition-colors"
                >
                  SheyRooms
                </button>
              </div>
              
              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                <button 
                  onClick={() => navigate('/home')} 
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Home
                </button>
                <button 
                  className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg"
                >
                  Explore
                </button>
                <button 
                  onClick={() => navigate('/experiences')} 
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Experiences
                </button>
              </nav>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="hidden sm:flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm">24/7 Support</span>
              </Button>
              
              {/* Mobile sidebar toggle */}
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex relative">
        {/* ✅ Enhanced Collapsible Sidebar */}
        <div className={`${
          isSidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 ease-in-out bg-white border-r border-gray-200 h-screen sticky top-16 overflow-hidden z-40`}>
          <div className={`${isSidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 p-6 h-full overflow-y-auto`}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSelectedType('any');
                    setSearchQuery('');
                    setSelectedRating('any');
                    setPriceRange({ min: 1000, max: 5000 });
                  }}
                  className="text-xs text-gray-500 hover:text-blue-600"
                >
                  Clear All
                </Button>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Search</label>
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="City, area, landmark"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 text-sm border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                />
              </div>
            </div>

            {/* Property Type */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Property Type</label>
              <div className="space-y-1">
                {[
                  { value: 'any', label: 'Any Type' },
                  { value: 'hotel', label: 'Hotels' },
                  { value: 'apartment', label: 'Apartments' },
                  { value: 'resort', label: 'Resorts' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value as any)}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                      selectedType === type.value
                        ? 'bg-blue-50 text-blue-600 border-2 border-blue-200 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Price per night</label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                      className="h-9 text-sm border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                    />
                  </div>
                  <span className="text-xs text-gray-400">to</span>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 10000 }))}
                      className="h-9 text-sm border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[
                    { label: 'Budget', min: 1000, max: 2500 },
                    { label: 'Mid-range', min: 2500, max: 4000 },
                    { label: 'Luxury', min: 4000, max: 8000 },
                    { label: 'Premium', min: 8000, max: 15000 }
                  ].map((range) => (
                    <button
                      key={range.label}
                      onClick={() => setPriceRange({ min: range.min, max: range.max })}
                      className="px-3 py-1.5 text-xs border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Minimum Rating</label>
              <div className="space-y-1">
                {[
                  { value: 'any', label: 'Any Rating' },
                  { value: '3.5+', label: '3.5+ Stars' },
                  { value: '4.0+', label: '4.0+ Stars' },
                  { value: '4.5+', label: '4.5+ Stars' }
                ].map((rating) => (
                  <button
                    key={rating.value}
                    onClick={() => setSelectedRating(rating.value as any)}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-200 flex items-center ${
                      selectedRating === rating.value
                        ? 'bg-blue-50 text-blue-600 border-2 border-blue-200 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                    {rating.label}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm font-medium rounded-lg shadow-lg"
            >
              Apply filters ({sortedProperties.length} properties)
            </Button>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* ✅ Main Content */}
        <div className="flex-1 min-w-0">
          {/* Hero Search Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12 lg:py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-3xl lg:text-4xl font-bold mb-3 lg:mb-4">Explore Amazing Stays</h1>
              <p className="text-lg lg:text-xl mb-6 lg:mb-8 opacity-90">Discover unique places to stay around the world</p>
              
              <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="flex-1 w-full relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Where do you want to go?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 lg:h-14 text-base lg:text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                    />
                  </div>
                  <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white h-12 lg:h-14 px-6 lg:px-8 font-semibold rounded-xl">
                    Explore Now
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Destinations */}
          <div className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Popular Destinations</h2>
                  <p className="text-sm lg:text-base text-gray-600">Discover the most loved cities by travelers</p>
                </div>
                <Button variant="outline" className="flex items-center space-x-2 text-sm">
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {popularDestinations.map((destination) => (
                  <Card
                    key={destination.id}
                    className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg"
                    onClick={() => handleDestinationClick(destination)}
                  >
                    <div className="relative">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-40 lg:h-48 object-cover"
                      />
                      {destination.popular && (
                        <Badge className="absolute top-3 right-3 bg-orange-500 text-white text-xs">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3 lg:p-4">
                      <h3 className="font-bold text-base lg:text-lg text-gray-900 mb-1">{destination.name}</h3>
                      <p className="text-gray-600 text-xs lg:text-sm mb-2 lg:mb-3">{destination.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-600 font-semibold text-sm lg:text-base">₹{destination.startingPrice.toLocaleString()}+</span>
                        <span className="text-gray-500 text-xs lg:text-sm">{destination.propertyCount} properties</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Property Categories */}
          <div className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8 lg:mb-12">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">Browse by Category</h2>
                <p className="text-sm lg:text-base text-gray-600 max-w-2xl mx-auto">Find the perfect accommodation type for your travel style and preferences</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {propertyCategories.map((category) => (
                  <Card
                    key={category.id}
                    className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="relative">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-32 lg:h-40 object-cover"
                      />
                    </div>
                    <CardContent className="p-3 lg:p-4">
                      <h3 className="font-bold text-base lg:text-lg text-gray-900 mb-2">{category.title}</h3>
                      <p className="text-gray-600 text-xs lg:text-sm mb-2 lg:mb-3">{category.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-600 font-semibold text-sm lg:text-base">From ₹{category.startingPrice.toLocaleString()}</span>
                        <span className="text-gray-500 text-xs lg:text-sm">{category.count} options</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Collections */}
          <div className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 lg:mb-8">Curated Collections</h2>
              
              <div className="space-y-8 lg:space-y-12">
                {collections.map((collection) => (
                  <div key={collection.id}>
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900">{collection.title}</h3>
                        {collection.badge && (
                          <Badge className="bg-orange-500 text-white text-xs">{collection.badge}</Badge>
                        )}
                      </div>
                      <Button variant="outline" className="flex items-center space-x-2 text-sm">
                        <span>View All ({collection.properties?.length || 0})</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm lg:text-base text-gray-600 mb-4 lg:mb-6">{collection.description}</p>
                    
                    {collection.properties && collection.properties.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                        {collection.properties.slice(0, 6).map((room) => {
                          let roomImageUrl = '';
                          
                          if (room.imageurls && Array.isArray(room.imageurls) && room.imageurls.length > 0) {
                            roomImageUrl = getImageUrlAsString(room.imageurls[0]);
                          }
                          
                          if (!roomImageUrl || roomImageUrl.includes('unsplash.com')) {
                            roomImageUrl = getImageUrlAsString(room.primaryImage);
                          }
                          
                          if (!roomImageUrl || roomImageUrl.includes('unsplash.com')) {
                            const imageProps = ['image', 'imageUrl', 'photo', 'picture', 'thumbnail'];
                            for (const prop of imageProps) {
                              if ((room as any)[prop]) {
                                const testUrl = getImageUrlAsString((room as any)[prop]);
                                if (testUrl && !testUrl.includes('unsplash.com')) {
                                  roomImageUrl = testUrl;
                                  break;
                                }
                              }
                            }
                          }
                          
                          const roomForFavorite = {
                          id: room._id,
                          name: room.name,
                          location: room.location?.city || 'Premium Location',
                          pricePerNight: room.rentperday || 0,
                          image: roomImageUrl,
                          rating: room.ratings?.average || 4.5,
                          type: room.type || 'hotel'
                        };
                        
                        return (
                          <Card
                            key={room._id}
                            className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg hover:-translate-y-1"
                          >
                            <div className="relative">
                              <img
                                src={roomImageUrl}
                                alt={room.name}
                                className="w-full h-40 lg:h-48 object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop';
                                }}
                              />
                              
                              {/* ✅ Rating Badge */}
                              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-xs font-semibold">{(room.ratings?.average || 4.5).toFixed(1)}</span>
                                </div>
                              </div>
                              
                              {/* ✅ Enhanced Favorite Button */}
                              <FavoriteButton
                                room={roomForFavorite}
                                variant="floating"
                                size="md"
                                className="top-3 left-3"
                              />
                            </div>
                            
                            <CardContent className="p-3 lg:p-4">
                              <h4 className="font-bold text-base lg:text-lg text-gray-900 mb-2">{room.name}</h4>
                              <div className="flex items-center text-gray-600 mb-2 lg:mb-3">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="text-xs lg:text-sm">{room.location?.city || 'Premium Location'}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-base lg:text-lg font-bold text-blue-600">₹{(room.rentperday || 0).toLocaleString()}</span>
                                  <span className="text-gray-500 text-xs ml-1">per night</span>
                                </div>
                                <div className="flex space-x-1 lg:space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRoomView(room)}
                                    className="border-gray-300 hover:border-blue-500 px-2 py-1 text-xs"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleQuickBook(room)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-xs"
                                  >
                                    Book
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    ) : (
                      <div className="text-center py-6 lg:py-8 bg-gray-50 rounded-lg">
                        <p className="text-sm lg:text-base text-gray-600">No properties available in this collection yet.</p>
                      </div>  
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* All Properties Section */}
           <div id="properties-section" className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 lg:mb-8 space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">All Properties</h2>
                <p className="text-sm lg:text-base text-gray-600">{sortedProperties.length} properties found</p>
              </div>
              
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none px-3 py-2"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none px-3 py-2"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm min-w-[140px]"
                >
                  <option value="popular">Sort: Popular</option>
                  <option value="price">Sort: Price (Low to High)</option>
                  <option value="rating">Sort: Highest Rated</option>
                  <option value="newest">Sort: Newest</option>
                </select>

                <Button
                  variant="outline"
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center space-x-2 text-sm whitespace-nowrap"
                >
                  <Map className="w-4 h-4" />
                  <span className="hidden sm:inline">{showMap ? 'Hide' : 'Show'} Map</span>
                </Button>
              </div>
            </div>

            {roomsLoading ? (
              <div className="flex items-center justify-center h-48 lg:h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 lg:h-12 w-8 lg:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm lg:text-base text-gray-600">Loading amazing properties...</p>
                </div>
              </div>
            ) : (
              <div className={`grid gap-4 lg:gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {sortedProperties.length > 0 ? (
                  sortedProperties.map((property) => {
                    // ✅ Create room object for FavoriteButton
                    const roomForFavorite = {
                      id: property.id,
                      name: property.name,
                      location: property.locationDisplay,
                      pricePerNight: property.pricePerNight,
                      image: property.image,
                      rating: property.rating,
                      type: property.type || 'hotel'
                    };

                    return (
                      <Card
                        key={property.id}
                        className={`overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg hover:-translate-y-1 ${
                          viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                        }`}
                      >
                        <div className={`relative ${viewMode === 'list' ? 'sm:w-80 sm:flex-shrink-0' : ''}`}>
                          <EnhancedImageWithFallback
                            src={property.image}
                            alt={property.name}
                            className={`object-cover ${
                              viewMode === 'list' ? 'w-full h-48 sm:h-full' : 'w-full h-40 lg:h-48'
                            }`}
                          />
                          
                          {/* ✅ Rating Badge */}
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs font-semibold">{property.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          
                          {/* ✅ Enhanced Favorite Button */}
                          <FavoriteButton
                            room={roomForFavorite}
                            variant="floating"
                            size="md"
                            className="top-3 left-3"
                          />
                        </div>
                        
                        <CardContent className={`p-4 lg:p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-base lg:text-lg text-gray-900 mb-1">{property.name}</h3>
                              <div className="flex items-center text-gray-600 mb-2">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="text-xs lg:text-sm">{property.locationDisplay}</span>
                              </div>
                              {property.description && (
                                <p className="text-gray-600 text-xs lg:text-sm mb-3 line-clamp-2">{property.description}</p>
                              )}
                            </div>
                            {viewMode === 'list' && (
                              <div className="text-right ml-4 hidden sm:block">
                                <div className="text-xl lg:text-2xl font-bold text-blue-600">₹{property.pricePerNight.toLocaleString()}</div>
                                <div className="text-gray-500 text-xs">per night</div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 mb-4 text-xs lg:text-sm">
                            <div className="flex items-center space-x-1 text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>Up to {property.maxcount || 2} guests</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-600">
                              <Wifi className="w-4 h-4" />
                              <span>Free WiFi</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            {(viewMode === 'grid' || viewMode === 'list') && (
                              <div className={viewMode === 'list' ? 'sm:hidden' : ''}>
                                <span className="text-base lg:text-lg font-bold text-blue-600">₹{property.pricePerNight.toLocaleString()}</span>
                                <span className="text-gray-500 text-xs ml-1">per night</span>
                              </div>
                            )}
                            <div className="flex space-x-2 ml-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRoomView(property.originalRoom)}
                                className="border-gray-300 hover:border-blue-500 text-xs px-3 py-2"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleQuickBook(property.originalRoom)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2"
                              >
                                Book Now
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                  ) : (
                    <div className="col-span-full text-center py-12 lg:py-16">
                      <div className="max-w-md mx-auto">
                        <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                        <p className="text-sm lg:text-base text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
                        <Button
                          onClick={() => {
                            setSelectedType('any');
                            setSearchQuery('');
                            setSelectedRating('any');
                            setPriceRange({ min: 1000, max: 5000 });
                          }}
                          variant="outline"
                          className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Trust & Safety Section */}
          <div className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 lg:mb-8">Travel with Confidence</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 lg:w-16 h-12 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 lg:mb-4">
                    <Shield className="w-6 lg:w-8 h-6 lg:h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Verified Properties</h3>
                  <p className="text-sm lg:text-base text-gray-600">All properties are verified for your safety and comfort</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 lg:w-16 h-12 lg:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 lg:mb-4">
                    <Clock className="w-6 lg:w-8 h-6 lg:h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
                  <p className="text-sm lg:text-base text-gray-600">Round-the-clock customer support for peace of mind</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 lg:w-16 h-12 lg:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3 lg:mb-4">
                    <Award className="w-6 lg:w-8 h-6 lg:h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Best Price Guarantee</h3>
                  <p className="text-sm lg:text-base text-gray-600">We guarantee the best prices for your perfect stay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Details Modal */}
      <RoomDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        room={selectedRoom}
      />
    </div>
  );
}
