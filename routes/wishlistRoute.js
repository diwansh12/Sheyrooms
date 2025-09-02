const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Room = require('../models/rooms');
const { authenticateToken } = require('../middleware/validation');

// Test route to verify routing works
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Wishlist route working perfectly!',
    timestamp: new Date().toISOString(),
    environment: 'local'
  });
});

// GET /api/wishlist - Get user's wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('📋 [LOCAL] Fetching wishlist for user:', req.user._id);
    
    const items = await Wishlist.find({ userid: req.user._id })
      .populate({
        path: 'roomId',
        select: 'name type imageurls location address ratings rentperday currentPrice shortDescription category',
      })
      .lean();

    console.log(`✅ [LOCAL] Found ${items.length} wishlist items`);
    
    res.json({ 
      success: true, 
      data: items,
      count: items.length,
      message: `Wishlist loaded successfully with ${items.length} items`
    });
  } catch (error) {
    console.error('❌ [LOCAL] Wishlist fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch wishlist',
      error: error.message
    });
  }
});

// POST /api/wishlist/add - Add room to wishlist
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.body;
    console.log('➕ [LOCAL] Adding to wishlist:', { userId: req.user._id, roomId });

    if (!roomId) {
      return res.status(400).json({ success: false, message: 'roomId is required' });
    }

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Add to wishlist (upsert to handle duplicates)
    await Wishlist.updateOne(
      { userid: req.user._id, roomId },
      { $setOnInsert: { userid: req.user._id, roomId } },
      { upsert: true }
    );

    console.log('✅ [LOCAL] Added to wishlist successfully');
    res.json({ 
      success: true, 
      message: 'Added to wishlist successfully',
      roomName: room.name
    });
  } catch (error) {
    console.error('❌ [LOCAL] Wishlist add error:', error);
    
    if (error.code === 11000) {
      return res.json({ success: true, message: 'Room already in wishlist' });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add to wishlist',
      error: error.message
    });
  }
});

// POST /api/wishlist/remove - Remove room from wishlist
router.post('/remove', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.body;
    console.log('➖ [LOCAL] Removing from wishlist:', { userId: req.user._id, roomId });

    if (!roomId) {
      return res.status(400).json({ success: false, message: 'roomId is required' });
    }

    const result = await Wishlist.deleteOne({ userid: req.user._id, roomId });
    
    console.log('✅ [LOCAL] Removed from wishlist');
    res.json({ 
      success: true, 
      message: 'Removed from wishlist successfully',
      removed: result.deletedCount > 0
    });
  } catch (error) {
    console.error('❌ [LOCAL] Wishlist remove error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove from wishlist',
      error: error.message
    });
  }
});

module.exports = router;
