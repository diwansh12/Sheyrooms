// server.js - FIXED with proper middleware order
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
// Database connection
require('./db');

app.use((req, res, next) => {
  // Decode and clean the URL
  let cleanUrl = decodeURIComponent(req.url);
  cleanUrl = cleanUrl.trim();
  
  if (req.url !== encodeURI(cleanUrl)) {
    console.log(`🔧 Cleaning malformed URL: "${req.url}" => "${encodeURI(cleanUrl)}"`);
    return res.redirect(301, cleanUrl);
  }
  next();
});


// ✅ CRITICAL: Body parsing middleware MUST come BEFORE routes
app.use(cors({
  origin: [
    'http://localhost:3000', // for development
    'https://sheyrooms-mu.vercel.app' // your production frontend
  ],
  credentials: true
}));
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

app.get('/', (req, res) => {
  res.json({ 
    message: 'Sheyrooms Backend API is running!', 
    status: 'success',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/users',
      '/api/rooms', 
      '/api/bookings',
      '/api/wishlist'
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    uptime: process.uptime()
  });
});
// ✅ Routes MUST come AFTER middleware
app.use('/api/auth', require('./routes/authRoute')); 
app.use('/api/users', require('./routes/usersRoute'));
app.use('/api/rooms', require('./routes/roomsRoute'));
app.use('/api/bookings', require('./routes/bookingsRoute'));
app.use('/api/wishlist', require('./routes/wishlistRoute'));

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

