// middleware/validation.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { body } = require('express-validator');
const { validationResult } = require('express-validator');

const jwtSecret = process.env.JWT_SECRET || 'secret123';

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, jwtSecret);
    
    // Get full user info from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user; // This includes isAdmin field
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
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

// Booking validation middleware
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
