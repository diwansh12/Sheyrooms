import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import RoomDetailsModal from '../Components/RoomDetailsModal.tsx';
import { Button } from "../Components/ui/button.tsx";
import { Input } from "../Components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select.tsx";
import { Card, CardContent } from "../Components/ui/card.tsx";
import { Badge } from "../Components/ui/badge.tsx";
import {
  Home,
  Compass,
  Heart,
  MapPin,
  User,
  Settings,
  Search,
  Plus,
  ChevronDown,
  Loader2,
  Star,
  Calendar,
  Users,
  CalendarDays,
  Filter,
  ArrowLeft,
  X,
  Bookmark,
  TrendingUp,
  Award,
  Globe,
  Menu,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { ImageWithFallback } from '../Components/figma/ImageWithFallback.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useRooms } from '../hooks/useRooms.ts';
import { useUserBookings } from '../hooks/useBookings.ts';
import { roomsAPI } from '../services/api.ts';
import { Room, Booking, SearchFilters } from '../types';
import '../styles/globals.css';

interface UserStats {
  upcomingTrips: number;
  totalBookings: number;
  savedStays: number;
  lastBooking: string;
  totalSpent: number;
}

export default function Homescreen() {
  const { user, logout } = useAuth();
  const { rooms, loading: roomsLoading, searchRooms } = useRooms();
  const bookingHook = useUserBookings();
  const { bookings = [], loading: bookingsLoading = false } = bookingHook || {};
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Get search parameters from URL or navigation state
  const urlDestination = searchParams.get('destination') || '';
  const urlCheckin = searchParams.get('checkin') || '';
  const urlCheckout = searchParams.get('checkout') || '';
  const urlGuests = searchParams.get('guests') || '2';
  const fromLanding = searchParams.get('fromLanding') === 'true';

  const navigationState = location.state as {
    searchParams?: {
      destination: string;
      checkin: string;
      checkout: string;
      guests: string;
    };
    fromLanding?: boolean;
  } | null;

  // State management
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Search filters with URL parameters or defaults
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    destination: urlDestination || navigationState?.searchParams?.destination || '',
    checkin: urlCheckin || navigationState?.searchParams?.checkin || '',
    checkout: urlCheckout || navigationState?.searchParams?.checkout || '',
    guests: parseInt(urlGuests || navigationState?.searchParams?.guests || '2'),
    roomType: '',
    priceRange: ''
  });

  // ✅ Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Fetch and filter rooms when component mounts or search params change
  useEffect(() => {
    const fetchAndFilterRooms = async () => {
      try {
        setLoading(true);

        const roomsResponse = await roomsAPI.getAllRooms();
        const rooms: Room[] = roomsResponse.data || [];
        setAllRooms(rooms);

        let filtered = [...rooms];

        if (searchFilters.destination) {
          filtered = filtered.filter((room: Room) => {
            const roomLocation = `${room.location?.city || ''} ${room.location?.state || ''} ${room.name}`.toLowerCase();
            return roomLocation.includes(searchFilters.destination.toLowerCase());
          });
        }

        if (searchFilters.guests > 1) {
          filtered = filtered.filter((room: Room) =>
            (room.maxcount || 2) >= searchFilters.guests
          );
        }

        if (searchFilters.roomType && searchFilters.roomType !== 'all') {
          filtered = filtered.filter((room: Room) =>
            room.type === searchFilters.roomType
          );
        }

        setFilteredRooms(filtered);

      } catch (error) {
        console.error('❌ Failed to fetch and filter rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterRooms();
  }, [searchFilters.destination, searchFilters.guests, searchFilters.roomType]);

  // User stats calculation
  const userStats: UserStats = {
    upcomingTrips: bookings.filter((booking: Booking) =>
      new Date(booking.fromdate) > new Date() &&
      (booking.status === 'confirmed' || booking.status === 'checked-in')
    ).length,
    totalBookings: bookings.length,
    savedStays: rooms.filter((room: Room) => room.isFavorite).length || 0,
    lastBooking: bookings.length > 0 ?
      new Date(bookings[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
      'No bookings',
    totalSpent: bookings
      .filter((booking: Booking) =>
        booking.status !== 'cancelled' && booking.status !== 'no-show'
      )
      .reduce((sum: number, booking: Booking) =>
        sum + (booking.pricing?.totalamount || 0), 0
      )
  };

  // Handle search form submission
  const handleSearch = async (): Promise<void> => {
    if (!searchFilters.destination && !searchFilters.checkin && !searchFilters.checkout) {
      alert('Please enter search criteria');
      return;
    }

    setIsSearching(true);
    try {
      const newSearchParams = new URLSearchParams();
      if (searchFilters.destination) newSearchParams.set('destination', searchFilters.destination);
      if (searchFilters.checkin) newSearchParams.set('checkin', searchFilters.checkin);
      if (searchFilters.checkout) newSearchParams.set('checkout', searchFilters.checkout);
      newSearchParams.set('guests', searchFilters.guests.toString());

      window.history.replaceState({}, '', `${window.location.pathname}?${newSearchParams.toString()}`);

    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (field: keyof SearchFilters, value: any): void => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  // Handle New Trip button functionality
  const handleNewTrip = () => {
    setSearchFilters({
      destination: '',
      checkin: '',
      checkout: '',
      guests: 2,
      roomType: '',
      priceRange: ''
    });
    navigate('/explore');
  };

  const handleRoomView = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };
  // Format date for booking URL
  const formatDateForURL = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  };



  // Handle quick booking
  const handleQuickBook = async (room: Room): Promise<void> => {
    if (!searchFilters.checkin || !searchFilters.checkout) {
      alert('Please select check-in and check-out dates first');
      return;
    }

    if (!user?._id) {
      alert('Please log in to make a booking');
      return;
    }

    const checkInDate = new Date(searchFilters.checkin);
    const checkOutDate = new Date(searchFilters.checkout);

    const fromdate = formatDateForURL(checkInDate);
    const todate = formatDateForURL(checkOutDate);

    navigate(`/book/${room._id}/${fromdate}/${todate}`);
  };

  // Clear search filters
  const clearSearch = () => {
    setSearchFilters({
      destination: '',
      checkin: '',
      checkout: '',
      guests: 2,
      roomType: '',
      priceRange: ''
    });
    navigate('/home', { replace: true });
  };

  // Helper function to get image URL safely
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
    return 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop';
  };

  const showSearchSummary = searchFilters.destination || searchFilters.checkin || searchFilters.checkout || fromLanding;
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ✅ Enhanced Collapsible Sidebar with Perfect Icon Positioning */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} bg-gradient-to-b from-slate-800 to-slate-900 text-white flex flex-col shadow-2xl transition-all duration-300 ease-in-out relative`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between min-h-[72px]">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">SheyRooms</h2>
                <p className="text-slate-400 text-sm">Welcome, {user?.name || 'Guest'}</p>
              </div>
            </div>
          )}

          {/* ✅ Perfectly Positioned Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={`p-2 hover:bg-slate-700 rounded-xl transition-all duration-200 ${sidebarCollapsed ? 'mx-auto' : ''}`}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-white" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-white" />
            )}
          </Button>
        </div>

        {/* ✅ Navigation Menu with Perfect Icon Alignment */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {/* Home - Active */}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3'} bg-blue-600 text-white py-3 rounded-xl shadow-lg transition-all duration-200`}>
            <Home className={`w-5 h-5 flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-3'}`} />
            {!sidebarCollapsed && <span className="font-medium text-base">Home</span>}
          </div>

          {/* Explore */}
          <div
            className={`flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3'} text-slate-300 hover:text-white hover:bg-slate-700 py-3 rounded-xl transition-all duration-200 cursor-pointer group`}
            onClick={() => navigate('/explore')}
          >
            <Compass className={`w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-3'}`} />
            {!sidebarCollapsed && <span className="font-medium text-base">Explore</span>}
          </div>

          {/* Saved */}
          <div
            className={`flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'} text-slate-300 hover:text-white hover:bg-slate-700 py-3 rounded-xl transition-all duration-200 cursor-pointer group relative`}
            onClick={() => navigate('/wishlist')}
          >
            <div className={`flex items-center ${sidebarCollapsed ? '' : ''}`}>
              <Heart className={`w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-3'}`} />
              {!sidebarCollapsed && <span className="font-medium text-base">Saved</span>}
            </div>
            {/* Badge positioning for both states */}
            {userStats.savedStays > 0 && (
              <>
                {sidebarCollapsed ? (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{userStats.savedStays}</span>
                  </div>
                ) : (
                  <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {userStats.savedStays}
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* My Trips */}
          <div
            className={`flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'} text-slate-300 hover:text-white hover:bg-slate-700 py-3 rounded-xl transition-all duration-200 cursor-pointer group relative`}
            onClick={() => navigate('/mytrips')}
          >
            <div className={`flex items-center ${sidebarCollapsed ? '' : ''}`}>
              <Calendar className={`w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-3'}`} />
              {!sidebarCollapsed && <span className="font-medium text-base">My Trips</span>}
            </div>
            {/* Badge positioning for both states */}
            {userStats.upcomingTrips > 0 && (
              <>
                {sidebarCollapsed ? (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{userStats.upcomingTrips}</span>
                  </div>
                ) : (
                  <Badge className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    {userStats.upcomingTrips}
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Profile */}
          <div
            className={`flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3'} text-slate-300 hover:text-white hover:bg-slate-700 py-3 rounded-xl transition-all duration-200 cursor-pointer group`}
            onClick={() => navigate('/profile')}
          >
            <User className={`w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-3'}`} />
            {!sidebarCollapsed && <span className="font-medium text-base">Profile</span>}
          </div>
        </nav>

        {/* ✅ Quick Stats - Only show when expanded */}
        {!sidebarCollapsed && (
          <div className="px-3 py-4 border-t border-slate-700">
            <div className="bg-slate-700 rounded-xl p-4 mb-4">
              <h3 className="text-white font-semibold mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Total Bookings</span>
                  <span className="text-white font-semibold">{userStats.totalBookings}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Total Spent</span>
                  <span className="text-white font-semibold">₹{userStats.totalSpent.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white transition-all duration-200"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        )}

        {/* ✅ Collapsed state quick access with centered icon */}
        {sidebarCollapsed && (
          <div className="px-2 py-4 border-t border-slate-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white transition-all duration-200 flex justify-center"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* ✅ Enhanced Top Header with Optimized Font Sizes */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <button onClick={() => navigate('/')} className="text-blue-600 font-bold text-xl hover:text-blue-700 transition-colors">
                SheyRooms
              </button>
              <nav className="hidden md:flex space-x-8">
                <button onClick={() => navigate('/home')} className="text-blue-600 font-semibold">Home</button>
                <button onClick={() => navigate('/explore')} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Stays</button>
                <button onClick={() => navigate('/mytrips')} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Trips</button>
                <button onClick={() => navigate('/wishlist')} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Wishlist</button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium text-gray-900">Welcome, {user.name}</p>
                    <p className="text-sm text-gray-500">Ready for your next adventure?</p>
                  </div>
                  {user.isAdmin && (
                    <Badge className="bg-orange-100 text-orange-600 font-semibold">Admin</Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="text-gray-600 hover:text-red-600 hover:border-red-300"
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Search Summary Banner */}
        {showSearchSummary && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 shadow-lg">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="text-white hover:bg-blue-700 p-2 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  {searchFilters.destination && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span className="font-semibold">{searchFilters.destination}</span>
                    </div>
                  )}
                  {searchFilters.checkin && (
                    <div className="flex items-center space-x-2">
                      <CalendarDays className="w-5 h-5" />
                      <span>{new Date(searchFilters.checkin).toLocaleDateString()}</span>
                      <span>-</span>
                      <span>{searchFilters.checkout ? new Date(searchFilters.checkout).toLocaleDateString() : 'Select date'}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>{searchFilters.guests} {searchFilters.guests === 1 ? 'Guest' : 'Guests'}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-medium">{filteredRooms.length} properties found</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="text-white hover:bg-blue-700 p-2 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {!showSearchSummary && (
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back{user?.name ? `, ${user.name}` : ''}
                </h1>
                <p className="text-gray-600">Plan your next getaway or pick up where you left off.</p>
              </div>
              <Button
                onClick={handleNewTrip}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>New Trip</span>
              </Button>
            </div>
          )}

          {/* ✅ Enhanced Search Form with Optimized Sizes */}
          <Card className="mb-8 shadow-lg border-0">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Destination</label>
                  <Input
                    placeholder="Search rooms, location"
                    className="h-11 rounded-lg border-2 border-gray-200 focus:border-blue-500"
                    value={searchFilters.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in</label>
                  <Input
                    type="date"
                    className="h-11 rounded-lg border-2 border-gray-200 focus:border-blue-500"
                    value={searchFilters.checkin}
                    min={today}
                    onChange={(e) => handleInputChange('checkin', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Check-out</label>
                  <Input
                    type="date"
                    className="h-11 rounded-lg border-2 border-gray-200 focus:border-blue-500"
                    value={searchFilters.checkout}
                    min={searchFilters.checkin || today}
                    onChange={(e) => handleInputChange('checkout', e.target.value)}
                  />
                </div>
                <div className="relative z-20">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type</label>
                  <Select
                    value={searchFilters.roomType || 'all'}
                    onValueChange={(value) => handleInputChange('roomType', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="h-11 rounded-lg border-2 border-gray-200 focus:border-blue-500 bg-white">
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200 shadow-xl rounded-lg mt-2 z-50 min-w-full">
                      <SelectItem value="all" className="px-4 py-3 hover:bg-blue-50 cursor-pointer">Any type</SelectItem>
                      <SelectItem value="Standard" className="px-4 py-3 hover:bg-blue-50 cursor-pointer">Standard</SelectItem>
                      <SelectItem value="Deluxe" className="px-4 py-3 hover:bg-blue-50 cursor-pointer">Deluxe</SelectItem>
                      <SelectItem value="Suite" className="px-4 py-3 hover:bg-blue-50 cursor-pointer">Suite</SelectItem>
                      <SelectItem value="Presidential" className="px-4 py-3 hover:bg-blue-50 cursor-pointer">Presidential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative z-10">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Guests</label>
                  <Select
                    value={searchFilters.guests.toString()}
                    onValueChange={(value) => handleInputChange('guests', parseInt(value))}
                  >
                    <SelectTrigger className="h-11 rounded-lg border-2 border-gray-200 focus:border-blue-500 bg-white">
                      <SelectValue placeholder="Select guests" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200 shadow-xl rounded-lg mt-2 z-40 min-w-full">
                      <SelectItem value="1" className="px-4 py-3 hover:bg-blue-50 cursor-pointer">1 guest</SelectItem>
                      <SelectItem value="2" className="px-4 py-3 hover:bg-blue-50 cursor-pointer">2 guests</SelectItem>
                      <SelectItem value="3" className="px-4 py-3 hover:bg-blue-50 cursor-pointer">3 guests</SelectItem>
                      <SelectItem value="4" className="px-4 py-3 hover:bg-blue-50 cursor-pointer">4+ guests</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                <span>{isSearching ? 'Searching...' : 'Search Rooms'}</span>
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchFilters.destination ? `Hotels in ${searchFilters.destination}` : 'Available Rooms'}
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 font-medium">{filteredRooms.length} results</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-2 border-gray-300 hover:border-blue-500"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : filteredRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room: Room) => (
                  <Card key={room._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg rounded-xl hover:-translate-y-1">
                    <div className="relative">
                      <ImageWithFallback
                        src={getImageUrl(room.imageurls?.[0]) || room.primaryImage || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop'}
                        alt={room.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-blue-100 text-blue-600 border-0 font-semibold px-2 py-1">
                          {room.type || 'Standard'}
                        </Badge>
                      </div>
                      {room.featured && (
                        <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-sm font-semibold">
                          Featured
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{room.name}</h3>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {room.location?.city || room.location?.wing || 'Unknown Location'}
                      </div>
                      <div className="flex items-center mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{room.ratings?.average?.toFixed(1) || '4.5'}</span>
                          <span className="text-sm text-gray-500">({room.ratings?.count || room.ratings?.total || 0} reviews)</span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <Users className="w-4 h-4 mr-1" />
                        Up to {room.roomFeatures?.maxOccupancy || room.maxcount || 2} guests
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-blue-600">₹{(room.displayPrice || room.rentperday)?.toLocaleString() || '0'}</span>
                          <span className="text-xs text-gray-500">per night</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRoomView(room)}
                            className="border-2 border-gray-300 hover:border-blue-500"
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4"
                            onClick={() => handleQuickBook(room)}
                          >
                            Book
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No hotels found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchFilters.destination
                      ? `No hotels found in ${searchFilters.destination} for your selected criteria.`
                      : 'No hotels match your search criteria.'
                    }
                  </p>
                  <div className="flex space-x-3 justify-center">
                    <Button variant="outline" onClick={clearSearch} className="border-2 border-gray-300 hover:border-blue-500">
                      Clear Filters
                    </Button>
                    <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                      Modify Search
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ✅ Enhanced User Stats with Optimized Sizing */}
          {!showSearchSummary && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your booking summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-gray-600 text-sm mb-1">Upcoming trips</p>
                    <p className="text-3xl font-bold text-gray-900">{userStats.upcomingTrips}</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bookmark className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-gray-600 text-sm mb-1">Total bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{userStats.totalBookings}</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-gray-600 text-sm mb-1">Total spent</p>
                    <p className="text-2xl font-bold text-gray-900">₹{userStats.totalSpent.toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-gray-600 text-sm mb-1">Last booking</p>
                    <p className="text-xl font-bold text-gray-900">{userStats.lastBooking}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>

        {/* Enhanced Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-600 transition-colors font-medium">Help</a>
              <a href="#" className="hover:text-blue-600 transition-colors font-medium">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors font-medium">Terms</a>
            </div>
            <p className="font-medium">&copy; 2025 SheyRooms - Your perfect stay awaits</p>
          </div>
        </footer>
      </div>

      <RoomDetailsModal
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  room={selectedRoom}
/>
    </div>
  );
}
