import React, { useEffect, useState } from 'react';
import { Tabs, Upload, message } from 'antd';
import axios from 'axios';
import Swal from 'sweetalert2';
import moment from 'moment';

function Profilescreen() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

   // Helper functions - Define them here at the top of the component
  const getNameInitial = (name) => {
    if (typeof name === 'string' && name.length > 0) {
      return name.charAt(0).toUpperCase();
    }
    return '?';
  };

  const getSafeName = (name) => {
    return typeof name === 'string' && name.length > 0 ? name : 'Unknown User';
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);
      const response = await axios.post('/api/bookings/getuserbookings', {
        userid: currentUser._id,
      });
      setBookings(response.data.data?.bookings || response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  }

  async function cancelBooking(bookingid, roomid) {
    const result = await Swal.fire({
      title: 'Cancel Booking?',
      text: 'Are you sure you want to cancel this booking?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, cancel it!'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await axios.post("/api/bookings/cancelBooking", { 
          bookingid, 
          roomid 
        });
        
        Swal.fire('Cancelled!', 'Your booking has been cancelled.', 'success');
        fetchBookings();
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
        Swal.fire('Error!', 'Failed to cancel booking.', 'error');
      }
    }
  }

  const ProfileTab = (
  <div className="enhanced-profile">
    {/* Profile Header */}
    <div className="profile-header mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">
            {getNameInitial(currentUser?.name)}
          </span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{getSafeName(currentUser?.name)}</h2>
          <p className="text-gray-600">{currentUser?.email || 'No email'}</p>
          <span className="inline-flex px-3 py-1 bg-gold-100 text-gold-800 text-sm font-semibold rounded-full">
            {currentUser?.isAdmin ? 'Admin' : 'Gold'} Member
          </span>
        </div>
      </div>
    </div>
    {/* Rest of your ProfileTab */}
  </div>
);


      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
          <div className="text-sm text-gray-600">Total Bookings</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {bookings.filter(b => b.status === 'confirmed').length}
          </div>
          <div className="text-sm text-gray-600">Confirmed</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">₹{
            bookings.reduce((sum, b) => sum + (b.totalamount || 0), 0).toLocaleString()
          }</div>
          <div className="text-sm text-gray-600">Total Spent</div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="text-gray-900">{currentUser.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{currentUser.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Type</label>
            <p className="text-gray-900">{currentUser.isAdmin ? 'Administrator' : 'Customer'}</p>
          </div>
        </div>
      </div>

  const BookingsTab = loading ? (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading bookings...</p>
    </div>
  ) : bookings.length > 0 ? (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <div key={booking._id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{booking.room}</h3>
                <p className="text-gray-600">Booking ID: {booking._id.slice(-8)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Check-in</p>
                <p className="font-semibold">{moment(booking.fromdate).format('MMM DD, YYYY')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Check-out</p>
                <p className="font-semibold">{moment(booking.todate).format('MMM DD, YYYY')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-semibold text-lg">₹{(booking.totalamount || 0).toLocaleString()}</p>
              </div>
            </div>

            {booking.status !== 'cancelled' && (
              <div className="flex justify-end">
                <button
                  onClick={() => cancelBooking(booking._id, booking.roomId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Booking
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-12">
      <div className="text-gray-400 text-6xl mb-4">📅</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
      <p className="text-gray-600 mb-4">Start exploring amazing properties</p>
      <a href="/home" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Browse Hotels
      </a>
    </div>
  );

  const items = [
    {
      key: '1',
      label: '👤 Profile',
      children: ProfileTab,
    },
    {
      key: '2',
      label: '📅 My Bookings',
      children: BookingsTab,
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        size="large"
        className="enhanced-tabs"
      />

      <style jsx>{`
        .enhanced-profile .profile-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .enhanced-tabs .ant-tabs-nav {
          background: white;
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 24px;
        }
        .enhanced-tabs .ant-tabs-tab {
          border-radius: 8px;
          border: none;
          font-weight: 500;
        }
        .enhanced-tabs .ant-tabs-tab-active {
          background: #3B82F6;
          color: white;
        }
      `}</style>
    </div>
  );
}

export default Profilescreen;

