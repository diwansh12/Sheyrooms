// src/Components/Room.js - FIXED for Character Array URLs
import React, { useState } from 'react';
import { Modal, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Room({ room, fromdate, todate }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  
  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // ✅ FIXED: Convert character array to string URL
  const getImageUrl = (imageItem) => {
    if (typeof imageItem === 'string') {
      return imageItem;
    }
    
    if (typeof imageItem === 'object' && imageItem !== null) {
      // Check if it has url/src properties first
      if (imageItem.url) return imageItem.url;
      if (imageItem.src) return imageItem.src;
      if (imageItem.href) return imageItem.href;
      
      // ✅ FIXED: Convert character array to string
      // Your URLs are stored as {0: 'h', 1: 't', 2: 't', ...}
      const chars = [];
      let index = 0;
      
      // Extract characters in order until we don't find the next index
      while (imageItem[index] !== undefined) {
        chars.push(imageItem[index]);
        index++;
      }
      
      // Join characters to form the complete URL
      const url = chars.join('');
      
      // Validate it's a proper URL
      if (url.startsWith('http')) {
        return url;
      }
    }
    
    return '';
  };
  
  return (
    <div className="enhanced-card mb-4 p-4">
      <div className="row g-4">
        {/* Room Image */}
        <div className="col-md-4">
          <div className="position-relative">
            {room.imageurls && room.imageurls.length > 0 && (
              <img 
                src={getImageUrl(room.imageurls[0])}
                className="smallimg w-100 rounded"
                style={{ height: '200px', objectFit: 'cover' }}
                alt={room.name}
                onLoad={() => console.log('✅ Image loaded:', getImageUrl(room.imageurls[0]))}
                onError={() => console.log('❌ Image failed:', getImageUrl(room.imageurls[0]))}
              />
            )}
            {room.discountPercent > 0 && (
              <div className="position-absolute top-0 end-0 bg-danger text-white px-2 py-1 rounded-bottom-start">
                {room.discountPercent}% OFF
              </div>
            )}
          </div>
        </div>

        {/* Room Details */}
        <div className="col-md-8">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h3 className="mb-1 fw-bold">{room.name}</h3>
              <div className="d-flex align-items-center mb-2">
                <span className="badge bg-primary me-2">{room.type}</span>
                {room.ratings?.average > 0 && (
                  <div className="d-flex align-items-center text-warning">
                    <span>⭐</span>
                    <span className="ms-1 fw-bold">{room.ratings.average.toFixed(1)}</span>
                    <span className="text-muted ms-1">({room.ratings.totalReviews} reviews)</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-end">
              <div className="text-primary fw-bold fs-4">
                {formatPrice(room.currentPrice || room.rentperday)}
              </div>
              <small className="text-muted">per night</small>
            </div>
          </div>

          {/* Room Features */}
          <div className="row g-3 mb-3">
            <div className="col-auto">
              <small className="text-muted">
                👥 Max {room.maxcount} guests
              </small>
            </div>
            <div className="col-auto">
              <small className="text-muted">
                📞 {room.phonenumber}
              </small>
            </div>
            {room.amenities?.slice(0, 3).map((amenity, index) => (
              <div key={index} className="col-auto">
                <small className="text-muted">
                  • {amenity.name || amenity}
                </small>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="outline-primary" onClick={handleShow}>
              View Details
            </Button>
            
            {fromdate && todate && (
              <Link to={`/book/${room._id}/${fromdate}/${todate}`}>
                <Button variant="primary">
                  Book Now
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal show={show} onHide={handleClose} size="xl" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-3">{room.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <div className="row g-4">
            {/* Image Carousel */}
            <div className="col-md-8">
              {room.imageurls && room.imageurls.length > 0 && (
                <Carousel className="rounded overflow-hidden">
                  {room.imageurls.map((imageItem, index) => (
                    <Carousel.Item key={index}>
                      <img 
                        className="d-block w-100" 
                        src={getImageUrl(imageItem)}
                        alt={`${room.name} - Image ${index + 1}`}
                        style={{ height: '400px', objectFit: 'cover' }}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              )}
            </div>

            {/* Room Info */}
            <div className="col-md-4">
              <div className="card h-100 border-0 bg-light">
                <div className="card-body">
                  <h5 className="card-title">Room Details</h5>
                  
                  <div className="mb-3">
                    <strong>Price:</strong> {formatPrice(room.rentperday)}/night
                  </div>
                  
                  <div className="mb-3">
                    <strong>Type:</strong> {room.type}
                  </div>
                  
                  <div className="mb-3">
                    <strong>Capacity:</strong> Up to {room.maxcount} guests
                  </div>
                  
                  <div className="mb-3">
                    <strong>Contact:</strong> {room.phonenumber}
                  </div>

                  {room.amenities && room.amenities.length > 0 && (
                    <div>
                      <strong>Amenities:</strong>
                      <ul className="list-unstyled mt-2">
                        {room.amenities.map((amenity, index) => (
                          <li key={index} className="mb-1">
                            <small>✓ {amenity.name || amenity}</small>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="col-12">
              <h5>About this room</h5>
              <p className="text-muted">{room.description}</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
          {fromdate && todate && (
            <Link to={`/book/${room._id}/${fromdate}/${todate}`}>
              <Button variant="primary" onClick={handleClose}>
                Book This Room
              </Button>
            </Link>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Room;
