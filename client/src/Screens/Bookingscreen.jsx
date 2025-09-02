// screens/Bookingscreen.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Modal, Divider, Steps, Card, Row, Col, Tag, Spin } from 'antd';
import moment from 'moment';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { bookingsAPI, roomsAPI, usersAPI } from '../axiosConfig'; 
import {
  CalendarOutlined,
  UserOutlined,
  CreditCardOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WalletOutlined,
  BankOutlined,
  GiftOutlined,
  InfoCircleOutlined,
  StarFilled,
  WifiOutlined,
  CarOutlined,
  CoffeeOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';

const { Step } = Steps;

function Bookingscreen() {
  const { roomid, fromdate, todate } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [room, setRoom] = useState(null);
  const [totalamount, setTotalamount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [guestPhone, setGuestPhone] = useState(currentUser?.phone || '');

  const from = moment(fromdate, 'DD-MM-YYYY');
  const to = moment(todate, 'DD-MM-YYYY');
  const isValidDates = from.isValid() && to.isValid();
  const isoFrom = isValidDates ? from.format('YYYY-MM-DD') : null;
  const isoTo = isValidDates ? to.format('YYYY-MM-DD') : null;
  const totalDays = to.diff(from, 'days') + 1;

  // Calculate pricing breakdown
  const basePrice = room ? room.rentperday * totalDays : 0;
  const serviceFee = Math.round(basePrice * 0.1);
  const taxes = Math.round(basePrice * 0.12);
  const discount = 0;
  const finalTotal = basePrice + serviceFee + taxes - discount;

  useEffect(() => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const token = localStorage.getItem("token");
  console.log("User token:", token);

  if (!user || !user._id) {
    message.warning('Please login to continue booking');
    navigate('/login');
    return;
  }
  setCurrentUser(user);


    const fetchRoom = async () => {
      if (!isValidDates) {
        setError('Invalid dates provided');
        setLoading(false);
        return;
      }

      try {
        const response = await roomsAPI.getById(roomid);
        setRoom(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching room:', err);
        setError('Failed to load room details');
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomid, isValidDates, navigate]);

  useEffect(() => {
    if (room && totalDays > 0) {
      setTotalamount(finalTotal);
    }
  }, [room, totalDays, finalTotal]);

  const getImageUrl = (imageItem) => {
    if (typeof imageItem === 'string') return imageItem;
    if (typeof imageItem === 'object' && imageItem !== null) {
      if (imageItem.url) return imageItem.url;
      if (imageItem.src) return imageItem.src;
      if (imageItem.href) return imageItem.href;
      
      const chars = [];
      let index = 0;
      while (imageItem[index] !== undefined) {
        chars.push(imageItem[index]);
        index++;
      }
      const url = chars.join('');
      if (url.startsWith('http')) return url;
    }
    return 'https://via.placeholder.com/400x300/e9ecef/6c757d?text=Hotel+Room';
  };

  const handleConfirmClick = () => {
    if (!currentUser || !currentUser._id) {
      message.warning('Please login to book a room');
      return navigate('/login');
    }
    setShowModal(true);
    setCurrentStep(0);
  };

  // ✅ Add this to your frontend for better debugging
const debugBookingData = (bookingData) => {
  console.log('🧪 FRONTEND BOOKING DEBUG:', {
    // URL params (what you receive from React Router)
    urlParams: {
      roomid,
      fromdate, // DD-MM-YYYY from URL
      todate    // DD-MM-YYYY from URL
    },
    
    // Moment parsing
    momentParsing: {
      from: from.format('YYYY-MM-DD'),
      to: to.format('YYYY-MM-DD'),
      fromValid: from.isValid(),
      toValid: to.isValid(),
      totalDays: totalDays
    },
    
    // What's being sent to server
    sentToServer: {
      roomId: bookingData.roomId,
      userid: bookingData.userid,
      fromdate: bookingData.fromdate, // This should be YYYY-MM-DD
      todate: bookingData.todate,     // This should be YYYY-MM-DD
      totalNights: bookingData.totalNights,
      totalamount: bookingData.totalamount
    },
    
    // Current time comparison
    timeComparison: {
      now: new Date().toISOString(),
      isoFrom: isoFrom,
      isoTo: isoTo,
      daysFromNow: Math.ceil((from.toDate() - new Date()) / (1000 * 60 * 60 * 24))
    }
  });
};


  // ✅ SIMPLE FIX: Basic error handler
const handlePayPalError = (err) => {
  console.error('PayPal payment error:', err);
  message.error('Payment failed. Please try again.');
  setCurrentStep(0);
};


  // ✅ Updated to use bookingsAPI for PayPal booking
  const handlePayPalSuccess = async (details, data) => {
  console.log('💰 PayPal payment successful:', details);
  setPaypalLoading(true);
  setCurrentStep(1);

  try {
    const bookingData = {
      roomId: roomid,
      userid: currentUser._id,
      fromdate: isoFrom,
      todate: isoTo,
      totalamount: finalTotal,
      totalNights: totalDays,
      paymentMethod: 'paypal',
      
      guestCount: {
        adults: 2,
        children: 0,
        infants: 0
      },
      primaryGuest: {
        firstName: currentUser.name?.split(' ')[0] || 'Guest',
        lastName: currentUser.name?.split(' ').slice(1).join(' ') || 'User',
        email: currentUser.email,
        phone: currentUser.phone || '+0000000000',
        age: null,
        idType: null,
        idNumber: null
      },
      
      additionalGuests: [],
      preferences: {},
      addOns: [],
      specialRequests: '',
      
      // PayPal specific fields
      paymentDetails: {
        transactionId: details.id,
        payerEmail: details.payer.email_address,
        amount: details.purchase_units[0].amount.value,
        currency: 'USD'
      }
    };

    const response = await bookingsAPI.create(bookingData);
    
    setCurrentStep(2);
    message.success(`🎉 Booking confirmed! Reference: ${response.data.bookingId || response.data._id}`);
    
    setTimeout(() => {
      setShowModal(false);
      navigate('/profile');
    }, 3000);
    
  } catch (err) {
    console.error('❌ Booking error after PayPal payment:', err);
    
    // ✅ FIXED: Properly destructure the error response
    const errorStatus = err.response?.status;
    const errorData = err.response?.data;
    
    if (errorStatus === 409) {
      console.error('🚫 PayPal payment succeeded but room booking failed:', {
        transactionId: details.id,
        conflicts: errorData?.conflictingBookings
      });
      
      message.error({
        content: `Payment successful but room became unavailable. Transaction ID: ${details.id}. Please contact support for refund.`,
        duration: 8
      });
    } else if (errorStatus === 400) {
      message.error(`Booking validation failed: ${errorData?.message || 'Invalid data'}`);
    } else if (errorStatus === 403) {
      message.error('Authentication failed. Please login again.');
    } else {
      message.error(`Booking failed after payment. Transaction ID: ${details.id}. Please contact support.`);
    }
    
    setCurrentStep(0);
  } finally {
    setPaypalLoading(false);
  }
};


  // ✅ Updated to use bookingsAPI for manual booking
  // In your bookingscreen component, update the handleManualBooking function:
const handleManualBooking = async () => {
  setBookingLoading(true);
  setCurrentStep(1);
  
  try {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!token || !userData._id) {
      message.error('Please login again to continue');
      navigate('/login');
      return;
    }
    
    const bookingData = {
      roomId: roomid,
      userid: userData._id,
      fromdate: isoFrom,
      todate: isoTo,
      totalamount: finalTotal,
      totalNights: totalDays,
      paymentMethod: 'manual',
      
      guestCount: {
        adults: 2,
        children: 0,
        infants: 0
      },
      primaryGuest: {
        firstName: userData.name?.split(' ')[0] || 'Guest',
        lastName: userData.name?.split(' ').slice(1).join(' ') || 'User',
        email: userData.email,
        phone: userData.phone || '+919876543210',
        age: null,
        idType: null,
        idNumber: null
      },
      
      additionalGuests: [],
      preferences: {},
      addOns: [],
      specialRequests: ''
    };

    console.log('📤 Sending booking request:', bookingData);

    const response = await bookingsAPI.create(bookingData);

    setCurrentStep(2);
    message.success(`✅ Booking confirmed! Reference: ${response.data.bookingId || response.data._id}`);

    setTimeout(() => {
      setShowModal(false);
      navigate("/mytrips");
    }, 3000);
    
  } catch (err) {
    console.error("❌ Manual booking failed:", err);
    
    // ✅ FIXED: Properly destructure the error response
    const errorStatus = err.response?.status;
    const errorData = err.response?.data;
    
    // ✅ FIXED: Use errorStatus instead of status
    if (errorStatus === 409) {
      console.error('🚫 DETAILED CONFLICT INFO:', {
        yourBooking: {
          from: isoFrom,
          to: isoTo,
          totalDays: totalDays
        },
        serverMessage: errorData?.message,
        conflicts: errorData?.conflictingBookings?.map(booking => ({
          from: booking.fromdate,
          to: booking.todate,
          status: booking.status,
          id: booking._id || booking.id
        })) || []
      });
      
      // Show user-friendly error message
      message.error({
        content: `Room not available: ${errorData?.message || 'Selected dates conflict with existing bookings'}`,
        duration: 5
      });
      
      // Show detailed conflict information
      if (errorData?.conflictingBookings?.length > 0) {
        setTimeout(() => {
          Modal.warning({
            title: '🚫 Room Not Available',
            width: 600,
            content: (
              <div>
                <div className="alert alert-warning mb-3">
                  <strong>Your Selected Dates:</strong><br />
                  {from.format('MMM DD, YYYY')} to {to.format('MMM DD, YYYY')} ({totalDays} nights)
                </div>
                
                <h6 className="fw-bold mb-3">Conflicting Bookings:</h6>
                {errorData.conflictingBookings.map((booking, index) => (
                  <div key={index} className="p-2 mb-2 border rounded bg-light">
                    <strong>Conflict #{index + 1}:</strong><br />
                    📅 {moment(booking.fromdate).format('MMM DD, YYYY')} to {moment(booking.todate).format('MMM DD, YYYY')}<br />
                    <small className="text-muted">Status: {booking.status || 'Confirmed'}</small>
                  </div>
                ))}
                
                <div className="mt-3">
                  <h6 className="text-primary">💡 Suggestions:</h6>
                  <ul>
                    <li>Try different dates for this room</li>
                    <li>Search for similar rooms on your dates</li>
                    <li>Contact the hotel for waitlist options</li>
                  </ul>
                </div>
              </div>
            ),
            onOk: () => {
              // Navigate back to search
              navigate(`/search?checkin=${fromdate}&checkout=${todate}`);
            },
            okText: 'Find Alternative',
            cancelText: 'Close'
          });
        }, 100);
      }
      
    } else if (errorStatus === 401 || errorStatus === 403) {
      message.error("Authentication failed. Please login again.");
      localStorage.clear();
      navigate('/login');
    } else if (errorStatus === 400) {
      message.error(`Validation failed: ${errorData?.message || 'Invalid booking data'}`);
    } else {
      message.error(`Booking failed. Please try again. ${errorData?.message || ''}`);
    }
    
    setCurrentStep(0);
  } finally {
    setBookingLoading(false);
  }
};

  const paypalOptions = {
    "client-id": "AZwCSNQNKFdYp5y0jcgwSGgy8ZuuX0reXn_ZHwvL5ceQCp9zHlYa7o42vJ1m42ZnzAkemKfQ3fu7HGil",
    currency: "USD",
    intent: "capture"
  };

  const paymentOptions = [
    {
      key: 'paypal',
      title: 'PayPal',
      icon: <CreditCardOutlined />,
      description: 'Secure payment via PayPal',
      badge: 'Most Popular',
      badgeColor: 'blue'
    },
    {
      key: 'manual',
      title: 'Pay at Hotel',
      icon: <BankOutlined />,
      description: 'Pay during check-in at the hotel',
      badge: 'Flexible',
      badgeColor: 'green'
    },
    {
      key: 'more',
      title: 'Other Options',
      icon: <WalletOutlined />,
      description: 'UPI, Cards, Net Banking (Coming Soon)',
      badge: 'Coming Soon',
      badgeColor: 'orange'
    }
  ];

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <Spin size="large" />
        <p className="mt-3 text-muted">Loading booking details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <h4>⚠️ {error}</h4>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/home')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!room) return <div className="container mt-5 text-center">Room not found</div>;

return (
  <>
    <div className="container mt-4" style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary mb-2">
          <CheckCircleOutlined className="me-3" />
          Complete Your Booking
        </h1>
        <p className="lead text-muted">You're just one step away from your perfect stay!</p>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column - Room Details */}
        <Col xs={24} lg={14}>
          <Card className="shadow-sm mb-4">
            <Row gutter={16}>
              <Col xs={24} md={10}>
                <div className="position-relative">
                  <img
                    src={getImageUrl(room.imageurls?.[0])}
                    alt={room.name}
                    className="w-100 rounded"
                    style={{ height: '250px', objectFit: 'cover' }}
                  />
                  {room.ratings?.average && (
                    <div className="position-absolute top-0 end-0 m-3">
                      <Tag color="gold" className="d-flex align-items-center">
                        <StarFilled className="me-1" />
                        {room.ratings.average.toFixed(1)}
                      </Tag>
                    </div>
                  )}
                </div>
              </Col>
              <Col xs={24} md={14}>
                <div className="h-100 d-flex flex-column">
                  <h3 className="fw-bold mb-3">{room.name}</h3>
                  <p className="text-muted mb-3">{room.description}</p>
                  
                  <div className="mb-3">
                    <Row gutter={[8, 8]}>
                      <Col span={12}>
                        <Tag icon={<UserOutlined />} color="blue">
                          {room.maxcount} Guests
                        </Tag>
                      </Col>
                      <Col span={12}>
                        <Tag color="purple">{room.type}</Tag>
                      </Col>
                    </Row>
                  </div>

                  <div className="mb-3">
                    <h6 className="fw-bold mb-2">Amenities:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      <Tag icon={<WifiOutlined />}>WiFi</Tag>
                      <Tag icon={<CarOutlined />}>Parking</Tag>
                      <Tag icon={<CoffeeOutlined />}>Breakfast</Tag>
                      <Tag icon={<CustomerServiceOutlined />}>24/7 Service</Tag>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted">Starting from</span>
                        <h4 className="text-primary fw-bold mb-0">
                          ₹{room.rentperday.toLocaleString()}/night
                        </h4>
                      </div>
                      <Tag color="green" className="fs-6">
                        <SafetyOutlined className="me-1" />
                        Free Cancellation
                      </Tag>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Booking Details */}
          <Card title="📋 Booking Details" className="shadow-sm">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div className="p-3 bg-light rounded">
                  <div className="d-flex align-items-center mb-2">
                    <CalendarOutlined className="text-primary me-2" />
                    <strong>Check-in</strong>
                  </div>
                  <p className="mb-0 fs-5">{from.format('ddd, DD MMM YYYY')}</p>
                  <small className="text-muted">After 2:00 PM</small>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="p-3 bg-light rounded">
                  <div className="d-flex align-items-center mb-2">
                    <CalendarOutlined className="text-primary me-2" />
                    <strong>Check-out</strong>
                  </div>
                  <p className="mb-0 fs-5">{to.format('ddd, DD MMM YYYY')}</p>
                  <small className="text-muted">Before 12:00 PM</small>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="p-3 bg-light rounded">
                  <div className="d-flex align-items-center mb-2">
                    <ClockCircleOutlined className="text-primary me-2" />
                    <strong>Duration</strong>
                  </div>
                  <p className="mb-0 fs-5">{totalDays} {totalDays === 1 ? 'Night' : 'Nights'}</p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="p-3 bg-light rounded">
                  <div className="d-flex align-items-center mb-2">
                    <UserOutlined className="text-primary me-2" />
                    <strong>Guest</strong>
                  </div>
                  <p className="mb-0 fs-5">{currentUser?.name}</p>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Right Column - Price Breakdown */}
        <Col xs={24} lg={10}>
          <Card title="💰 Price Breakdown" className="shadow-sm sticky-top" style={{ top: '20px' }}>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span>₹{room.rentperday.toLocaleString()} × {totalDays} nights</span>
                <span>₹{basePrice.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 text-muted">
                <span>Service fee</span>
                <span>₹{serviceFee.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 text-muted">
                <span>Taxes & fees</span>
                <span>₹{taxes.toLocaleString()}</span>
              </div>
            </div>
            
            <Divider />
            
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0 fw-bold">Total Amount</h5>
              <h4 className="mb-0 text-success fw-bold">₹{finalTotal.toLocaleString()}</h4>
            </div>

            <div className="alert alert-info">
              <InfoCircleOutlined className="me-2" />
              <small>
                <strong>Good to know:</strong><br />
                • Free cancellation until 24 hours before check-in<br />
                • No prepayment needed for "Pay at Hotel" option<br />
                • Property contact: {room.phonenumber}
              </small>
            </div>

            <button
              onClick={handleConfirmClick}
              className="btn btn-primary btn-lg w-100 py-3 rounded-3 fw-bold"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
            >
              <CheckCircleOutlined className="me-2" />
              Confirm Booking
            </button>

            <div className="mt-4 text-center">
              <div className="d-flex justify-content-center gap-3 text-muted">
                <small>
                  <SafetyOutlined className="me-1 text-success" />
                  Secure Payment
                </small>
                <small>
                  <CheckCircleOutlined className="me-1 text-success" />
                  Instant Confirmation
                </small>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>

    {/* Enhanced Modal with Payment Options - FIXED */}
    <Modal
      title={null}
      open={showModal}
      onCancel={() => {
        setShowModal(false);
        setCurrentStep(0);
        setPaymentMethod('paypal');
      }}
      footer={null}
      width={1000} // ✅ Increased width for better spacing
      centered
      destroyOnClose={true}
      maskClosable={false}
      className="booking-payment-modal"
      style={{ 
        zIndex: 1060,
        top: '10px'
      }}
      bodyStyle={{
        padding: '24px',
        maxHeight: '80vh',
        overflowY: 'auto',
        background: '#fafafa'
      }}
      getContainer={() => document.body} // ✅ Ensures proper z-index context
    >
      {/* Enhanced Modal Header */}
      <div className="payment-modal-header mb-4">
        <div className="text-center">
          <div className="payment-icon-wrapper mb-3">
            <CreditCardOutlined className="payment-main-icon" />
          </div>
          <h3 className="fw-bold text-dark mb-2">Secure Payment</h3>
          <p className="text-muted">Choose your preferred payment method</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Steps current={currentStep} className="custom-steps mb-4">
        <Step title="Payment Method" icon={<CreditCardOutlined />} />
        <Step title="Processing" icon={<ClockCircleOutlined />} />
        <Step title="Confirmed" icon={<CheckCircleOutlined />} />
      </Steps>

      {/* Step 0: Payment Method Selection */}
      {currentStep === 0 && (
        <div className="payment-selection-container">
          {/* Booking Summary Card */}
          <Card className="booking-summary-card mb-4">
            <Row align="middle">
              <Col span={16}>
                <h6 className="mb-1 fw-bold">{room.name}</h6>
                <p className="mb-1 text-muted">{totalDays} nights • {currentUser?.name}</p>
                <small className="text-muted">
                  {from.format('MMM DD')} - {to.format('MMM DD, YYYY')}
                </small>
              </Col>
              <Col span={8} className="text-end">
                <h4 className="text-success fw-bold mb-0">₹{finalTotal.toLocaleString()}</h4>
              </Col>
            </Row>
          </Card>

          <h5 className="text-center mb-4">Choose Your Payment Method</h5>
          
          {/* Payment Options Grid */}
          <Row gutter={[16, 16]} className="mb-4">
            {paymentOptions.map((option) => (
              <Col xs={24} sm={12} key={option.key}>
                <Card
                  className={`enhanced-payment-card cursor-pointer transition-all ${
                    paymentMethod === option.key ? 'selected-payment-method' : ''
                  }`}
                  onClick={() => setPaymentMethod(option.key)}
                  hoverable
                >
                  <div className="payment-card-content">
                    <div className="payment-card-icon">
                      {option.icon}
                    </div>
                    <h6 className="fw-bold mb-1">{option.title}</h6>
                    <p className="text-muted small mb-2">{option.description}</p>
                    <Tag color={option.badgeColor} size="small">{option.badge}</Tag>
                    
                    {paymentMethod === option.key && (
                      <div className="selection-check">
                        <CheckCircleOutlined />
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Divider className="my-4" />

          {/* Payment Method Specific Content */}
          <div className="payment-method-content">
            {/* PayPal Payment - COLLISION FIXED */}
            {paymentMethod === 'paypal' && (
              <div className="paypal-payment-section">
                <Card className="paypal-info-card mb-4">
                  <div className="text-center">
                    <h5 className="text-primary fw-bold mb-2">
                      Total: ${Math.round(finalTotal / 83)} USD
                    </h5>
                    <p className="text-muted mb-0">
                      Converted from ₹{finalTotal.toLocaleString()} • Secure PayPal Payment
                    </p>
                  </div>
                </Card>
                
                {/* Enhanced PayPal Button Container - FIXED */}
                <div className="paypal-container-fixed">
                  <div className="paypal-button-wrapper">
                    <PayPalScriptProvider options={paypalOptions}>
                      <PayPalButtons
                        style={{ 
                          layout: "horizontal",
                          color: "blue",
                          shape: "rect",
                          label: "pay",
                          height: 50,
                          tagline: false
                        }}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            purchase_units: [{
                              amount: {
                                value: Math.round(finalTotal / 83).toString(),
                                currency_code: "USD"
                              },
                              description: `Hotel booking for ${room.name}`
                            }]
                          });
                        }}
                        onApprove={async (data, actions) => {
                          const details = await actions.order.capture();
                          handlePayPalSuccess(details, data);
                        }}
                        onError={handlePayPalError}
                        onCancel={() => {
                          message.info('Payment cancelled');
                          setCurrentStep(0);
                        }}
                      />
                    </PayPalScriptProvider>
                  </div>
                  
                  <div className="paypal-security-notice mt-3 text-center">
                    <small className="text-muted">
                      <SafetyOutlined className="text-success me-1" />
                      Protected by PayPal's buyer protection program
                    </small>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Payment - Enhanced */}
            {paymentMethod === 'manual' && (
              <div className="manual-payment-section">
                <Card className="manual-payment-card">
                  <div className="text-center">
                    <div className="manual-payment-icon mb-3">
                      <BankOutlined />
                    </div>
                    <h5 className="fw-bold mb-3">Pay at Hotel</h5>
                    
                    <div className="amount-display mb-4">
                      <h4 className="text-success fw-bold mb-1">₹{finalTotal.toLocaleString()}</h4>
                      <p className="text-muted">Total amount due at check-in</p>
                    </div>

                    <div className="payment-benefits mb-4">
                      <Row gutter={[16, 8]}>
                        <Col span={12}>
                          <small><CheckCircleOutlined className="text-success me-1" />Instant confirmation</small>
                        </Col>
                        <Col span={12}>
                          <small><CheckCircleOutlined className="text-success me-1" />No online payment</small>
                        </Col>
                        <Col span={12}>
                          <small><CheckCircleOutlined className="text-success me-1" />Any payment method</small>
                        </Col>
                        <Col span={12}>
                          <small><CheckCircleOutlined className="text-success me-1" />Free cancellation</small>
                        </Col>
                      </Row>
                    </div>
                    
                    <button 
                      className="btn btn-success btn-lg px-5 py-3 rounded-pill fw-bold confirm-manual-btn"
                      onClick={handleManualBooking}
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? (
                        <>
                          <Spin size="small" className="me-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircleOutlined className="me-2" />
                          Confirm Booking
                        </>
                      )}
                    </button>
                  </div>
                </Card>
              </div>
            )}

            {/* Coming Soon Option */}
            {paymentMethod === 'more' && (
              <div className="coming-soon-section text-center">
                <Card className="coming-soon-card">
                  <WalletOutlined className="coming-soon-icon mb-3" />
                  <h5 className="fw-bold mb-3">More Payment Options</h5>
                  <p className="text-muted mb-3">
                    We're working on adding UPI, Credit/Debit Cards, and Net Banking options.
                  </p>
                  <Tag color="orange">Coming Soon</Tag>
                  <div className="mt-4">
                    <small className="text-muted">Please choose PayPal or Pay at Hotel for now.</small>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 1: Processing */}
      {currentStep === 1 && (
        <div className="processing-section text-center py-5">
          <Spin size="large" className="mb-3" />
          <h5 className="fw-bold mb-2">
            {paypalLoading ? 'Processing PayPal Payment...' : 'Processing Your Booking...'}
          </h5>
          <p className="text-muted">
            Please wait while we confirm your reservation. Do not close this window.
          </p>
          <div className="processing-animation mt-4">
            <div className="processing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Confirmation */}
      {currentStep === 2 && (
        <div className="confirmation-section text-center py-5">
          <div className="success-animation mb-4">
            <CheckCircleOutlined className="success-icon" />
          </div>
          <h3 className="text-success fw-bold mb-3">🎉 Booking Confirmed!</h3>
          <p className="lead mb-4">
            Your reservation has been successfully confirmed. 
            You'll receive a confirmation email shortly.
          </p>
          
          <Card className="confirmation-details">
            <Row gutter={[16, 8]} className="mb-3">
              <Col span={8}><strong>Booking ID:</strong></Col>
              <Col span={16} className="text-end">BK{Date.now().toString().slice(-6)}</Col>
              
              <Col span={8}><strong>Room:</strong></Col>
              <Col span={16} className="text-end">{room.name}</Col>
              
              <Col span={8}><strong>Total Paid:</strong></Col>
              <Col span={16} className="text-end text-success fw-bold">₹{finalTotal.toLocaleString()}</Col>
            </Row>
          </Card>

          <div className="next-steps mt-4">
            <h6 className="fw-bold mb-2">Next Steps:</h6>
            <ul className="text-start">
              <li>Check your email for booking confirmation</li>
              <li>Present your booking ID at check-in</li>
              <li>Arrive after 2:00 PM on your check-in date</li>
            </ul>
          </div>
        </div>
      )}
    </Modal>

    {/* Enhanced Custom Styles - COMPLETE FIX */}
    <style>{`
      /* ✅ ENHANCED PAYMENT MODAL STYLES */
      .booking-payment-modal .ant-modal-content {
        border-radius: 16px !important;
        overflow: visible !important;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2) !important;
      }
      
      .booking-payment-modal .ant-modal-body {
        background: #fafafa !important;
        position: relative;
        z-index: 1070 !important;
        padding-bottom: 80px !important;
      }

      /* ✅ MODAL HEADER STYLING */
      .payment-modal-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin: -24px -24px 24px -24px;
        padding: 32px 24px;
        border-radius: 16px 16px 0 0;
        color: white;
      }
      
      .payment-icon-wrapper {
        width: 80px;
        height: 80px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
      }
      
      .payment-main-icon {
        font-size: 36px !important;
        color: white;
      }

      /* ✅ BOOKING SUMMARY CARD */
      .booking-summary-card {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border: 1px solid #bae6fd;
        border-radius: 12px;
      }

      /* ✅ ENHANCED PAYMENT CARDS */
      .enhanced-payment-card {
        border-radius: 12px !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        border: 2px solid #f0f0f0 !important;
        min-height: 140px !important;
        position: relative;
        overflow: hidden;
      }
      
      .enhanced-payment-card:hover {
        transform: translateY(-4px) !important;
        box-shadow: 0 12px 28px rgba(0,0,0,0.15) !important;
        border-color: #1890ff !important;
      }
      
      .enhanced-payment-card.selected-payment-method {
        border-color: #1890ff !important;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important;
        box-shadow: 0 8px 25px rgba(24, 144, 255, 0.25) !important;
      }
      
      .payment-card-content {
        text-align: center;
        padding: 20px;
        position: relative;
      }
      
      .payment-card-icon {
        font-size: 32px;
        color: #1890ff;
        margin-bottom: 12px;
      }
      
      .selection-check {
        position: absolute;
        top: 10px;
        right: 10px;
        color: #1890ff;
        font-size: 18px;
      }

      /* ✅ PAYPAL CONTAINER - COLLISION FIX */
      .paypal-container-fixed {
        position: relative;
        z-index: 1200;
        margin: 20px 0;
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        border: 1px solid #e8e8e8;
      }
      
      .paypal-button-wrapper {
        position: relative;
        z-index: 1210;
        min-height: 60px;
      }
      
      .paypal-info-card {
        background: linear-gradient(135deg, #fffbf0 0%, #fef3c7 100%);
        border: 1px solid #fcd34d;
        border-radius: 12px;
      }

      /* ✅ MANUAL PAYMENT STYLING */
      .manual-payment-card {
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        border: 1px solid #a7f3d0;
        border-radius: 12px;
        padding: 24px;
      }
      
      .manual-payment-icon {
        width: 60px;
        height: 60px;
        background: #22c55e;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        color: white;
        font-size: 24px;
      }
      
      .confirm-manual-btn {
        min-width: 200px;
        box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
      }
      
      .confirm-manual-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
      }

      /* ✅ COMING SOON SECTION */
      .coming-soon-card {
        background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
        border: 1px solid #fcd34d;
        border-radius: 12px;
        padding: 32px;
      }
      
      .coming-soon-icon {
        font-size: 48px;
        color: #f59e0b;
      }

      /* ✅ PROCESSING ANIMATION */
      .processing-dots {
        display: flex;
        justify-content: center;
        gap: 8px;
      }
      
      .processing-dots span {
        width: 8px;
        height: 8px;
        background: #1890ff;
        border-radius: 50%;
        animation: bounce 1.4s ease-in-out infinite both;
      }
      
      .processing-dots span:nth-child(1) { animation-delay: -0.32s; }
      .processing-dots span:nth-child(2) { animation-delay: -0.16s; }
      
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }

      /* ✅ SUCCESS ANIMATION */
      .success-animation {
        animation: successPulse 0.6s ease-out;
      }
      
      .success-icon {
        font-size: 72px !important;
        color: #22c55e;
      }
      
      @keyframes successPulse {
        0% { transform: scale(0.8); opacity: 0.5; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      .confirmation-details {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin: 20px 0;
      }
      
      .next-steps ul {
        max-width: 300px;
        margin: 0 auto;
      }

      /* ✅ STEPS STYLING */
      .custom-steps .ant-steps-item-finish .ant-steps-item-icon {
        background-color: #22c55e !important;
        border-color: #22c55e !important;
      }
      
      .custom-steps .ant-steps-item-process .ant-steps-item-icon {
        background-color: #1890ff !important;
        border-color: #1890ff !important;
      }

      /* ✅ CRITICAL Z-INDEX FIXES FOR PAYPAL POPUP */
      .ant-modal-mask {
        z-index: 1050 !important;
      }
      
      .ant-modal-wrap {
        z-index: 1060 !important;
      }
      
      .ant-modal {
        z-index: 1070 !important;
      }
      
      .ant-modal-content {
        z-index: 1080 !important;
      }
      
      .ant-modal-body {
        z-index: 1090 !important;
      }
      
      /* PayPal specific iframe and popup fixes */
      iframe[name*="paypal"],
      div[id*="paypal-"],
      [id^="paypal-"],
      .paypal-checkout-context-iframe {
        z-index: 1300 !important;
        position: relative !important;
      }
      
      [data-paypal-button],
      .paypal-buttons {
        z-index: 1250 !important;
        position: relative !important;
      }

      /* ✅ RESPONSIVE DESIGN */
      @media (max-width: 768px) {
        .booking-payment-modal .ant-modal {
          width: 95% !important;
          margin: 10px auto !important;
        }
        
        .payment-modal-header {
          margin: -24px -16px 20px -16px !important;
          padding: 24px 16px !important;
        }
        
        .enhanced-payment-card {
          min-height: 120px !important;
        }
        
        .paypal-container-fixed,
        .manual-payment-card {
          margin: 16px 0 !important;
          padding: 16px !important;
        }
        
        .payment-card-icon {
          font-size: 28px;
        }
        
        .success-icon {
          font-size: 56px !important;
        }
      }
      
      @media (max-width: 576px) {
        .ant-modal-body {
          max-height: 70vh !important;
          padding-bottom: 100px !important;
        }
        
        .enhanced-payment-card .payment-card-content {
          padding: 16px;
        }
      }

      /* ✅ UTILITY CLASSES */
      .cursor-pointer { cursor: pointer; }
      .transition-all { transition: all 0.3s ease; }
      
      .sticky-top {
        position: sticky;
      }
      
      @media (max-width: 992px) {
        .sticky-top {
          position: relative;
        }
      }
    `}</style>
  </>
);
}

export default Bookingscreen;
