const express = require("express");
const Room = require("../models/rooms"); // ← Fixed: rooms.js not room.js
const router = express.Router();

// GET ALL ROOMS
router.get("/getallrooms", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ROOM BY ID
router.get("/getroombyid/:roomid", async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomid);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD ROOM (Admin)
router.post("/addroom", async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    await newRoom.save();
    res.json({ message: "Room added successfully", room: newRoom });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ SEARCH ROOMS ROUTE - FIXED
router.get('/search', async (req, res) => {
  try {
    console.log('🔍 Search request received:', req.query);
    
    const {
      location,
      checkin,
      checkout,
      guests,
      type,
      maxPrice,
      minPrice
    } = req.query;

    // Build search query
    let searchQuery = {};

    // Location search (case-insensitive)
    if (location && location.trim()) {
      searchQuery.$or = [
        { name: { $regex: location, $options: 'i' } },
        { 'location.wing': { $regex: location, $options: 'i' } },
        { 'location.area': { $regex: location, $options: 'i' } },
        { description: { $regex: location, $options: 'i' } }
      ];
    }

    // Room type filter
    if (type && type.trim() && type !== 'all') {
      searchQuery.type = { $regex: type, $options: 'i' };
    }

    // Price range filter
    if (maxPrice && !isNaN(maxPrice)) {
      searchQuery.rentperday = { $lte: parseInt(maxPrice) };
    }
    if (minPrice && !isNaN(minPrice)) {
      if (searchQuery.rentperday) {
        searchQuery.rentperday.$gte = parseInt(minPrice);
      } else {
        searchQuery.rentperday = { $gte: parseInt(minPrice) };
      }
    }

    // Guest capacity filter
    if (guests && !isNaN(guests)) {
      searchQuery.maxcount = { $gte: parseInt(guests) };
    }

    // Only show available rooms
    searchQuery['availability.isActive'] = true;

    console.log('📋 Search query built:', searchQuery);

    const rooms = await Room.find(searchQuery).sort({ rentperday: 1 });

    // If date range is provided, filter out rooms with conflicts
    let availableRooms = rooms;
    if (checkin && checkout) {
      const startDate = new Date(checkin);
      const endDate = new Date(checkout);
      
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        availableRooms = rooms.filter(room => {
          const conflictingBookings = room.currentbookings.filter(booking => {
            if (booking.status === 'cancelled') return false;
            
            const bookingStart = new Date(booking.fromdate);
            const bookingEnd = new Date(booking.todate);
            
            return startDate < bookingEnd && bookingStart < endDate;
          });
          
          return conflictingBookings.length === 0;
        });
      }
    }

    console.log(`🏨 Found ${availableRooms.length} available rooms`);

    res.json({
      success: true,
      data: availableRooms,
      count: availableRooms.length,
      searchParams: req.query
    });

  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add this route for landing page data
router.get('/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const featuredRooms = await Room.find({ 
      'availability.isActive': true 
    })
    .limit(parseInt(limit))
    .sort({ createdAt: -1 })
    .select('name imageurls rentperday location type ratings maxcount availability');

    res.json({
      success: true,
      data: featuredRooms
    });
  } catch (error) {
    console.error('Error fetching featured rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured rooms'
    });
  }
});

// ✅ OPTION 2: Fix the room data in your database
// Add this to your backend routes temporarily:

router.get('/fix-room-types', async (req, res) => {
  try {
    console.log('🔧 Starting room type fix...');
    
    // Find all rooms with invalid types
    const roomsToFix = await Room.find({
      type: { $in: ['Non-Delux', 'Non-Deluxe', 'Delux'] }
    });
    
    console.log('📋 Found rooms to fix:', roomsToFix.length);
    
    if (roomsToFix.length === 0) {
      return res.json({
        success: true,
        message: 'No rooms found with invalid types',
        roomsFixed: 0
      });
    }
    
    // Update the problematic room types
    const updates = [
      {
        filter: { type: 'Non-Delux' },
        update: { $set: { type: 'Standard' } } // or 'Budget' or whatever makes sense
      },
      {
        filter: { type: 'Non-Deluxe' },
        update: { $set: { type: 'Standard' } }
      },
      {
        filter: { type: 'Delux' },
        update: { $set: { type: 'Delux' } }
      }
    ];
    
    let totalFixed = 0;
    
    for (const update of updates) {
      const result = await Room.updateMany(update.filter, update.update);
      totalFixed += result.modifiedCount;
      console.log('✅ Updated:', result.modifiedCount, 'rooms from', JSON.stringify(update.filter));
    }
    
    res.json({
      success: true,
      message: 'Room types fixed successfully',
      roomsFixed: totalFixed
    });
    
  } catch (error) {
    console.error('❌ Error fixing room types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix room types',
      error: error.message
    });
  }
});

// Clean up specific room bookings
router.post('/cleanup-room-bookings/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { bookingIdsToRemove, removeAll = false } = req.body;
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    if (removeAll) {
      // Remove all bookings
      room.currentbookings = [];
    } else if (bookingIdsToRemove && bookingIdsToRemove.length > 0) {
      // Remove specific bookings
      room.currentbookings = room.currentbookings.filter(
        booking => !bookingIdsToRemove.includes(booking.bookingId?.toString())
      );
    } else {
      // Remove long-running test bookings (over 30 days)
      room.currentbookings = room.currentbookings.filter(booking => {
        const start = new Date(booking.fromdate);
        const end = new Date(booking.todate);
        const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
        return daysDiff <= 30; // Keep bookings 30 days or less
      });
    }
    
    await room.save();
    
    res.json({
      success: true,
      message: 'Room bookings cleaned up successfully',
      remainingBookings: room.currentbookings.length
    });
    
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup bookings',
      error: error.message
    });
  }
});




module.exports = router;
