// screens/Bookingscreen.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Modal, Divider, Steps, Card, Row, Col, Tag, Spin } from 'antd';
import moment from 'moment';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { bookingsAPI, roomsAPI } from '../services/api'; // ✅ Import API services
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
    const token = localStorage.getItem("token"); // ✅ Keep consistent with your current token storage
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
        // ✅ Use roomsAPI instead of direct axios
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

  // ✅ Updated to use bookingsAPI for PayPal booking
  const handlePayPalSuccess = async (details, data) => {
    console.log('PayPal payment successful:', details);
    setPaypalLoading(true);
    setCurrentStep(1);

    try {
      const bookingData = {
        roomId: roomid,
        userid: currentUser._id,
        fromdate: isoFrom,
        todate: isoTo,
        totalamount: finalTotal,
        totalNights: totalDays, // ✅ Changed from totalDays to totalNights
        paymentMethod: 'paypal',
        
        // ✅ Add required fields for validation
        guestCount: {
          adults: 2,
          children: 0
        },
        primaryGuest: {
          firstName: currentUser.name?.split(' ')[0] || 'Guest',
          lastName: currentUser.name?.split(' ')[1] || 'User',
          email: currentUser.email,
          phone: currentUser.phone || '+0000000000'
        },
        
        // ✅ Add optional fields
        additionalGuests: [],
        preferences: {},
        addOns: [],
        specialRequests: '',
        
        // PayPal specific fields
        paymentDetails: {
          transactionId: details.id,
          payerEmail: details.payer.email_address,
          amount: details.purchase_units[0].amount.value
        }
      };

      // ✅ Use bookingsAPI instead of direct axios
      const response = await bookingsAPI.create(bookingData);
      
      setCurrentStep(2);
      message.success(`🎉 Booking confirmed! Reference: ${response.data.data.bookingId}`);
      
      setTimeout(() => {
        setShowModal(false);
        navigate('/profile');
      }, 3000);
    } catch (err) {
      console.error('Booking error after payment:', err);
      
      // ✅ Enhanced error handling
      if (err.response?.status === 400) {
        console.error('Validation errors:', err.response.data.errors);
        message.error(`Validation failed: ${err.response.data.message}`);
      } else if (err.response?.status === 403) {
        console.error('Authorization failed');
        message.error('Authentication failed. Please login again.');
      } else {
        message.error('Booking failed after payment. Please contact support.');
      }
      
      setCurrentStep(0);
    } finally {
      setPaypalLoading(false);
    }
  };

  const handlePayPalError = (err) => {
    console.error('PayPal payment error:', err);
    message.error('Payment failed. Please try again.');
    setCurrentStep(0);
  };

  // ✅ Updated to use bookingsAPI for manual booking
  const handleManualBooking = async () => {
    setBookingLoading(true);
    setCurrentStep(1);
    
    try {
      const bookingData = {
        roomId: roomid,
        userid: currentUser._id,
        fromdate: isoFrom,
        todate: isoTo,
        totalamount: finalTotal,
        totalNights: totalDays, // ✅ Changed from totalDays to totalNights
        paymentMethod: 'manual',
        
        // ✅ Add required guest information
        guestCount: {
          adults: 2,
          children: 0
        },
        primaryGuest: {
          firstName: currentUser.name?.split(' ')[0] || 'Guest',
          lastName: currentUser.name?.split(' ')[1] || 'User',
          email: currentUser.email,
           phone: currentUser.phone || '+919876543210'
        },
        
        // ✅ Add optional fields to prevent validation errors
        additionalGuests: [],
        preferences: {},
        addOns: [],
        specialRequests: ''
      };

      console.log('📤 Sending booking data:', bookingData);

      // ✅ Use bookingsAPI instead of direct axios
      const response = await bookingsAPI.create(bookingData);

      setCurrentStep(2);
      message.success(`✅ Booking confirmed! Pay at hotel. Ref: ${response.data.data.bookingId}`);

      setTimeout(() => {
        setShowModal(false);
        navigate("/profile");
      }, 3000);
    } catch (err) {
      console.error("Manual booking failed:", err);
      
      // ✅ Enhanced error handling
      if (err.response?.status === 400) {
        console.error("Validation errors:", err.response.data.errors);
        message.error(`Validation failed: ${err.response.data.message}`);
      } else if (err.response?.status === 403) {
        console.error("Authorization failed");
        message.error("Authentication failed. Please login again.");
      } else {
        message.error("Booking failed. Please try again.");
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

      {/* Modal with Payment Options */}
      <Modal
        title={null}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setCurrentStep(0);
          setPaymentMethod('paypal');
        }}
        footer={null}
        width={700}
        centered
        destroyOnHidden={true}
        maskClosable={false}
        style={{ 
          zIndex: 1000,
          maxHeight: '90vh'
        }}
        styles={{
          body: {
            padding: '24px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }
        }}
      >
        {/* Progress Steps */}
        <Steps current={currentStep} className="mb-4">
          <Step title="Payment Method" icon={<CreditCardOutlined />} />
          <Step title="Processing" icon={<ClockCircleOutlined />} />
          <Step title="Confirmed" icon={<CheckCircleOutlined />} />
        </Steps>

        {currentStep === 0 && (
          <>
            <h4 className="text-center mb-4">Choose Your Payment Method</h4>
            
            <Row gutter={[16, 16]}>
              {paymentOptions.map((option) => (
                <Col xs={24} key={option.key}>
                  <Card
                    className={`payment-option-card cursor-pointer transition-all ${
                      paymentMethod === option.key ? 'border-primary shadow-sm' : ''
                    }`}
                    onClick={() => setPaymentMethod(option.key)}
                    style={{
                      border: paymentMethod === option.key ? '2px solid #1890ff' : '1px solid #d9d9d9'
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <div className="me-3 fs-4 text-primary">
                          {option.icon}
                        </div>
                        <div>
                          <h6 className="mb-1 fw-bold">{option.title}</h6>
                          <p className="mb-0 text-muted small">{option.description}</p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <Tag color={option.badgeColor}>{option.badge}</Tag>
                        <div className={`ms-3 border rounded-circle ${
                          paymentMethod === option.key ? 'border-primary bg-primary' : 'border-secondary'
                        }`} style={{ width: '20px', height: '20px' }}>
                          {paymentMethod === option.key && (
                            <CheckCircleOutlined className="text-white" style={{ fontSize: '12px', marginLeft: '4px', marginTop: '4px' }} />
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            <Divider />

            {/* Payment Method Content */}
            {paymentMethod === 'paypal' && (
              <div>
                <div className="alert alert-info mb-4 text-center">
                  <InfoCircleOutlined className="me-2" />
                  <strong>Total: ${Math.round(finalTotal / 83)}</strong> (Converted from ₹{finalTotal.toLocaleString()})
                  <br />
                  <small>You'll complete payment securely via PayPal below.</small>
                </div>
                
                <PayPalScriptProvider options={paypalOptions}>
                  <PayPalButtons
                    style={{ 
                      layout: "vertical",
                      color: "blue",
                      shape: "rect",
                      label: "paypal"
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
            )}

            {paymentMethod === 'manual' && (
              <div className="text-center">
                <div className="alert alert-success mb-4">
                  <BankOutlined className="me-2" />
                  <strong>Pay at Hotel</strong><br />
                  You can pay directly at the hotel during check-in. Your booking will be confirmed instantly.
                </div>
                <button 
                  className="btn btn-success btn-lg px-5 py-3 rounded-3"
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
            )}

            {paymentMethod === 'more' && (
              <div className="text-center py-4">
                <div className="alert alert-warning">
                  <WalletOutlined className="me-2" />
                  <strong>Coming Soon!</strong><br />
                  We're working on adding UPI, Credit/Debit Cards, and Net Banking options.
                </div>
                <p className="text-muted">Please choose PayPal or Pay at Hotel for now.</p>
              </div>
            )}
          </>
        )}

        {currentStep === 1 && (
          <div className="text-center py-5">
            <Spin size="large" />
            <h5 className="mt-3">
              {paypalLoading ? 'Processing PayPal payment...' : 'Processing your booking...'}
            </h5>
            <p className="text-muted">Please wait while we confirm your reservation.</p>
          </div>
        )}

        {currentStep === 2 && (
          <div className="text-center py-5">
            <div className="text-success mb-4">
              <CheckCircleOutlined style={{ fontSize: '64px' }} />
            </div>
            <h3 className="text-success mb-3">🎉 Booking Confirmed!</h3>
            <p className="lead mb-4">
              Your reservation has been successfully confirmed. 
              You'll receive a confirmation email shortly.
            </p>
            <div className="alert alert-success">
              <strong>Next Steps:</strong><br />
              • Check your email for booking confirmation<br />
              • Present your booking ID at check-in<br />
              • Arrive after 2:00 PM on your check-in date
            </div>
          </div>
        )}
      </Modal>

      {/* Custom Styles */}
      <style>{`
        .payment-option-card {
          transition: all 0.3s ease;
        }
        .payment-option-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .sticky-top {
          position: sticky;
        }
        @media (max-width: 992px) {
          .sticky-top {
            position: relative;
          }
        }
        
        .ant-modal-mask {
          z-index: 1000 !important;
        }
        .ant-modal-wrap {
          z-index: 1000 !important;
        }
        .ant-modal {
          z-index: 1001 !important;
        }
        
        .paypal-buttons {
          z-index: 1002 !important;
        }
      `}</style>
    </>
  );
}

export default Bookingscreen;
