import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "../Components/ui/button.tsx";
import { Input } from "../Components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select.tsx";
import { Card, CardContent } from "../Components/ui/card.tsx";
import { Badge } from "../Components/ui/badge.tsx";
import { CalendarDays, Users, MapPin, Shield, CreditCard, Headphones, Star, CheckCircle, Award, TrendingUp, Clock, Phone } from "lucide-react";
import { ImageWithFallback } from '../Components/figma/ImageWithFallback.tsx';
import { roomsAPI } from '../services/api.ts';
import '../styles/globals.css';

// ✅ Define TypeScript interfaces
interface Room {
  _id: string;
  name: string;
  imageurls: (string | any)[];
  location?: {
    city?: string;
    state?: string;
  };
  ratings?: {
    average?: number;
    count?: number;
  };
  rentperday: number;
  featured?: boolean;
  maxcount?: number;
  bookingCount?: number;
  availability?: {
    isActive?: boolean;
  };
  type?: string;
}

interface Stats {
  totalRooms: number;
  totalCities: number;
  totalBookings: number;
  averageRating: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

interface SearchParams {
  destination: string;
  checkin: string;
  checkout: string;
  guests: string;
}

export default function Landingscreen() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ ALL HOOKS MUST BE AT THE TOP LEVEL - MOVE EVERYTHING HERE
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<Stats>({
    totalRooms: 0,
    totalCities: 0,
    totalBookings: 0,
    averageRating: 4.9
  });
  const [searchParams, setSearchParams] = useState<SearchParams>({
    destination: '',
    checkin: '',
    checkout: '',
    guests: '2'
  });

  // ✅ Check authentication state on component mount AND route change
  useEffect(() => {
    const checkAuthState = () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null") as User | null;
        setUser(currentUser);
        console.log('✅ Auth state checked:', currentUser ? `Logged in as ${currentUser.name}` : 'Not logged in');
      } catch (error) {
        console.error('Error checking auth state:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, [location.pathname]);

  // ✅ Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        const newUser = e.newValue ? JSON.parse(e.newValue) as User : null;
        setUser(newUser);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ✅ Fetch featured rooms and stats on component mount
  useEffect(() => {
    const fetchLandingPageData = async () => {
      try {
        const roomsResponse = await roomsAPI.getAllRooms();
        const rooms: Room[] = roomsResponse.data || [];
        setFeaturedRooms(rooms);
        
        // Calculate stats from rooms data
        setStats({
          totalRooms: rooms.length,
          totalCities: [...new Set(rooms.map((room: Room) => room.location?.city).filter(Boolean))].length,
          totalBookings: rooms.reduce((total: number, room: Room) => total + (room.bookingCount || 0), 0),
          averageRating: rooms.length > 0 
            ? rooms.reduce((sum: number, room: Room) => sum + (room.ratings?.average || 4.5), 0) / rooms.length 
            : 4.9
        });
        
        console.log('✅ Landing page data loaded:', {
          roomsCount: rooms.length,
          stats
        });
      } catch (error) {
        console.error('❌ Failed to load landing page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingPageData();
  }, []);

  // ✅ NOW you can have conditional logic and early returns AFTER all hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Function definitions after hooks
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    navigate('/');
  };

  const handleBookNow = () => {
    if (user) {
      navigate("/home");
    } else {
      navigate("/register");
    }
  };

  // ✅ Enhanced search functionality
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate required fields
    if (!searchParams.destination.trim()) {
      alert('Please enter a destination');
      return;
    }
    
    if (!searchParams.checkin || !searchParams.checkout) {
      alert('Please select check-in and check-out dates');
      return;
    }
    
    // Validate dates
    const checkInDate = new Date(searchParams.checkin);
    const checkOutDate = new Date(searchParams.checkout);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate < today) {
      alert('Check-in date cannot be in the past');
      return;
    }
    
    if (checkOutDate <= checkInDate) {
      alert('Check-out date must be after check-in date');
      return;
    }
    
    try {
      console.log('🔍 Searching with params:', searchParams);
      
      // Create URL with search parameters
      const searchURL = `/home?destination=${encodeURIComponent(searchParams.destination.trim())}&checkin=${searchParams.checkin}&checkout=${searchParams.checkout}&guests=${searchParams.guests}&fromLanding=true`;
      
      // Navigate to home screen with search parameters
      navigate(searchURL, { 
        state: { 
          searchParams: {
            destination: searchParams.destination.trim(),
            checkin: searchParams.checkin,
            checkout: searchParams.checkout,
            guests: searchParams.guests
          },
          fromLanding: true
        }
      });
    } catch (error) {
      console.error('❌ Search failed:', error);
      alert('Search failed. Please try again.');
    }
  };

  const handleRoomClick = (roomId: string) => {
    const defaultCheckin = new Date();
    const defaultCheckout = new Date();
    defaultCheckout.setDate(defaultCheckout.getDate() + 1);
    
    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };
    
    navigate(`/book/${roomId}/${formatDate(defaultCheckin)}/${formatDate(defaultCheckout)}`);
  };

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
    return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop';
  };

  // Get today's date for form validation
  const today = new Date().toISOString().split('T')[0];

return (
    <div className="min-h-screen bg-white">
      {/* ✅ Updated Header with conditional rendering */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="text-blue-600 font-bold text-2xl cursor-pointer" onClick={() => navigate('/')}>
              Sheyrooms
            </div>
            <nav className="hidden md:flex space-x-8">
              <button onClick={() => navigate('/home')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Home</button>
              <button onClick={() => navigate('/experiences')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Experiences</button>
              <button onClick={() => navigate('/about')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">About</button>
              <button onClick={() => navigate('/contact')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Contact</button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center space-x-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span className="text-sm">24/7 Support</span>
            </div>
            
            {/* ✅ Conditional rendering based on user login status */}
            {user ? (
              // User is logged in - show user info and logout
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Welcome back, {user.name}</span>
                  {user.isAdmin && (
                    <Badge className="bg-orange-100 text-orange-600">Admin</Badge>
                  )}
                </div>
                <Button onClick={() => navigate('/home')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200">
                  Go to Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Logout
                </Button>
              </div>
            ) : (
              // User is not logged in - show sign in and join buttons
              <div className="flex items-center space-x-4">
                <button onClick={() => navigate('/login')} className="text-gray-700 hover:text-blue-600 cursor-pointer transition-colors">
                  Sign in
                </button>
                <Button onClick={() => navigate('/register')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5">
                  Join Free
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ✅ Updated Hero Section with dynamic content */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            {user && (
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Welcome back, {user.name}! Ready for your next adventure?</span>
              </div>
            )}
            
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {user ? (
                  <>Ready for Your Next<br /><span className="text-blue-600">Perfect Stay?</span></>
                ) : (
                  <>Find Your Perfect Hotel Room,<br /><span className="text-blue-600">Anywhere, Anytime.</span></>
                )}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                {user 
                  ? "Continue exploring amazing destinations and book your perfect stay with exclusive member benefits."
                  : "Discover luxury hotels, cozy rooms, and premium suites around the world with our intuitive booking platform."
                }
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-orange-500 border-2 border-orange-300 text-white px-6 py-3 rounded-lg font-bold"
                onClick={handleBookNow}
              >
                {user ? "Explore Rooms - Save upto 30%" : "Book Now - Save upto 30%"}
              </Button>
              <Button className="border-2 border-blue-200 hover:border-blue-300 px-10 py-4 rounded-lg text-lg transition-all duration-200 hover:bg-blue-50" onClick={handleBookNow}>
                {user ? "View My Bookings" : "Browse Deals"}
              </Button>
            </div>
            
            {/* Dynamic Social proof indicators */}
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{Math.max(2000, stats.totalBookings)}+</div>
                <div className="text-sm text-gray-600">Happy Guests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{Math.max(50, stats.totalRooms)}+</div>
                <div className="text-sm text-gray-600">Hotels Available</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</span>
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent rounded-2xl"></div>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1723465302725-ff46b3e165f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU1Mjg4NDE4fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Luxury hotel lobby interior"
              className="w-full h-[500px] object-cover rounded-2xl shadow-2xl transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute top-6 right-6 bg-white px-4 py-2 rounded-full shadow-lg">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Secure Booking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* Enhanced Search Form */}
<section className="py-12 bg-white relative -mt-8 z-10">
  <div className="max-w-5xl mx-auto px-4">
    <Card className="shadow-2xl border-0 bg-white">
      <CardContent className="p-8">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg mb-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="font-semibold text-sm">Limited Time: Extra 25% Off for bookings this week!</span>
          </div>
        </div>
        
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Destination Input - No Icon */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Where are you staying?</label>
              <div className="relative">
                <Input 
                  placeholder="Search destinations" 
                  value={searchParams.destination}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
                  className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 transition-colors text-sm rounded-lg" 
                />
              </div>
            </div>
            
            {/* Check-in Date - No Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check in</label>
              <div className="relative">
                <Input 
                  type="date"
                  value={searchParams.checkin}
                  min={today}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams(prev => ({ ...prev, checkin: e.target.value }))}
                  className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 transition-colors text-sm rounded-lg" 
                />
              </div>
            </div>
            
            {/* Check-out Date - No Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check out</label>
              <div className="relative">
                <Input 
                  type="date"
                  value={searchParams.checkout}
                  min={searchParams.checkin || today}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams(prev => ({ ...prev, checkout: e.target.value }))}
                  className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 transition-colors text-sm rounded-lg" 
                />
              </div>
            </div>
            
            {/* Guests Select - No Icon with Enhanced Dropdown */}
            <div className="relative z-20">
              <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
              <div className="relative">
                <Select value={searchParams.guests} onValueChange={(value: string) => setSearchParams(prev => ({ ...prev, guests: value }))}>
                  <SelectTrigger className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 text-sm rounded-lg bg-white">
                    <SelectValue placeholder="Select guests" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg mt-1 z-50">
                    <SelectItem value="1" className="px-4 py-3 hover:bg-gray-100 cursor-pointer">1 Guest</SelectItem>
                    <SelectItem value="2" className="px-4 py-3 hover:bg-gray-100 cursor-pointer">2 Guests</SelectItem>
                    <SelectItem value="3" className="px-4 py-3 hover:bg-gray-100 cursor-pointer">3 Guests</SelectItem>
                    <SelectItem value="4" className="px-4 py-3 hover:bg-gray-100 cursor-pointer">4+ Guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Button type="submit" className="w-full mt-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-lg text-lg font-semibold transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1">
            Search Best Deals
          </Button>
        </form>
        
        <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Free Cancellation</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Instant Confirmation</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>Best Price Guarantee</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</section>


      {/* Popular Destinations with Images */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Destinations</h2>
            <p className="text-xl text-gray-600">Discover amazing places around the world</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'New York', image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=600&h=400&fit=crop&crop=edges', description: 'The Big Apple' },
              { name: 'Paris', image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=600&h=400&fit=crop&crop=edges', description: 'City of Love' },
              { name: 'Tokyo', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop&crop=edges', description: 'Modern Metropolis' },
              { name: 'London', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop&crop=edges', description: 'Historic Capital' },
              { name: 'Sydney', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=edges', description: 'Harbor City' },
              { name: 'Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop&crop=edges', description: 'Future City' }
            ].map((city: { name: string; image: string; description: string }, index: number) => (
              <div key={city.name} className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 cursor-pointer group" onClick={() => setSearchParams(prev => ({ ...prev, destination: city.name }))}>
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={city.image}
                    alt={`${city.name} cityscape`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">{city.name}</h3>
                    <p className="text-sm opacity-90">{city.description}</p>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium">
                    Popular
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Explore {city.name}</span>
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm text-gray-600">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Featured Rooms Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Hotels</h2>
            <p className="text-xl text-gray-600">Handpicked properties for your perfect stay</p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map((i: number) => (
                <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRooms.slice(0, 6).map((room: Room) => (
                <Card key={room._id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer bg-white border-0" onClick={() => handleRoomClick(room._id)}>
                  <div className="relative">
                    <ImageWithFallback
                      src={getImageUrl(room.imageurls?.[0])}
                      alt={room.name}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-full shadow-lg">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-semibold text-gray-900">{room.ratings?.average?.toFixed(1) || '4.5'}</span>
                      </div>
                    </div>
                    {room.featured && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Featured
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{room.name}</h3>
                    <p className="text-gray-600 mb-4 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {room.location?.city || 'Unknown Location'}
                    </p>
                    <div className="flex items-center mb-4">
                      <div className="flex items-center space-x-1 text-yellow-400">
                        {[...Array(5)].map((_: any, i: number) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(room.ratings?.average || 4.5) ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">({room.ratings?.count || 0} reviews)</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-blue-600">₹{room.rentperday?.toLocaleString() || '0'}</span>
                        </div>
                        <span className="text-gray-500 text-sm">per night</span>
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:shadow-lg">
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button onClick={() => navigate('/rooms')} variant="outline" className="px-8 py-3 text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200">
              View All Properties
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonial with multiple reviews */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">What Our Guests Say</h2>
            <p className="text-xl text-blue-100">Real reviews from real travelers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_: any, i: number) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "Sheyrooms made finding a perfect hotel room incredibly easy. The booking process was smooth, and the customer service was exceptional."
              </p>
              <div className="flex items-center">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1494790108755-2616b612cf15?w=64&h=64&fit=crop&crop=face"
                  alt="Customer avatar"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="font-semibold text-gray-900">Sarah Johnson</p>
                  <p className="text-gray-600 text-sm">Business Traveler</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_: any, i: number) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "Best prices guaranteed! I saved over $200 on my family vacation. The hotel was exactly as described and the location was perfect."
              </p>
              <div className="flex items-center">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face"
                  alt="Customer avatar"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="font-semibold text-gray-900">Mike Chen</p>
                  <p className="text-gray-600 text-sm">Family Vacation</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_: any, i: number) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "Outstanding service! When I had an issue with my booking, their 24/7 support team resolved it within minutes. Highly recommended!"
              </p>
              <div className="flex items-center">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
                  alt="Customer avatar"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="font-semibold text-gray-900">Emma Davis</p>
                  <p className="text-gray-600 text-sm">Solo Traveler</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Book your perfect stay in just 3 simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Search & Discover</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Find your perfect accommodation using our advanced search filters and personalized recommendations.
              </p>
            </div>
            
            <div className="text-center relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Book with Ease</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Secure your booking with our streamlined checkout process and receive instant confirmation via email.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Enjoy Your Stay</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Check in and enjoy your perfect stay with 24/7 support available whenever you need assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Get Exclusive Deals & Travel Tips
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 500K+ subscribers and save up to 50% on your next booking with insider deals delivered weekly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <Input
              placeholder="Enter your email address"
              className="bg-white border-0 h-14 text-lg px-6 flex-1"
            />
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 h-14 text-lg font-semibold transition-all duration-200 hover:shadow-xl">
              Get Deals Now
            </Button>
          </div>
          <p className="text-blue-200 text-sm mt-4">Free to join. Unsubscribe anytime. No spam, guaranteed.</p>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-b border-gray-800 pb-12 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
              <div>
                <h3 className="text-2xl font-bold mb-2 text-blue-400">Sheyrooms</h3>
                <p className="text-gray-400">
                  Your trusted partner for exceptional hotel stays worldwide.
                </p>
              </div>
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-green-400" />
                  <span className="text-sm">SSL Secured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                  <span className="text-sm">Secure Payments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-6 h-6 text-yellow-400" />
                  <span className="text-sm">Award Winning</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => navigate('/careers')} className="hover:text-white transition-colors">Careers</button></li>
                <li><button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">Contact Us</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><button onClick={() => navigate('/help')} className="hover:text-white transition-colors">Help Center</button></li>
                <li><button onClick={() => navigate('/safety')} className="hover:text-white transition-colors">Safety Information</button></li>
                <li><button onClick={() => navigate('/cancellation')} className="hover:text-white transition-colors">Cancellation Options</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                <li><button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Contact Info</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>1-800-SHEYROOMS</span>
                </li>
                <li>24/7 Customer Support</li>
                <li>Email: help@sheyrooms.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2024 Sheyrooms. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Trusted by millions worldwide</span>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_: any, i: number) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                <span className="text-sm text-gray-400 ml-1">{stats.averageRating.toFixed(1)}/5</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
