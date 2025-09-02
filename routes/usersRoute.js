const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middleware/validation');

// ✅ CRITICAL FIX: Same secret handling as middleware
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error('❌ CRITICAL ERROR: JWT_SECRET environment variable is not set in users route!');
  process.exit(1);
}

console.log('🔑 Users Route - JWT Secret loaded:', {
  present: !!jwtSecret,
  length: jwtSecret.length,
  preview: jwtSecret.substring(0, 10) + '...'
});

router.get('/', (req, res) => {
  res.json({ 
    message: 'Users API endpoint is working',
    status: 'success',
    jwtSecretLength: jwtSecret.length, // Debug info
    availableRoutes: [
      'POST /api/users/register - Register new user',
      'POST /api/users/login - User login', 
      'GET /api/users/getallusers - Get all users (Admin only)',
      'GET /api/users/verify - Verify JWT token'
    ],
    timestamp: new Date()
  });
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Ensure name is a string, not an object
    let userName = '';
    if (typeof name === 'string') {
      userName = name.trim();
    } else if (typeof name === 'object' && name.first && name.last) {
      userName = `${name.first} ${name.last}`.trim();
    } else {
      return res.status(400).json({ 
        success: false,
        message: 'Valid name is required' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      name: userName,  // ✅ Store as simple string
      email: email.toLowerCase(),
      password: hashedPassword,
      isAdmin: false
    });

    const savedUser = await newUser.save();

    res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      user: {
        id: savedUser._id,
        name: savedUser.name,  // ✅ This will be a string
        email: savedUser.email
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration',
      error: error.message 
    });
  }
});

// ✅ FIXED LOGIN route with consistent secret usage
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for email:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // ✅ FIXED: Use same secret as middleware, proper syntax
    const token = jwt.sign(
  { userId: user._id, email: user.email, isAdmin: user.isAdmin },
  jwtSecret,                                   // ✅ the secret must be the 2nd arg
  { expiresIn: '7d', algorithm: 'HS256' }      // (algorithm optional; HS256 is default)
);


    console.log('✅ Login successful for user:', {
      email: user.email,
      userId: user._id,
      tokenCreated: !!token,
      secretLength: jwtSecret.length
    });

    const userResponse = {
      _id: user._id,
      name: typeof user.name === 'string' ? user.name : `${user.name.first || ''} ${user.name.last || ''}`.trim(),
      email: user.email,
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token: token
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

router.get('/getallusers', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    console.log('👥 Admin requesting all users');
    console.log('User from token:', req.user.email);
    
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isAdmin
    } = req.query;

    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by admin status
    if (isAdmin !== undefined) {
      query.isAdmin = isAdmin === 'true';
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      select: '-password' // Exclude password field
    };

    const users = await User.paginate(query, options);
    
    // Add user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalAdmins: { $sum: { $cond: ['$isAdmin', 1, 0] } },
          totalRegularUsers: { $sum: { $cond: ['$isAdmin', 0, 1] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: users.docs,
      pagination: {
        currentPage: users.page,
        totalPages: users.totalPages,
        totalDocs: users.totalDocs,
        hasNextPage: users.hasNextPage,
        hasPrevPage: users.hasPrevPage
      },
      statistics: userStats[0] || {
        totalUsers: 0,
        totalAdmins: 0,
        totalRegularUsers: 0
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add to your routes/usersRoute.js
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, profile: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ success: true, profile: user, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});


// ✅ FIXED TOKEN VERIFY route with same secret
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    // ✅ FIXED: Use same secret and algorithm as login/middleware
    const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

module.exports = router;
