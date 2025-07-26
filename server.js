// server.js - FIXED with proper middleware order
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

// Database connection
require('./db');


// ✅ CRITICAL: Body parsing middleware MUST come BEFORE routes
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies


// Debug middleware to check if req.body is populated
app.use((req, res, next) => {
  console.log('📥 Request Method:', req.method);
  console.log('📥 Request URL:', req.url);
  console.log('📥 Content-Type:', req.headers['content-type']);
  console.log('📥 Request Body:', req.body);
  next();
});

// ✅ Routes MUST come AFTER middleware
app.use('/api/users', require('./routes/usersRoute'));
app.use('/api/rooms', require('./routes/roomsRoute'));
app.use('/api/bookings', require('./routes/bookingsRoute'));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Global error:', error);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

