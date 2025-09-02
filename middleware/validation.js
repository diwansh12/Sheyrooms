// middleware/validation.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { body } = require('express-validator');
const { validationResult } = require('express-validator');

// ✅ CRITICAL FIX: Ensure this EXACTLY matches login route
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error('❌ CRITICAL ERROR: JWT_SECRET environment variable is not set!');
  process.exit(1); // Stop server if no secret
}

console.log('🔑 Auth Middleware - JWT Secret loaded:', {
  present: !!jwtSecret,
  length: jwtSecret.length,
  preview: jwtSecret.substring(0, 10) + '...'
});

// Authentication middleware with enhanced debugging
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔐 Auth Debug:', {
      route: req.url,
      method: req.method,
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      tokenStart: token ? token.substring(0, 20) + '...' : 'No token',
      secretPresent: !!jwtSecret,
      secretLength: jwtSecret ? jwtSecret.length : 0,
      timestamp: new Date().toISOString()
    });

    if (!token) {
      console.log('❌ No token provided for route:', req.url);
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // ✅ FIXED: Use exact same secret as login route
    const decoded = jwt.verify(token, jwtSecret, { 
      algorithms: ['HS256'] 
    });

    console.log('✅ Token decoded successfully:', { 
      userId: decoded.userId,
      email: decoded.email,
      route: req.url
    });
    
    // Get full user info from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ User not found in database:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User authenticated successfully:', { 
      id: user._id, 
      email: user.email,
      route: req.url
    });
    
    req.user = user; // This includes isAdmin field
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', {
      route: req.url,
      name: error.name,
      message: error.message,
      tokenProvided: !!req.headers.authorization,
      secretLength: jwtSecret.length,
      timestamp: new Date().toISOString()
    });
    
    // Provide specific error messages
    let message = 'Invalid or expired token - please login again';
    if (error.name === 'TokenExpiredError') {
      message = 'Token has expired - please login again';
    } else if (error.name === 'JsonWebTokenError') {
      if (error.message.includes('invalid signature')) {
        message = 'Invalid token signature - token was signed with different secret';
      } else if (error.message.includes('invalid algorithm')) {
        message = 'Invalid token algorithm - please login again';
      } else {
        message = 'Invalid token format - please login again';
      }
    }
    
    res.status(401).json({
      success: false,
      message: message
    });
  }
};

// Admin authorization middleware
const authorizeAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
};

const validateBooking = [
  body('roomId').notEmpty().withMessage('Room ID is required'),
  body('userid').notEmpty().withMessage('User ID is required'),
  body('fromdate').isISO8601().withMessage('Valid check-in date is required'),
  body('todate').isISO8601().withMessage('Valid check-out date is required'),
  body('totalamount').isNumeric().withMessage('Valid total amount is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  authenticateToken,
  authorizeAdmin,
  validateBooking
};
