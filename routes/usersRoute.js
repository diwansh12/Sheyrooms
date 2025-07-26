const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middleware/validation');
const jwtSecret = process.env.JWT_SECRET || 'secret123';

// REGISTER
// In routes/usersRoute.js - REGISTER route
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
        message: 'Valid name is required' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
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
      message: 'Server error during registration',
      error: error.message 
    });
  }
});

// LOGIN route - ensure response format is correct
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

   const token = jwt.sign(
  { 
    userId: user._id,
    email: user.email,
    isAdmin: user.isAdmin 
  }, 
  jwtSecret,  // ✅ this is the correct secret
  { expiresIn: '7d' } // ✅ options go here
);


    // ✅ Ensure name is a string in response
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
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

router.get('/getallusers', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    console.log('👥 Admin requesting all users');
    console.log('User from token:', req.user);
    
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

// SIMPLE TOKEN VERIFY (front-end uses to keep session)
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId);
    if (!user) throw new Error();
    res.json({ user });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});


module.exports = router;
