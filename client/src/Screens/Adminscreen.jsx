// AdminScreen.js
import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig'; // Adjust path as needed
import Loader from '../Components/Loader';
import Error from '../Components/Error';
import Swal from 'sweetalert2';

// Enhanced Bookings List
function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        console.log('Fetching bookings...');
        const response = await axiosInstance.get("/api/bookings/getallbookings");
        console.log('Bookings response:', response.data);
        setBookings(response.data.data || response.data);
        setLoading(false);
      } catch (error) {
        console.error('Bookings fetch error:', error);
        setError(error);
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <Loader />;
  if (error) return <Error message="Failed to load bookings" />;

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">📊 Booking Management</h2>
          <div className="badge bg-primary fs-6">{bookings.length} Total Bookings</div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead className="table-dark">
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <code className="text-primary">{booking._id.slice(-8)}</code>
                    </td>
                    <td>{booking.userid?.name}<br/><small>{booking.userid?.email}</small></td>

                    <td className="fw-semibold">{booking.room}</td>
                    <td>{new Date(booking.fromdate).toLocaleDateString()}</td>
                    <td>{new Date(booking.todate).toLocaleDateString()}</td>
                    <td className="fw-bold text-success">
                      ₹{booking.totalamount?.toLocaleString() || '0'}
                    </td>
                    <td>
                      <span className={`badge ${
                        booking.status === 'confirmed' ? 'bg-success' :
                        booking.status === 'pending' ? 'bg-warning' :
                        booking.status === 'cancelled' ? 'bg-danger' :
                        'bg-secondary'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2">View</button>
                      <button className="btn btn-sm btn-outline-secondary">Edit</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Enhanced Rooms List
function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        console.log('Fetching rooms...');
        const response = await axiosInstance.get("/api/rooms/getallrooms");
        console.log('Rooms response:', response.data);
        setRooms(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Rooms fetch error:', error);
        setError(error);
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  if (loading) return <Loader />;
  if (error) return <Error message="Failed to load rooms" />;

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">🏨 Room Management</h2>
          <div className="badge bg-info fs-6">{rooms.length} Total Rooms</div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead className="table-dark">
              <tr>
                <th>Room ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Price/Night</th>
                <th>Max Guests</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <tr key={room._id}>
                    <td><code className="text-info">{room._id.slice(-6)}</code></td>
                    <td className="fw-semibold">{room.name}</td>
                    <td>
                      <span className="badge bg-primary">{room.type}</span>
                    </td>
                    <td className="fw-bold text-success">₹{room.rentperday?.toLocaleString()}</td>
                    <td>👥 {room.maxcount}</td>
                    <td>📞 {room.phonenumber}</td>
                    <td>
                      <span className="badge bg-success">Available</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No rooms found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Enhanced Users List
function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users...');
        const response = await axiosInstance.get("/api/users/getallusers");
        console.log('Users response:', response.data);
        setUsers(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Users fetch error:', error);
        setError(error);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <Loader />;
  if (error) return <Error message="Failed to load users" />;

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">👥 User Management</h2>
          <div className="badge bg-success fs-6">{users.length} Total Users</div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead className="table-dark">
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td><code className="text-success">{user._id.slice(-6)}</code></td>
                    <td className="fw-semibold">{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.isAdmin ? 'bg-danger' : 'bg-primary'}`}>
                        {user.isAdmin ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2">View</button>
                      <button className="btn btn-sm btn-outline-warning">Edit</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Enhanced Add Room Component
function AddRoom() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rentperday: '',
    maxcount: '',
    description: '',
    phonenumber: '',
    type: '',
    imageurl1: '',
    imageurl2: '',
    imageurl3: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addRoom = async () => {
    const newroom = {
      name: formData.name,
      rentperday: parseInt(formData.rentperday),
      maxcount: parseInt(formData.maxcount),
      description: formData.description,
      phonenumber: formData.phonenumber,
      type: formData.type,
      imageurls: [formData.imageurl1, formData.imageurl2, formData.imageurl3].filter(url => url)
    };

    try {
      setLoading(true);
      console.log('Adding room:', newroom);
      const result = await axiosInstance.post("/api/rooms/addroom", newroom);
      console.log('Room added successfully:', result.data);
      setLoading(false);
      Swal.fire('Success!', "Room added successfully", 'success').then(() => {
        // Reset form
        setFormData({
          name: '',
          rentperday: '',
          maxcount: '',
          description: '',
          phonenumber: '',
          type: '',
          imageurl1: '',
          imageurl2: '',
          imageurl3: ''
        });
      });
    } catch (error) {
      console.error('Error adding room:', error);
      setLoading(false);
      Swal.fire('Error!', error.response?.data?.message || 'Something went wrong', 'error');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="row">
      <div className="col-md-12">
        <h2 className="fw-bold mb-4">➕ Add New Room</h2>
        
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Room Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Deluxe Suite"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Price per Night *</label>
                  <input
                    type="number"
                    name="rentperday"
                    className="form-control"
                    placeholder="5000"
                    value={formData.rentperday}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Maximum Guests *</label>
                  <input
                    type="number"
                    name="maxcount"
                    className="form-control"
                    placeholder="4"
                    value={formData.maxcount}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    name="phonenumber"
                    className="form-control"
                    placeholder="9876543210"
                    value={formData.phonenumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Room Type *</label>
                  <select
                    name="type"
                    className="form-control"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Room Type</option>
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Presidential">Presidential</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Image URL 1</label>
                  <input
                    type="url"
                    name="imageurl1"
                    className="form-control"
                    placeholder="https://example.com/image1.jpg"
                    value={formData.imageurl1}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Image URL 2</label>
                  <input
                    type="url"
                    name="imageurl2"
                    className="form-control"
                    placeholder="https://example.com/image2.jpg"
                    value={formData.imageurl2}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Image URL 3</label>
                  <input
                    type="url"
                    name="imageurl3"
                    className="form-control"
                    placeholder="https://example.com/image3.jpg"
                    value={formData.imageurl3}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-12">
                <div className="mb-3">
                  <label className="form-label">Description *</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="4"
                    placeholder="Room description with amenities and features..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="text-end">
                  <button
                    className="btn btn-success btn-lg px-5"
                    onClick={addRoom}
                    disabled={!formData.name || !formData.rentperday || !formData.type || !formData.description}
                  >
                    ➕ Add Room
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Admin Component with Enhanced Authentication
function Adminscreen() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        console.log('Admin screen mounted, checking authentication...');
        
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const token = localStorage.getItem("token");
        
        console.log('Current user from localStorage:', currentUser);
        console.log('Token exists:', !!token);
        console.log('Is admin?', currentUser?.isAdmin);
        
        if (!currentUser || !token) {
          console.log('No user or token found, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }
        
        if (!currentUser.isAdmin) {
          console.log('User is not admin, redirecting to home');
          navigate('/home', { replace: true });
          return;
        }
        
        console.log('Admin access granted');
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking admin access:', error);
        navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // This prevents any flash of content before redirect
  }

  const items = [
    {
      key: '1',
      label: (
        <span>
          <span className="me-2">📊</span>
          Bookings
        </span>
      ),
      children: <Bookings />,
    },
    {
      key: '2',
      label: (
        <span>
          <span className="me-2">🏨</span>
          Rooms
        </span>
      ),
      children: <Rooms />,
    },
    {
      key: '3',
      label: (
        <span>
          <span className="me-2">➕</span>
          Add Room
        </span>
      ),
      children: <AddRoom />,
    },
    {
      key: '4',
      label: (
        <span>
          <span className="me-2">👥</span>
          Users
        </span>
      ),
      children: <Users />,
    },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-gradient" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
          }}>
            <div className="card-body text-white text-center">
              <h1 className="display-4 fw-bold mb-2">🏨 SheyRooms Admin Panel</h1>
              <p className="lead">Comprehensive hotel management system</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <Tabs
            defaultActiveKey="1"
            items={items}
            size="large"
            type="card"
            className="custom-tabs"
          />
        </div>
      </div>

      <style jsx>{`
        .custom-tabs .ant-tabs-tab {
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .custom-tabs .ant-tabs-tab:hover {
          transform: translateY(-2px);
        }
        .custom-tabs .ant-tabs-tab-active {
          background: #667eea !important;
          border-color: #667eea !important;
        }
        .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: white !important;
        }
        .table-hover tbody tr:hover {
          background-color: rgba(0,0,0,.075);
        }
        .badge {
          font-size: 0.8em;
        }
        .spinner-border {
          border-width: 0.3em;
        }
      `}</style>
    </div>
  );
}

export default Adminscreen;
