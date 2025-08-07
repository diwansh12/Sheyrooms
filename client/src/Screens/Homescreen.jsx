import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DatePicker, Pagination, Select,  Dropdown, Button, Menu } from 'antd';
import axios from 'axios';
import moment from 'moment';
import 'antd/dist/reset.css';


import Room from '../Components/Room';
import Loader from '../Components/Loader';
import Error from '../Components/Error';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Homescreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State management
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);


  const [searchParams, setSearchParams] = useState({
    destination: '',
    dates: null,
    guests: { adults: 1, children: 0 }, // start at 1 adult, 0 children
    priceRange: [1000, 50000],
    rating: 0,
    sortBy: 'price-low'
  });


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(12);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchRooms();

    const savedFavorites = JSON.parse(localStorage.getItem('favorite-rooms') || '[]');
    setFavorites(savedFavorites);
  }, [navigate]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get('/api/rooms/getallrooms');

      const roomsData = Array.isArray(data) ? data : data.rooms || [];
      console.log('Fetched rooms:', roomsData.length);

      setRooms(roomsData);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to load rooms. Please try again.');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Debug section
  useEffect(() => {
    if (rooms.length > 0) {
      console.log('=== DATABASE IMAGE URLs DEBUG ===');
      rooms.forEach((room, index) => {
        console.log(`Room ${index + 1}: ${room.name}`);
        console.log('Image URLs:', room.imageurls);
        if (room.imageurls && room.imageurls[0]) {
          console.log('First image type:', typeof room.imageurls[0]);
          console.log('First image value:', room.imageurls[0]);
        }
        console.log('---');
      });
      console.log('=====================================');
    }
  }, [rooms]);

  // Memoized filtered rooms
  const processedRooms = useMemo(() => {
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return [];
    }

    let filtered = [...rooms];

    // Text search
    if (searchParams.destination.trim()) {
      const searchTerm = searchParams.destination.toLowerCase().trim();
      filtered = filtered.filter(room =>
        room.name?.toLowerCase().includes(searchTerm) ||
        room.description?.toLowerCase().includes(searchTerm) ||
        room.type?.toLowerCase().includes(searchTerm)
      );
    }

    // Date availability filter
    if (searchParams.dates && Array.isArray(searchParams.dates) && searchParams.dates.length === 2) {
      const [checkIn, checkOut] = searchParams.dates;
      if (moment.isMoment(checkIn) && moment.isMoment(checkOut)) {
        filtered = filtered.filter(room => {
          if (!room.currentbookings || !Array.isArray(room.currentbookings)) return true;

          return !room.currentbookings.some(booking => {
            const bookingStart = moment(booking.fromdate);
            const bookingEnd = moment(booking.todate);

            return (
              checkIn.isBetween(bookingStart, bookingEnd, null, '[]') ||
              checkOut.isBetween(bookingStart, bookingEnd, null, '[]') ||
              bookingStart.isBetween(checkIn, checkOut, null, '[]') ||
              bookingEnd.isBetween(checkIn, checkOut, null, '[]')
            );
          });
        });
      }
    }

    // Price range filter
    filtered = filtered.filter(room => {
      const price = room.currentPrice || room.rentperday || 0;
      return price >= searchParams.priceRange[0] && price <= searchParams.priceRange[1];
    });

    // Guest capacity filter
    const totalGuests = (searchParams.guests?.adults || 0) + (searchParams.guests?.children || 0);
    if (totalGuests > 0) {
      filtered = filtered.filter(room => (room.maxcount || 0) >= totalGuests);
    }

    // Rating filter
    if (searchParams.rating > 0) {
      filtered = filtered.filter(room =>
        (room.ratings?.average || 0) >= searchParams.rating
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      const priceA = a.currentPrice || a.rentperday || 0;
      const priceB = b.currentPrice || b.rentperday || 0;

      switch (searchParams.sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'rating':
          return (b.ratings?.average || 0) - (a.ratings?.average || 0);
        case 'popular':
          return (b.ratings?.totalReviews || 0) - (a.ratings?.totalReviews || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [rooms, searchParams]);

  useEffect(() => {
    setFilteredRooms(processedRooms);
    setCurrentPage(1);
  }, [processedRooms]);

const updateSearchParams = useCallback((updates) => {
  console.log('Updating searchParams:', updates);
  setSearchParams(prev => ({ ...prev, ...updates }));
}, []);



  const getCurrentPageRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * roomsPerPage;
    const endIndex = startIndex + roomsPerPage;
    return filteredRooms.slice(startIndex, endIndex);
  }, [filteredRooms, currentPage, roomsPerPage]);

  const toggleFavorite = useCallback((roomId) => {
    const newFavorites = favorites.includes(roomId)
      ? favorites.filter(id => id !== roomId)
      : [...favorites, roomId];
    setFavorites(newFavorites);
    localStorage.setItem('favorite-rooms', JSON.stringify(newFavorites));
  }, [favorites]);

  const clearAllFilters = useCallback(() => {
    setSearchParams({
      destination: '',
      dates: null,
      guests: { adults: 2, children: 0 },
      priceRange: [1000, 50000],
      rating: 0,
      sortBy: 'price-low'
    });
  }, []);

  // Error state
  if (error && !loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <Error message={error} />
            <div className="text-center mt-3">
              <button className="btn btn-primary" onClick={fetchRooms}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

 const GuestsPicker = ({ guests, setGuests, maxGuests = 10 }) => {
  const totalGuests = guests.adults + guests.children;


 const menuItems = [
  {
    key: 'adults',
    label: (
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <strong>Adults</strong><br />
          <small>Age 13+</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button 
            size="small"
            disabled={guests.adults <= 1}
            onClick={() => setGuests({ ...guests, adults: guests.adults - 1 })}
          >−</Button>
          <span>{guests.adults}</span>
          <Button 
            size="small"
            disabled={totalGuests >= maxGuests}
            onClick={() => setGuests({ ...guests, adults: guests.adults + 1 })}
          >+</Button>
        </div>
      </div>
    ),
  },
  {
    key: 'children',
    label: (
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <strong>Children</strong><br />
          <small>Age 2-12</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button 
            size="small"
            disabled={guests.children <= 0}
            onClick={() => setGuests({ ...guests, children: guests.children - 1 })}
          >−</Button>
          <span>{guests.children}</span>
          <Button 
            size="small"
            disabled={totalGuests >= maxGuests}
            onClick={() => setGuests({ ...guests, children: guests.children + 1 })}
          >+</Button>
        </div>
      </div>
    ),
  },
];

const menu = { items: menuItems };


  return (
   <Dropdown menu={menu} trigger={['click']}>
  <Button
    className="btn btn-outline-secondary btn-lg w-100 d-flex justify-content-between align-items-center"
    style={{ height: '48px' }}
  >
    {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
  </Button>
</Dropdown>
  );
};


  return (
    <>
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Hero Search Section */}
        <div className="py-5" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div className="container">
            <div className="text-center mb-4">
              <h1 className="display-4 text-white fw-bold mb-3">
                Find Your Perfect Stay
              </h1>
              <p className="lead text-white opacity-75">
                Discover amazing places to stay around the world
              </p>
            </div>

            {/* ✅ COMPLETELY FIXED Search Card */}
            <div className="card shadow-lg">
              <div className="card-body p-4">
                <div className="row g-3">
                  {/* Destination */}
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">📍 Destination</label>
                    <input
                      type="text"
                      placeholder="Where are you going?"
                      value={searchParams.destination}
                      onChange={(e) => updateSearchParams({ destination: e.target.value })}
                      className="form-control form-control-lg"
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-semibold">📅 Check-in / Check-out</label>
                    <RangePicker
                      value={searchParams.dates}
                      onChange={(dates) => updateSearchParams({ dates })}
                      format="DD MMM YYYY"
                      placeholder={['Check-in', 'Check-out']}
                      size="large"
                      style={{ width: '100%', height: '48px' }}
                      disabledDate={(current) => current && current < moment().startOf('day')}
                      allowClear
                      getPopupContainer={() => document.body}
                      inputReadOnly={true}

                      autoFocus={false}
                    />
                  </div>

<div className="col-md-2">
  <label className="form-label fw-semibold">👥 Guests</label>
  <GuestsPicker 
    guests={searchParams.guests} 
    setGuests={(newGuests) => updateSearchParams({ guests: newGuests })}
    maxGuests={10} // or dynamic max
  />
</div>
                  {/* ✅ FIXED Sort Dropdown */}
                  <div className="col-md-2">
                    <label className="form-label fw-semibold">Sort By</label>
                    <Select
                      value={searchParams.sortBy}
                      onChange={(value) => updateSearchParams({ sortBy: value })}
                      size="large"
                      style={{ width: '100%', height: '48px' }}
                      classNames={{ popup: { root: "sort-dropdown-popup" } }}
                      getPopupContainer={() => document.body}
                    >
                      <Option value="price-low">Price: Low to High</Option>
                      <Option value="price-high">Price: High to Low</Option>
                      <Option value="rating">Highest Rated</Option>
                      <Option value="popular">Most Popular</Option>
                    </Select>
                  </div>

                  {/* Search Button */}
                  <div className="col-md-2 d-flex align-items-end">
                    <button
                      className="btn btn-primary btn-lg w-100"
                      style={{ height: '48px' }}
                      disabled={loading}
                    >
                      🔍 Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-4">
          {/* Quick Filters */}
          <div className="mb-4">
            <div className="d-flex flex-wrap gap-2">
              <button
                onClick={() => updateSearchParams({ priceRange: [0, 5000] })}
                className="btn btn-outline-primary btn-sm"
              >
                Under ₹5,000
              </button>
              <button
                onClick={() => updateSearchParams({ priceRange: [10000, 50000] })}
                className="btn btn-outline-primary btn-sm"
              >
                Luxury (₹10K+)
              </button>
              <button
                onClick={() => updateSearchParams({ rating: 4 })}
                className="btn btn-outline-primary btn-sm"
              >
                4+ Stars
              </button>
              <button
                onClick={clearAllFilters}
                className="btn btn-outline-secondary btn-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="h4 mb-1">
                {searchParams.destination || 'All Properties'}
              </h2>
              <p className="text-muted mb-0">
                {filteredRooms.length} propert{filteredRooms.length !== 1 ? 'ies' : 'y'} found
                {searchParams.dates && searchParams.dates.length === 2 && (
                  <span className="ms-2 text-primary fw-bold">
                    for {searchParams.dates[0].format('MMM DD')} - {searchParams.dates[1].format('MMM DD')}
                  </span>
                )}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="btn-group" role="group">
              <button
                onClick={() => setViewMode('grid')}
                className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                ⊞ Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                ☰ List
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-5">
              <Loader />
              <p className="mt-3 text-muted">Finding the best rooms for you...</p>
            </div>
          )}

          {/* Results */}
          {!loading && (
            <>
              {filteredRooms.length === 0 ? (
                <div className="text-center py-5">
                  <div className="card">
                    <div className="card-body">
                      <h3 className="text-muted mb-3">🏨 No properties found</h3>
                      <p className="text-muted mb-4">
                        Try adjusting your search criteria
                      </p>
                      <button
                        className="btn btn-primary"
                        onClick={clearAllFilters}
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`row ${viewMode === 'grid' ? 'row-cols-1 row-cols-md-2 row-cols-lg-3' : 'row-cols-1'}`}>
                    {getCurrentPageRooms.map((room) => (
                      <div key={room._id} className="col mb-4">
                        <div className="position-relative">
                          <Room
                            room={room}
                            fromdate={searchParams.dates?.[0]?.format('DD-MM-YYYY')}
                            todate={searchParams.dates?.[1]?.format('DD-MM-YYYY')}
                          />

                          {/* Favorite Button */}
                          <button
                            className={`btn position-absolute top-0 end-0 m-3 ${favorites.includes(room._id)
                              ? 'btn-danger'
                              : 'btn-outline-danger'
                              }`}
                            onClick={() => toggleFavorite(room._id)}
                            style={{ zIndex: 1 }}
                          >
                            {favorites.includes(room._id) ? '❤️' : '🤍'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {filteredRooms.length > roomsPerPage && (
                    <div className="d-flex justify-content-center mt-4">
                      <Pagination
                        current={currentPage}
                        total={filteredRooms.length}
                        pageSize={roomsPerPage}
                        onChange={setCurrentPage}
                        showSizeChanger={false}
                        showQuickJumper
                        showTotal={(total, range) =>
                          `${range[0]}-${range[1]} of ${total} properties`
                        }
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* ✅ PROFESSIONAL FOOTER SECTION */}
      <footer className="bg-dark text-light py-5 mt-5">
        <div className="container">
          <div className="row g-4">
            {/* Company Info */}
            <div className="col-lg-4 col-md-6">
              <div className="mb-4">
                <h2 className="h4 fw-bold text-primary mb-3">
                  🏨 SheyRooms
                </h2>
                <p className="text-light opacity-75 mb-3">
                  Your trusted partner for finding the perfect accommodation.
                  We connect travelers with amazing stays worldwide, ensuring
                  comfort, quality, and unforgettable experiences.
                </p>
                <div className="d-flex gap-3">
                  <a href="#" className="text-light opacity-75 hover-opacity-100">
                    <i className="fab fa-facebook-f fs-5"></i>
                  </a>
                  <a href="#" className="text-light opacity-75 hover-opacity-100">
                    <i className="fab fa-twitter fs-5"></i>
                  </a>
                  <a href="#" className="text-light opacity-75 hover-opacity-100">
                    <i className="fab fa-instagram fs-5"></i>
                  </a>
                  <a href="#" className="text-light opacity-75 hover-opacity-100">
                    <i className="fab fa-linkedin-in fs-5"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-2 col-md-6">
              <h5 className="fw-bold mb-3">Quick Links</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a href="/home" className="text-light opacity-75 text-decoration-none hover-opacity-100">
                    Browse Hotels
                  </a>
                </li>
                <li className="mb-2">
                  <a href="/about" className="text-light opacity-75 text-decoration-none hover-opacity-100">
                    About Us
                  </a>
                </li>
                <li className="mb-2">
                  <a href="/contact" className="text-light opacity-75 text-decoration-none hover-opacity-100">
                    Contact
                  </a>
                </li>
                <li className="mb-2">
                  <a href="/careers" className="text-light opacity-75 text-decoration-none hover-opacity-100">
                    Careers
                  </a>
                </li>
                <li className="mb-2">
                  <a href="/blog" className="text-light opacity-75 text-decoration-none hover-opacity-100">
                    Travel Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="col-lg-2 col-md-6">
              <h5 className="fw-bold mb-3">Support</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a href="/help" className="text-light opacity-75 text-decoration-none hover-opacity-100">
                    Help Center
                  </a>
                </li>
                <li className="mb-2">
                  <a href="/safety" className="text-light opacity-75 text-decoration-none hover-opacity-100">
                    Safety Guidelines
                  </a>
                </li>
                <li className="mb-2">
                  <a href="/cancellation" className="text-light opacity-75 text-decoration-none hover-opacity-100">
                    Cancellation Policy
                  </a>
                </li>
                <li className="mb-2">
                  <a href="/terms" className="text-light opacity-75 text-decoration-none hover-opacity-100">
                    Terms of Service
                  </a>
                </li>
                <li className="mb-2">
                  <a href="/privacy" className="text-light opacity-75 text-decoration-none hover-opacity-100">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="col-lg-4 col-md-6">
              <h5 className="fw-bold mb-3">Get in Touch</h5>
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <i className="fas fa-phone text-primary me-3"></i>
                  <span className="text-light opacity-75">+91 98765 43210</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <i className="fas fa-envelope text-primary me-3"></i>
                  <span className="text-light opacity-75">support@sheyrooms.com</span>
                </div>
                <div className="d-flex align-items-start mb-3">
                  <i className="fas fa-map-marker-alt text-primary me-3 mt-1"></i>
                  <span className="text-light opacity-75">
                    123 Business District<br />
                    Hyderabad, Telangana 500001<br />
                    India
                  </span>
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-dark bg-opacity-50 p-3 rounded">
                <h6 className="fw-bold mb-2">Subscribe to Our Newsletter</h6>
                <p className="small text-light opacity-75 mb-3">
                  Get the latest deals and travel tips delivered to your inbox.
                </p>
                <div className="input-group">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                  />
                  <button className="btn btn-primary" type="button">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <hr className="my-4 opacity-25" />
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="text-light opacity-75 mb-0">
                © 2024 SheyRooms. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="d-flex justify-content-md-end gap-3 flex-wrap">
                <img
                  src="https://img.icons8.com/color/48/visa.png"
                  alt="Visa"
                  style={{ height: '24px' }}
                />
                <img
                  src="https://img.icons8.com/color/48/mastercard-logo.png"
                  alt="Mastercard"
                  style={{ height: '24px' }}
                />
                <img
                  src="https://img.icons8.com/color/48/paypal.png"
                  alt="PayPal"
                  style={{ height: '24px' }}
                />
                <img
                  src="https://img.icons8.com/color/48/google-pay-india.png"
                  alt="Google Pay"
                  style={{ height: '24px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .ant-picker {
          border-radius: 8px !important;
          border: 1px solid #ced4da !important;
        }
        
        .ant-picker:hover {
          border-color: #0d6efd !important;
        }
        
        .ant-picker-focused {
          border-color: #0d6efd !important;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25) !important;
        }
        
        .ant-picker-dropdown {
          z-index: 5000 !important;
        }
        
        .sort-dropdown-popup {
          z-index: 9999 !important;
        }
        
        .hover-opacity-100:hover {
          opacity: 1 !important;
        }
      `}</style>
    </>
  );
};

export default Homescreen;
