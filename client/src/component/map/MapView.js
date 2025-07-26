// components/map/MapView.jsx - Interactive Map Component
import React, { useState, useEffect, useRef } from 'react';

const MapView = ({ rooms = [], onRoomSelect, center = { lat: 28.6139, lng: 77.2090 } }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Google Maps
  useEffect(() => {
    if (!window.google) {
      loadGoogleMapsScript();
    } else {
      initializeMap();
    }
  }, []);

  // Update markers when rooms change
  useEffect(() => {
    if (map && rooms.length > 0) {
      updateMarkers();
    }
  }, [map, rooms]);

  const loadGoogleMapsScript = () => {
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    script.onerror = () => {
      setError('Failed to load Google Maps. Using fallback map...');
      initializeFallbackMap();
    };
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 12,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(mapInstance);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      setError('Maps unavailable. Showing list view...');
      initializeFallbackMap();
    }
  };

  const initializeFallbackMap = () => {
    setIsLoading(false);
    setError('Google Maps not available');
  };

  const updateMarkers = () => {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers = rooms.map((room, index) => {
      // Generate mock coordinates for demonstration
      const lat = center.lat + (Math.random() - 0.5) * 0.1;
      const lng = center.lng + (Math.random() - 0.5) * 0.1;

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: room.name,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="#fff" stroke-width="2"/>
              <text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">
                ₹${Math.floor((room.currentPrice || room.rentperday) / 1000)}k
              </text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40)
        }
      });

      marker.addListener('click', () => {
        setSelectedRoom(room);
        onRoomSelect?.(room);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Adjust map bounds to fit all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
      map.fitBounds(bounds);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (error && !map) {
    return (
      <div className="map-fallback">
        <div className="alert alert-info">
          <h5>📍 Properties in your search area</h5>
          <p className="mb-3">Map view is currently unavailable. Here are the properties:</p>
          <div className="row">
            {rooms.map((room) => (
              <div key={room._id} className="col-md-6 col-lg-4 mb-3">
                <div 
                  className="card h-100 cursor-pointer"
                  onClick={() => onRoomSelect?.(room)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={room.imageurls?.[0]?.url || room.imageurls?.[0] || '/placeholder-room.jpg'} 
                    className="card-img-top"
                    style={{ height: '150px', objectFit: 'cover' }}
                    alt={room.name}
                    onError={(e) => {
                      e.target.src = '/placeholder-room.jpg';
                    }}
                  />
                  <div className="card-body p-3">
                    <h6 className="card-title mb-2">{room.name}</h6>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">{room.type}</small>
                      <span className="fw-bold text-primary">
                        {formatPrice(room.currentPrice || room.rentperday)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container position-relative" style={{ height: '100%' }}>
      {isLoading && (
        <div className="position-absolute top-50 start-50 translate-middle">
          <div className="d-flex flex-column align-items-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading map...</span>
            </div>
            <p className="text-muted">Loading map...</p>
          </div>
        </div>
      )}

      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: '400px',
          borderRadius: '8px'
        }} 
      />

      {/* Selected Room Info Card */}
      {selectedRoom && (
        <div className="position-absolute bottom-0 start-0 end-0 p-3">
          <div className="card shadow-lg">
            <div className="card-body">
              <div className="row g-3 align-items-center">
                <div className="col-md-3">
                  <img 
                    src={selectedRoom.imageurls?.[0]?.url || selectedRoom.imageurls?.[0] || '/placeholder-room.jpg'}
                    className="img-fluid rounded"
                    style={{ height: '80px', width: '100%', objectFit: 'cover' }}
                    alt={selectedRoom.name}
                    onError={(e) => {
                      e.target.src = '/placeholder-room.jpg';
                    }}
                  />
                </div>
                <div className="col-md-6">
                  <h5 className="card-title mb-1">{selectedRoom.name}</h5>
                  <p className="card-text mb-1">
                    <small className="text-muted">
                      {selectedRoom.type} • Up to {selectedRoom.maxcount} guests
                    </small>
                  </p>
                  {selectedRoom.ratings?.average > 0 && (
                    <div className="d-flex align-items-center">
                      <span className="badge bg-success me-2">
                        ⭐ {selectedRoom.ratings.average.toFixed(1)}
                      </span>
                      <small className="text-muted">
                        ({selectedRoom.ratings.totalReviews} reviews)
                      </small>
                    </div>
                  )}
                </div>
                <div className="col-md-3 text-end">
                  <div className="h4 text-primary mb-1">
                    {formatPrice(selectedRoom.currentPrice || selectedRoom.rentperday)}
                  </div>
                  <small className="text-muted">per night</small>
                  <div className="mt-2">
                    <button 
                      className="btn btn-primary btn-sm w-100"
                      onClick={() => onRoomSelect?.(selectedRoom)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
                <button 
                  className="btn-close position-absolute top-0 end-0 m-2"
                  onClick={() => setSelectedRoom(null)}
                  aria-label="Close"
                ></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="position-absolute top-0 end-0 m-3">
        <div className="btn-group-vertical">
          <button 
            className="btn btn-light btn-sm"
            onClick={() => map?.setZoom(map.getZoom() + 1)}
            title="Zoom In"
          >
            <i className="fas fa-plus"></i>
          </button>
          <button 
            className="btn btn-light btn-sm"
            onClick={() => map?.setZoom(map.getZoom() - 1)}
            title="Zoom Out"
          >
            <i className="fas fa-minus"></i>
          </button>
          <button 
            className="btn btn-light btn-sm"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                  const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  };
                  map?.setCenter(pos);
                  map?.setZoom(15);
                });
              }
            }}
            title="My Location"
          >
            <i className="fas fa-location-arrow"></i>
          </button>
        </div>
      </div>

      {/* Room Count Badge */}
      {rooms.length > 0 && (
        <div className="position-absolute top-0 start-0 m-3">
          <span className="badge bg-primary fs-6">
            {rooms.length} propert{rooms.length !== 1 ? 'ies' : 'y'} shown
          </span>
        </div>
      )}
    </div>
  );
};

export default MapView;
