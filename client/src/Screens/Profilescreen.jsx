import React, { useEffect, useState } from 'react';
import { Tabs, message, Spin, Tag } from 'antd';
import axiosInstance from '../axiosConfig'; // Adjust as per your setup
import moment from 'moment';
import Swal from 'sweetalert2';

function Profilescreen() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  // Helper: Get initial from name
  const getNameInitial = (name) => {
    if (typeof name === 'string' && name.length > 0) {
      return name.charAt(0).toUpperCase();
    }
    return '?';
  };

  // Helper: Safe display name
  const getSafeName = (name) => {
    return typeof name === 'string' && name.length > 0 ? name : 'Unknown User';
  };

  useEffect(() => {
    if (!currentUser?._id) {
      message.warning('Please login to view your profile');
      // You can redirect here if needed
      return;
    }
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);

      const response = await axiosInstance.post('/api/bookings/getuserbookings', {
        userid: currentUser._id
      });

      // Extract bookings array safely (adjust if your backend returns differently)
      const bookingsList = response.data.data?.bookings || response.data.data || response.data || [];

      setBookings(bookingsList);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      message.error('Failed to load your bookings.');
    } finally {
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
        await axiosInstance.post('/api/bookings/cancelBooking', { bookingid, roomid });

        Swal.fire('Cancelled!', 'Your booking has been cancelled.', 'success');
        fetchBookings();
      } catch (error) {
        console.error('Error cancelling booking:', error);
        Swal.fire('Error!', 'Failed to cancel booking.', 'error');
      } finally {
        setLoading(false);
      }
    }
  }

  const ProfileTab = (
    <div className="enhanced-profile p-8 max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg">
      <div className="flex items-center space-x-8">
        <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
          <span className="text-white text-4xl font-extrabold">{getNameInitial(currentUser?.name)}</span>
        </div>
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900">{getSafeName(currentUser?.name)}</h2>
          <p className="text-lg text-gray-600 mt-2">{currentUser?.email || 'No email'}</p>
          <span className="inline-block mt-3 px-4 py-1 bg-yellow-100 text-yellow-800 text-base font-semibold rounded-full shadow-sm select-none">
            {currentUser?.isAdmin ? '👑 Admin' : '🥇 Gold Member'}
          </span>
        </div>
      </div>
    </div>
  );

  const BookingsTab = (
    <div className="p-8 max-w-6xl mx-auto">
      <h3 className="font-extrabold text-3xl mb-6 border-b border-gray-300 pb-2">🛏️ My Bookings</h3>
      {loading ? (
        <div className="text-center py-10">
          <Spin size="large" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-xl font-medium">No bookings found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                {['Room', 'Check In', 'Check Out', 'Status', 'Amount', 'Cancel'].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{booking.room || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{moment(booking.fromdate).format('DD MMM YYYY')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{moment(booking.todate).format('DD MMM YYYY')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Tag
                      color={
                        booking.status === 'confirmed'
                          ? 'green'
                          : booking.status === 'pending'
                          ? 'gold'
                          : 'default'
                      }
                      className="uppercase font-semibold"
                    >
                      {booking.status}
                    </Tag>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-700 font-semibold">
                    ₹{booking.pricing?.totalamount?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.status === 'confirmed' ? (
                      <button
                        disabled={loading}
                        onClick={() => cancelBooking(booking._id, booking.roomId)}
                        className="inline-block rounded-md bg-red-600 hover:bg-red-700 text-black px-3 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-gray-400 select-none">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-50">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={[
          { key: '1', label: 'Profile', children: ProfileTab },
          { key: '2', label: 'My Bookings', children: BookingsTab },
        ]}
        size="large"
      />
    </div>
  );
}

export default Profilescreen;


