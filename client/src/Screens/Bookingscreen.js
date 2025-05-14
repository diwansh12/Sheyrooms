import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { message, Modal } from 'antd';
import moment from 'moment';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PaypalButton from '../PaypalButton';

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

  const from = moment(fromdate, 'DD-MM-YYYY');
  const to = moment(todate, 'DD-MM-YYYY');
  const isValidDates = from.isValid() && to.isValid();
  const isoFrom = isValidDates ? from.format('YYYY-MM-DD') : null;
  const isoTo = isValidDates ? to.format('YYYY-MM-DD') : null;
  const totalDays = to.diff(from, 'days') + 1;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    setCurrentUser(user);

    const fetchRoom = async () => {
      if (!isValidDates) return;
      try {
        const { data } = await axios.get(`/api/rooms/getroombyid/${roomid}`);
        setRoom(data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomid, isValidDates]);

  useEffect(() => {
    if (room && totalDays > 0) {
      setTotalamount(room.rentperday * totalDays);
    }
  }, [room, totalDays]);

  const handleConfirmClick = () => {
    if (!currentUser || !currentUser._id) {
      message.warning('Please login to book a room');
      return navigate('/login');
    }
    setShowModal(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      const { data } = await axios.post('/api/bookings/bookroom', {
        roomId: roomid,
        userid: currentUser._id,
        fromdate: isoFrom,
        todate: isoTo,
        totalamount,
        totalDays,
      });

      message.success(`Booking confirmed via PayPal! Reference: ${data.bookingId}`);
      setShowModal(false);
      navigate('/profile');
    } catch (err) {
      console.error('Booking error after payment:', err);
      message.error('Booking failed after payment');
    }
  };

  if (loading) return <div>Loading room details...</div>;
  if (error) return <div className="text-danger">Error loading room details</div>;
  if (!room) return <div>Room not found</div>;
   const handleManualBooking = async () => {
    try {
      const { data } = await axios.post("/api/bookings/bookroom", {
        roomId: roomid,
        userid: currentUser._id,
        fromdate: isoFrom,
        todate: isoTo,
        totalamount,
        totalDays,
      });

      message.success(`Booking confirmed without online payment! Ref: ${data.bookingId}`);
      setShowModal(false);
      navigate("/profile");
    } catch (err) {
      console.error("Manual booking failed:", err);
      message.error("Manual booking failed");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '800px' }}>
      <h2 className="text-center mb-4 display-4 text-primary">Booking Summary</h2>

      <div className="card shadow-lg border-0">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">{room.name}</h3>
        </div>

        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="mb-3">
                <h5 className="text-muted">Dates</h5>
                <p>
                  <strong>{from.format('DD MMM YYYY')}</strong> to <strong>{to.format('DD MMM YYYY')}</strong>
                </p>
              </div>

              <div className="mb-3">
                <h5 className="text-muted">Duration</h5>
                <p className="fw-bold">{totalDays} Days</p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <h5 className="text-muted">Price Breakdown</h5>
                <p>
                  ₹{room.rentperday.toLocaleString()} × {totalDays} days
                </p>
              </div>

              <div className="border-top pt-3">
                <h5 className="text-muted">Total Amount</h5>
                <h4 className="text-success">₹{totalamount.toLocaleString()}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <button
          onClick={handleConfirmClick}
          className="btn btn-primary btn-lg px-5 py-3 rounded-pill"
        >
          <i className="bi bi-check2-circle me-2"></i>
          Confirm Booking
        </button>
      </div>

      {/* 🧾 Modal for payment */}
     <Modal
  title="Complete Payment"
  open={showModal}
  onCancel={() => setShowModal(false)}
  footer={null}
>
  <div>
    <h5>Select Payment Method</h5>
    <div className="d-flex gap-3 mb-3">
      <button
        className={`btn ${paymentMethod === 'paypal' ? 'btn-primary' : 'btn-outline-primary'}`}
        onClick={() => setPaymentMethod('paypal')}
      >
        PayPal
      </button>
      <button
        className={`btn ${paymentMethod === 'manual' ? 'btn-success' : 'btn-outline-success'}`}
        onClick={() => setPaymentMethod('manual')}
      >
        Pay on Arrival
      </button>
      <button
        className={`btn ${paymentMethod === 'more' ? 'btn-warning' : 'btn-outline-warning'}`}
        onClick={() => setPaymentMethod('more')}
      >
        Pay More Options
      </button>
    </div>

    {paymentMethod === 'paypal' && (
      <PayPalScriptProvider options={{ "client-id": "AZeCFelxYsWdBQGD23iW5E_dmPdi5svLf0SJC8OMjBRkMl0yyzfX4lwtfIO8IvzcVck7s6cTyI9Hntf9", currency: "USD" }}>
        <PaypalButton amount={totalamount} onSuccess={handlePaymentSuccess} />
      </PayPalScriptProvider>
    )}

    {paymentMethod === 'manual' && (
      <div>
        <p className="text-muted">You can pay at the hotel during check-in.</p>
        <button className="btn btn-success" onClick={handleManualBooking}>
          Confirm Booking Without Payment
        </button>
      </div>
    )}

    {paymentMethod === 'more' && (
      <div>
        <p className="text-muted">Other payment options coming soon (e.g., Stripe, UPI, etc.)</p>
      </div>
    )}
  </div>
</Modal>

    </div>
  );
}

export default Bookingscreen;
