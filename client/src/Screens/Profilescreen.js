import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Divider, Flex, Tag } from 'antd';

function Profilescreen() {
 const currentUser = JSON.parse(localStorage.getItem('currentUser'));
 const [bookings, setBookings] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  async function fetchBookings() {
   try {
    const response = await axios.post('/api/bookings/getuserbookings', {
     userid: currentUser._id,
    });
    setBookings(response.data);
    setLoading(false);

   } catch (error) {
    console.error('Error fetching bookings:', error);
    setLoading(false);
   }
  }

  fetchBookings();
 }, [currentUser._id]);

 async function cancelBooking(bookingid, roomid) {

  try {
   setLoading(true);
   const result = await (await axios.post("/api/bookings/cancelBooking", { bookingid, roomid })).data
   console.log(result)
   Swal.fire('Congrats', "Your booking has been cancelled", 'success').then(result => {
    window.location.reload();
   }

   )
  } catch (error) {
   console.log(error)
   Swal.fire('Oops', "Something went wrong", 'error')
  }

 }

 const profileTab = (
  <div>
   <h5><strong>Name:</strong> {currentUser.name}</h5>
   <h5><strong>Email:</strong> {currentUser.email}</h5>
   <h5><strong>Admin:</strong> {currentUser.isAdmin ? 'Yes' : 'No'}</h5>
  </div>
 );

 const bookingsTab = loading ? (
  <p>Loading bookings...</p>
 ) : bookings.length > 0 ? (
  bookings.map((booking) => (
   <div key={booking._id} className="card mb-3">
    <div className="card-body">
     <h5>{booking.room}</h5>
     <p><strong>CheckIn:</strong> {booking.fromdate}</p>
     <p><strong>Check out:</strong> {booking.todate}</p>
     <p><strong>Amount:</strong> ₹{booking.totalamount}</p>
     <p><strong>Status:</strong> :{" "}
      {booking.status == 'cancelled' ? (<Tag color="red">Cancelled</Tag>) : (<Tag color="green">Confirmed</Tag>)} </p>
     {booking.status !== 'cancelled' && (
      <div className='text-right'>
       <button className='btn btn-primary' onClick={() => { cancelBooking(booking._id, booking.roomId) }}>Cancel Booking</button>

      </div>
     )}
    </div>
   </div>
  ))
 ) : (
  <p>No bookings found.</p>
 );

 const items = [
  {
   key: '1',
   label: 'Profile Info',
   children: profileTab,
  },
  {
   key: '2',
   label: 'My Bookings',
   children: bookingsTab,
  },
 ];

 return (
  <div className="container mt-5">
   <h2 className="text-center mb-4">My Profile</h2>
   <Tabs defaultActiveKey="1" items={items} />
  </div>
 );
}

export default Profilescreen;
