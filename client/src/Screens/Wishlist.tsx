// src/Components/Wishlist.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button.tsx";
import { Input } from "../Components/ui/input.tsx";
import { Card, CardContent } from "../Components/ui/card.tsx";
import { Badge } from "../Components/ui/badge.tsx";
import { 
  Search,
  MapPin,
  Star,
  Heart,
  ArrowUpDown,
  X,
  ChevronRight,
  Filter,
  Calendar,
  Users,
  Wifi,
  Car,
  Coffee,
  Shield,
  Clock,
  Award,
  ChevronDown,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  TrendingUp,
  Eye,
  Share2,
  Download,
  Menu,
  ArrowLeft
} from "lucide-react";
import { ImageWithFallback } from '../Components/figma/ImageWithFallback.tsx';
import  RoomDetailsModal  from '../Components/RoomDetailsModal.tsx';
import { RemoveModal } from '../Components/RemoveModal.tsx';
import { useWishlist, WishlistItem } from '../hooks/useWishlist.tsx';
import { Room } from '../types/index.ts';

interface WishlistProps {
  onGoToExplore: () => void;
}

// ✅ Price formatting function for INR (no conversion needed)
const formatPriceINR = (price: number | undefined): string => {
  if (!price || typeof price !== 'number' || isNaN(price)) {
    return '₹0';
  }
  return `₹${price.toLocaleString()}`;
};

// ✅ Safe date formatting function
const formatAddedDate = (addedAt?: string): string => {
  if (!addedAt) return 'Recently';
  try {
    const date = new Date(addedAt);
    return date.toLocaleDateString();
  } catch {
    return 'Recently';
  }
};

// ✅ Enhanced sort options
type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'rating' | 'name';

export default function Wishlistscreen({ onGoToExplore }: WishlistProps) {
  const navigate = useNavigate();
  const { items, loading, error, remove } = useWishlist();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // ✅ Enhanced state management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<WishlistItem | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [priceFilter, setPriceFilter] = useState<'under12500' | 'all'>('all');
  const [ratingFilter, setRatingFilter] = useState<'4.5+' | '4.0+' | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ✅ Enhanced filtering and sorting with no currency conversion
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = items.filter(property => {
      // Search filter
      if (searchQuery && !property.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !property.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Price filter (already in INR)
      if (priceFilter === 'under12500' && property.pricePerNight >= 12500) return false;
      
      // Rating filter
      if (ratingFilter === '4.5+' && (property.rating ?? 0) < 4.5) return false;
      if (ratingFilter === '4.0+' && (property.rating ?? 0) < 4.0) return false;
      
      return true;
    });

    // ✅ Sort the filtered results with safe addedAt handling
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.pricePerNight - b.pricePerNight;
        case 'price-high':
          return b.pricePerNight - a.pricePerNight;
        case 'rating':
          return (b.rating ?? 0) - (a.rating ?? 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'oldest':
          return new Date((a as any).addedAt || '1970-01-01').getTime() - new Date((b as any).addedAt || '1970-01-01').getTime();
        case 'newest':
        default:
          return new Date((b as any).addedAt || new Date().toISOString()).getTime() - new Date((a as any).addedAt || new Date().toISOString()).getTime();
      }
    });
  }, [items, searchQuery, priceFilter, ratingFilter, sortBy]);

  // ✅ Sort options configuration
  const sortOptions = [
    { value: 'newest', label: 'Recently Added', icon: TrendingUp },
    { value: 'oldest', label: 'Oldest First', icon: Clock },
    { value: 'price-low', label: 'Price: Low to High', icon: SortAsc },
    { value: 'price-high', label: 'Price: High to Low', icon: SortDesc },
    { value: 'rating', label: 'Highest Rated', icon: Star },
    { value: 'name', label: 'Name (A-Z)', icon: Filter },
  ];

  const currentSortOption = sortOptions.find(opt => opt.value === sortBy);

  // ✅ Enhanced handlers
  const handleRemoveClick = (property: WishlistItem) => {
    setSelectedProperty(property);
    setShowRemoveModal(true);
  };

  const handleRemoveConfirm = async () => {
    if (!selectedProperty) return;
    try {
      await remove(selectedProperty.id);
    } finally {
      setSelectedProperty(null);
      setShowRemoveModal(false);
    }
  };

  const handleBookNow = (property: WishlistItem) => {
    // Navigate to booking page
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };
    
    navigate(`/book/${property.id}/${formatDate(today)}/${formatDate(tomorrow)}`);
  };

  const handleViewDetails = (property: WishlistItem) => {
    // Convert WishlistItem to Room format for the modal
    const roomForModal: Room = {
      _id: property.id,
      id: property.id,
      name: property.name,
      address: property.location || 'Premium Location',
      maxcount: 4,
      phonenumber: '+91 98765 43210',
      rentperday: property.pricePerNight, // Already in INR
      imageurls: [property.image],
      type: property.type === 'hotel' ? 'Standard' : 
            property.type === 'apartment' ? 'Deluxe' : 
            property.type === 'resort' ? 'Suite' : 'Standard',
      description: property.description || `Experience luxury in our ${property.type} accommodation.`,
      
      // ✅ Optional properties with defaults
      floor: 0,
      currentbookings: [],
      category: 'Mid-Range',
      shortDescription: `Comfortable ${property.type} accommodation`,
      amenities: [
        'Free WiFi',
        'Air Conditioning', 
        'Room Service',
        '24/7 Front Desk',
        'Housekeeping',
        'Complimentary Breakfast'
      ],
      roomFeatures: {
        bedType: 'Queen',
        roomSize: 25,
        maxOccupancy: 4,
        smokingAllowed: false,
        petFriendly: false,
        wifi: true,
        airConditioning: true,
        balcony: true,
        cityView: true
      },
      location: {
        city: property.location || 'Premium Location',
        state: 'India',
        floor: 0,
        wing: '',
        roomNumber: ''
      },
      availability: {
        isActive: true
      },
      policies: {
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
        checkInTime: '15:00',
        checkOutTime: '11:00',
        childPolicy: 'Children under 12 stay free',
        extraBedPolicy: 'Extra bed available for ₹1000 per night'
      },
      ratings: {
        average: property.rating || 4.0,
        count: Math.floor(Math.random() * 100) + 10
      },
      featured: false,
      isAvailable: true,
      isFavorite: true, // Since it's in wishlist
      
      // ✅ Required computed properties (already in INR)
      currentPrice: property.pricePerNight,
      primaryImage: property.image,
      displayPrice: property.pricePerNight,
      locationInfo: {
        city: property.location || 'Premium Location',
        state: 'India',
        floor: 0,
        wing: '',
        roomNumber: ''
      },
      
      // ✅ Optional computed properties
      amenitiesList: [
        'Free WiFi',
        'Air Conditioning', 
        'Room Service',
        '24/7 Front Desk'
      ]
    };

    setSelectedRoom(roomForModal);
    setIsModalOpen(true);
  };

  // ✅ Handle modal close
  const handleCloseModal = () => {
    setSelectedRoom(null);
    setIsModalOpen(false);
  };

  const handleShareWishlist = () => {
    console.log('Sharing wishlist...');
  };

  const handleExportWishlist = () => {
    console.log('Exporting wishlist...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Enhanced Professional Header with Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* ✅ Back Button to Home Screen */}
              <button 
                onClick={() => navigate('/home')}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200"
                aria-label="Back to Home"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Back to Home</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300" /> {/* Separator */}
              
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <button onClick={() => navigate('/')} className="text-blue-600 font-bold text-xl hover:text-blue-700 transition-colors">
                SheyRooms
              </button>
              
              <div className="flex items-center space-x-2 ml-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="font-semibold text-gray-900 text-lg">My Wishlist</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShareWishlist}
                className="hidden sm:flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportWishlist}
                className="hidden sm:flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* ✅ Enhanced Collapsible Sidebar */}
        <div className={`${
          isSidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 ease-in-out bg-white border-r border-gray-200 h-screen sticky top-16 overflow-hidden`}>
          <div className={`${isSidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 p-6 h-full overflow-y-auto`}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Quick Filters</h3>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors lg:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Rating Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Minimum Rating</label>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'Any Rating' },
                  { value: '4.0+', label: '4.0+ Stars' },
                  { value: '4.5+', label: '4.5+ Stars' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRatingFilter(option.value as any)}
                    className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-all duration-200 flex items-center ${
                      ratingFilter === option.value
                        ? 'bg-blue-50 text-blue-600 border-2 border-blue-200 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range</label>
              <div className="space-y-2">
                <button
                  onClick={() => setPriceFilter(prev => prev === 'under12500' ? 'all' : 'under12500')}
                  className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-all duration-200 ${
                    priceFilter === 'under12500'
                      ? 'bg-blue-50 text-blue-600 border-2 border-blue-200 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  Under ₹12,500 per night
                </button>
                <button
                  onClick={() => setPriceFilter('all')}
                  className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-all duration-200 ${
                    priceFilter === 'all'
                      ? 'bg-blue-50 text-blue-600 border-2 border-blue-200 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  All Prices
                </button>
              </div>
            </div>

            {/* Wishlist Stats */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Your Wishlist</h4>
              <p className="text-sm text-blue-700 mb-2">{items.length} saved properties</p>
              <p className="text-xs text-blue-600">
                {filteredAndSortedProperties.length} matching your filters
              </p>
            </div>
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
        <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {/* Enhanced Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Saved Stays</h1>
                <p className="text-sm lg:text-base text-gray-600">
                  All properties you've favorited ({filteredAndSortedProperties.length} of {items.length})
                </p>
              </div>
              
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 lg:mb-8 space-y-4 sm:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Search your saved places"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-sm border-2 border-gray-200 focus:border-blue-500 rounded-lg"
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {/* View Mode Toggle */}
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
              
              {/* ✅ Working Sort Dropdown */}
              <div className="relative">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center space-x-2 text-sm min-w-[140px] justify-between"
                >
                  {currentSortOption && <currentSortOption.icon className="w-4 h-4" />}
                  <span>{currentSortOption?.label || 'Sort'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                </Button>
                
                {/* Sort Options Dropdown */}
                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value as SortOption);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
                            sortBy === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          <option.icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Click outside to close dropdown */}
          {showSortDropdown && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowSortDropdown(false)}
            />
          )}

          {/* Loading / Error / Empty States */}
          {loading ? (
            <div className="text-center py-12 lg:py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading your wishlist...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 lg:py-16">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600 mb-4 font-medium">{error}</p>
                <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                  Retry
                </Button>
              </div>
            </div>
          ) : filteredAndSortedProperties.length === 0 ? (
            <div className="text-center py-12 lg:py-16">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved stays match your filters</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filters to find your saved properties.</p>
                <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setPriceFilter('all');
                      setRatingFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                  <Button 
                    onClick={() => navigate('/explore')} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Explore More Stays
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ✅ Enhanced Property Grid/List with Fixed Prices */}
              <div className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6' 
                  : 'space-y-4'
              } mb-8`}>
                {filteredAndSortedProperties.map((property) => (
                  <Card 
                    key={property.id} 
                    className={`overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg hover:-translate-y-1 ${
                      viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                    }`}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'sm:w-80 sm:flex-shrink-0' : ''}`}>
                      <ImageWithFallback
                        src={property.image}
                        alt={property.name}
                        className={`object-cover ${
                          viewMode === 'list' ? 'w-full h-48 sm:h-full' : 'w-full h-40 lg:h-48'
                        }`}
                      />
                      <button
                        onClick={() => handleRemoveClick(property)}
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-white group"
                        aria-label={`Remove ${property.name} from wishlist`}
                      >
                        <X className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors" />
                      </button>
                      
                      {/* Rating Badge */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs font-semibold">{property.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className={`p-4 lg:p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-base lg:text-lg text-gray-900 mb-2 line-clamp-1">
                            {property.name}
                          </h3>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="text-xs lg:text-sm line-clamp-1">{property.location}</span>
                          </div>
                        </div>
                        
                        {/* ✅ Fixed desktop list view price display */}
                        {viewMode === 'list' && (
                          <div className="text-right ml-4 hidden sm:block">
                            <div className="text-xl lg:text-2xl font-bold text-blue-600">
                              {formatPriceINR(property.pricePerNight)}
                            </div>
                            <div className="text-gray-500 text-xs">per night</div>
                          </div>
                        )}
                      </div>
                      
                      {/* Amenities Preview */}
                      <div className="flex items-center space-x-4 mb-4 text-xs lg:text-sm">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>2-4 guests</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Wifi className="w-4 h-4" />
                          <span>Free WiFi</span>
                        </div>
                      </div>
                      
                      {/* ✅ Fixed price display for grid view and mobile */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={viewMode === 'list' ? 'sm:hidden' : ''}>
                          <span className="text-lg lg:text-xl font-bold text-blue-600">
                            {formatPriceINR(property.pricePerNight)}
                          </span>
                          <span className="text-gray-500 text-xs ml-1">per night</span>
                        </div>
                        
                        <div className="ml-auto">
                          <Badge variant="secondary" className="text-xs">
                            Added {formatAddedDate((property as any).addedAt)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
                          onClick={() => handleBookNow(property)}
                        >
                          Book Now
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 text-sm py-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(property);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* ✅ Enhanced Keep Exploring Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 lg:p-8 text-center border border-blue-100">
                <div className="max-w-2xl mx-auto">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">Keep Exploring</h2>
                  <p className="text-gray-600 mb-6 text-sm lg:text-base">
                    Not seeing something? Discover more amazing places to add to your wishlist and create your perfect travel collection.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <Button 
                      onClick={() => navigate('/explore')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 flex items-center space-x-2"
                    >
                      <span>Explore More Stays</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/experiences')}
                      className="px-6 py-3"
                    >
                      Browse Experiences
                    </Button>
                  </div>
                </div>
              </div>

              {/* ✅ Trust & Safety Section */}
              <div className="mt-8 lg:mt-12 py-8 lg:py-12 px-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="max-w-4xl mx-auto text-center">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-6">Why Save with SheyRooms?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                        <Shield className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Secure Booking</h4>
                      <p className="text-sm text-gray-600">Your saved properties are always available with secure booking</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                        <Clock className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Price Tracking</h4>
                      <p className="text-sm text-gray-600">Get notified of price drops on your saved properties</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                        <Award className="w-6 h-6 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Best Deals</h4>
                      <p className="text-sm text-gray-600">Exclusive offers available for your wishlist properties</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <RoomDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        room={selectedRoom}
      />

      {/* ✅ Fixed Remove Confirmation Modal - no conversion needed */}
      {selectedProperty && (
        <RemoveModal
          isOpen={showRemoveModal}
          onClose={() => setShowRemoveModal(false)}
          onRemove={handleRemoveConfirm}
          onBook={() => handleBookNow(selectedProperty)}
          property={{
            id: selectedProperty.id,
            name: selectedProperty.name,
            location: selectedProperty.location,
            pricePerNight: selectedProperty.pricePerNight, // Already in INR
            image: selectedProperty.image,
          }}
        />
      )}
    </div>
  );
}
