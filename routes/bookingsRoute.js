// routes/bookingsRoute.js - Improved Backend API
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Booking = require("../models/booking");
const Room = require("../models/rooms");
const User = require("../models/user");
const { validateBooking, authenticateToken, authorizeAdmin } = require("../middleware/validation");
const { sendBookingConfirmation, sendCancellationEmail } = require("../client/src/utils/emailService");
const { generateBookingPDF } = require("../client/src/utils/pdfGenerator");


// Enhanced booking creation with comprehensive validation
router.post("/bookroom", authenticateToken, validateBooking, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      roomId,
      userid,
      fromdate,
      todate,
      guestCount,
      primaryGuest,
      additionalGuests,
      preferences,
      addOns,
      specialRequests,
      paymentMethod,
      totalamount,
      totalNights
    } = req.body;

    // Validate dates
    const startDate = new Date(fromdate);
    const endDate = new Date(todate);
    const now = new Date();

    if (startDate <= now) {
      return res.status(400).json({
        success: false,
        message: "Check-in date must be in the future"
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date"
      });
    }

    // Check room availability with session
    const room = await Room.findById(roomId).session(session);
    if (!room) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    if (!room.availability.isActive) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Room is currently not available for booking"
      });
    }


    // Check for conflicting bookings
    const conflictingBookings = room.currentbookings.filter(booking => {
      const bookingStart = new Date(booking.fromdate);
      const bookingEnd = new Date(booking.todate);

      return (
        (startDate >= bookingStart && startDate < bookingEnd) ||
        (endDate > bookingStart && endDate <= bookingEnd) ||
        (startDate <= bookingStart && endDate >= bookingEnd)
      );
    });

    if (conflictingBookings.length > 0) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: "Room is not available for the selected dates",
        conflictingBookings
      });
    }

    // Calculate pricing
    const basePrice = room.currentPrice || room.rentperday;
    const subtotal = basePrice * totalNights;
    const addOnTotal = addOns ? addOns.reduce((sum, addOn) => sum + addOn.price, 0) : 0;
    const totalBeforeTax = subtotal + addOnTotal;
    const taxes = Math.round(totalBeforeTax * 0.18); // 18% GST
    const serviceFee = Math.round(totalBeforeTax * 0.05); // 5% service fee
    const calculatedTotal = totalBeforeTax + taxes + serviceFee;

    // Validate total amount (allow 1% tolerance for rounding)
    if (Math.abs(totalamount - calculatedTotal) > calculatedTotal * 0.01) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Total amount mismatch",
        expected: calculatedTotal,
        received: totalamount
      });
    }

    // Create comprehensive booking
    const newBooking = new Booking({
      room: room.name,
      roomId,
      userid,
      fromdate: startDate,
      todate: endDate,
      guests: {
        adults: guestCount.adults,
        children: guestCount.children,
        infants: guestCount.infants,
        details: [
          {
            name: `${primaryGuest.firstName} ${primaryGuest.lastName}`,
            age: primaryGuest.age || null,
            idType: primaryGuest.idType || null,
            idNumber: primaryGuest.idNumber || null
          },
          ...(additionalGuests || []).map(guest => ({
            name: `${guest.firstName} ${guest.lastName}`,
            age: guest.age,
            relation: guest.relation
          }))
        ]
      },
      pricing: {
        roomRate: basePrice,
        totalNights,
        subtotal,
        taxes: { gst: taxes, serviceTax: serviceFee, other: 0 },
        addOns: addOns || [],
        totalamount: calculatedTotal
      },
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'manual' ? 'pending' : 'completed',
        transactionId: req.body.transactionId || `${paymentMethod}_${Date.now()}`,
        paymentDate: paymentMethod !== 'manual' ? new Date() : null
      },
      preferences: preferences || {},
      specialRequests: specialRequests || '',
      status: 'confirmed'
    });

    const savedBooking = await newBooking.save({ session });

    // Update room bookings
    room.currentbookings.push({
      bookingId: savedBooking._id,
      fromdate: startDate,
      todate: endDate,
      userid,
      status: 'confirmed'
    });

    await room.save({ session });

    // Update user booking history
    const user = await User.findById(userid).session(session);
if (user) {
  // ✅ Initialize loyalty program if it doesn't exist
  if (!user.loyaltyProgram) {
    user.loyaltyProgram = {
      points: 0,
      totalSpent: 0,
      level: 'Bronze'
    };
  }
  
  // Now safely update loyalty program
  user.loyaltyProgram.points += Math.floor(totalamount / 100);
  user.loyaltyProgram.totalSpent += totalamount;
  
  // Update loyalty level
  if (user.loyaltyProgram.totalSpent >= 100000) user.loyaltyProgram.level = 'Platinum';
  else if (user.loyaltyProgram.totalSpent >= 50000) user.loyaltyProgram.level = 'Gold';
  else if (user.loyaltyProgram.totalSpent >= 25000) user.loyaltyProgram.level = 'Silver';
  
  await user.save({ session });
}

    await session.commitTransaction();

    // Send confirmation email (async, don't wait)
    sendBookingConfirmation(user.email, {
      booking: savedBooking,
      room,
      guest: primaryGuest
    }).catch(console.error);

    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully",
      data: {
        bookingId: savedBooking._id,
        bookingReference: savedBooking.bookingReference,
        room: room.name,
        checkIn: startDate.toISOString(),
        checkOut: endDate.toISOString(),
        totalAmount: calculatedTotal,
        paymentStatus: savedBooking.payment.status,
        loyaltyPointsEarned: Math.floor(totalamount / 100)
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Booking creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  } finally {
    session.endSession();
  }
});

// Get user bookings with enhanced details
router.post("/getuserbookings", authenticateToken, async (req, res) => {
  try {
    const { userid } = req.body;
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let query = { userid };
    if (status && status !== 'all') {
      query.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: [
        { path: 'roomId', select: 'name type imageurls amenities' },
        { path: 'userid', select: 'name email phone' }
      ]
    };

    const bookings = await Booking.paginate(query, options);

    // Enhance bookings with additional data
    const enhancedBookings = await Promise.all(
      bookings.docs.map(async (booking) => {
        const bookingObj = booking.toObject();

        // Add days until check-in
        const today = new Date();
        const checkIn = new Date(booking.fromdate);
        bookingObj.daysUntilCheckIn = Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24));

        // Add cancellation deadline
        const cancellationDeadline = new Date(checkIn);
        cancellationDeadline.setHours(cancellationDeadline.getHours() - 24);
        bookingObj.canCancel = today < cancellationDeadline && booking.status === 'confirmed';

        // Add modification availability
        bookingObj.canModify = bookingObj.canCancel && bookingObj.daysUntilCheckIn > 2;

        return bookingObj;
      })
    );

    res.json({
      success: true,
      data: {
        bookings: enhancedBookings,
        pagination: {
          currentPage: bookings.page,
          totalPages: bookings.totalPages,
          totalDocs: bookings.totalDocs,
          hasNextPage: bookings.hasNextPage,
          hasPrevPage: bookings.hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Enhanced booking cancellation
router.post("/cancelBooking", authenticateToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingid, reason } = req.body;

    const booking = await Booking.findById(bookingid).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check if cancellation is allowed
    const checkInDate = new Date(booking.fromdate);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 24) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Cancellation not allowed within 24 hours of check-in"
      });
    }

    if (booking.status === 'cancelled') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled"
      });
    }

    // Calculate refund amount based on cancellation policy
    let refundPercentage = 100;
    if (hoursUntilCheckIn < 48) refundPercentage = 50;
    else if (hoursUntilCheckIn < 72) refundPercentage = 75;

    const refundAmount = Math.round(booking.pricing.totalamount * refundPercentage / 100);

    // Update booking
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledAt: now,
      reason: reason || 'Cancelled by user',
      refundAmount,
      cancelledBy: 'user'
    };
    booking.payment.refundAmount = refundAmount;
    booking.payment.status = refundAmount > 0 ? 'refunded' : 'cancelled';

    await booking.save({ session });

    // Remove from room bookings
    const room = await Room.findById(booking.roomId).session(session);
    if (room) {
      room.currentbookings = room.currentbookings.filter(
        roomBooking => roomBooking.bookingId.toString() !== bookingid
      );
      await room.save({ session });
    }

    // Update user loyalty points (deduct earned points)
    const user = await User.findById(booking.userid).session(session);
    if (user) {
      const pointsToDeduct = Math.floor(booking.pricing.totalamount / 100);
      user.loyaltyProgram.points = Math.max(0, user.loyaltyProgram.points - pointsToDeduct);
      user.loyaltyProgram.totalSpent = Math.max(0, user.loyaltyProgram.totalSpent - booking.pricing.totalamount);
      await user.save({ session });
    }

    await session.commitTransaction();

    // Send cancellation email
    if (user) {
      sendCancellationEmail(user.email, {
        booking,
        refundAmount,
        refundPercentage
      }).catch(console.error);
    }

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        refundAmount,
        refundPercentage,
        processingTime: "3-5 business days"
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Booking cancellation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  } finally {
    session.endSession();
  }
});

// Modify booking
router.post("/modifyBooking", authenticateToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingid, newFromDate, newToDate, additionalRequests } = req.body;

    const booking = await Booking.findById(bookingid).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Validate modification is allowed
    const originalCheckIn = new Date(booking.fromdate);
    const now = new Date();
    const hoursUntilCheckIn = (originalCheckIn - now) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 48) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Modifications not allowed within 48 hours of check-in"
      });
    }

    const newStartDate = new Date(newFromDate);
    const newEndDate = new Date(newToDate);
    const newTotalNights = Math.ceil((newEndDate - newStartDate) / (1000 * 60 * 60 * 24));

    // Check room availability for new dates
    const room = await Room.findById(booking.roomId).session(session);
    const conflictingBookings = room.currentbookings.filter(roomBooking => {
      if (roomBooking.bookingId.toString() === bookingid) return false; // Exclude current booking

      const bookingStart = new Date(roomBooking.fromdate);
      const bookingEnd = new Date(roomBooking.todate);

      return (
        (newStartDate >= bookingStart && newStartDate < bookingEnd) ||
        (newEndDate > bookingStart && newEndDate <= bookingEnd) ||
        (newStartDate <= bookingStart && newEndDate >= bookingEnd)
      );
    });

    if (conflictingBookings.length > 0) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: "Room is not available for the new dates"
      });
    }

    // Calculate new pricing
    const roomRate = room.currentPrice || room.rentperday;
    const newSubtotal = roomRate * newTotalNights;
    const addOnTotal = booking.pricing.addOns.reduce((sum, addOn) => sum + addOn.price, 0);
    const newTotalBeforeTax = newSubtotal + addOnTotal;
    const newTaxes = Math.round(newTotalBeforeTax * 0.18);
    const newServiceFee = Math.round(newTotalBeforeTax * 0.05);
    const newTotalAmount = newTotalBeforeTax + newTaxes + newServiceFee;

    const priceDifference = newTotalAmount - booking.pricing.totalamount;

    // Update booking
    const originalFromDate = booking.fromdate;
    const originalToDate = booking.todate;

    booking.fromdate = newStartDate;
    booking.todate = newEndDate;
    booking.pricing.subtotal = newSubtotal;
    booking.pricing.totalamount = newTotalAmount;
    booking.pricing.taxes.gst = newTaxes;
    booking.pricing.taxes.serviceTax = newServiceFee;

    if (additionalRequests) {
      booking.specialRequests = booking.specialRequests + '\n\n' + additionalRequests;
    }

    // Add modification history
    if (!booking.modificationHistory) booking.modificationHistory = [];
    booking.modificationHistory.push({
      modifiedAt: now,
      originalDates: { from: originalFromDate, to: originalToDate },
      newDates: { from: newStartDate, to: newEndDate },
      priceDifference,
      reason: additionalRequests || 'Date modification'
    });

    await booking.save({ session });

    // Update room bookings
    const roomBookingIndex = room.currentbookings.findIndex(
      rb => rb.bookingId.toString() === bookingid
    );

    if (roomBookingIndex !== -1) {
      room.currentbookings[roomBookingIndex].fromdate = newStartDate;
      room.currentbookings[roomBookingIndex].todate = newEndDate;
      await room.save({ session });
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Booking modified successfully",
      data: {
        newCheckIn: newStartDate.toISOString(),
        newCheckOut: newEndDate.toISOString(),
        newTotalAmount,
        priceDifference,
        paymentRequired: priceDifference > 0,
        refundDue: priceDifference < 0
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Booking modification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to modify booking"
    });
  } finally {
    session.endSession();
  }
});


// Add this test route to your booking routes file
// Add this to your booking routes file
router.get('/debug-auth', authenticateToken, (req, res) => {
  console.log('🧪 Debug auth endpoint reached successfully');
  res.json({
    success: true,
    message: 'Authentication working perfectly',
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name
    },
    timestamp: new Date().toISOString()
  });
});

// Alternative approach - direct database update
router.get('/fix-room-delux', async (req, res) => {
  try {
    console.log('🔧 Starting room type fix...');
    
    // Find all rooms with 'Delux' type
    const roomsToFix = await Room.find({ type: 'Delux' });
    console.log('📋 Found rooms with Delux type:', roomsToFix.length);
    
    if (roomsToFix.length === 0) {
      return res.json({
        success: true,
        message: 'No rooms found with Delux type',
        roomsFixed: 0
      });
    }
    
    // Update all rooms with 'Delux' to 'Deluxe'
    const updateResult = await Room.updateMany(
      { type: 'Delux' },
      { $set: { type: 'Deluxe' } }
    );
    
    console.log('✅ Update result:', updateResult);
    
    res.json({
      success: true,
      message: 'Room types fixed successfully',
      roomsFixed: updateResult.modifiedCount,
      matchedCount: updateResult.matchedCount
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

// Admin routes
router.get("/getallbookings", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      fromDate,
      toDate,
      roomType,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    let query = {};

    if (status && status !== 'all') query.status = status;
    if (fromDate) query.fromdate = { $gte: new Date(fromDate) };
    if (toDate) query.todate = { $lte: new Date(toDate) };
    if (search) {
      query.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
        { room: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: [
        {
          path: 'roomId',
          select: 'name type imageurls location',
          match: roomType && roomType !== 'all' ? { type: roomType } : {}
        },
        {
          path: 'userid',
          select: 'name email phone loyaltyProgram.level'
        }
      ]
    };

    const result = await Booking.paginate(query, options);

    // Filter out bookings where room population failed (due to roomType filter)
    if (roomType && roomType !== 'all') {
      result.docs = result.docs.filter(booking => booking.roomId);
    }

    // Add analytics data
    const analytics = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.totalamount' },
          totalBookings: { $sum: 1 },
          avgBookingValue: { $avg: '$pricing.totalamount' },
          statusBreakdown: {
            $push: '$status'
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: result.docs,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalDocs: result.totalDocs,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      },
      analytics: analytics[0] || {
        totalRevenue: 0,
        totalBookings: 0,
        avgBookingValue: 0,
        statusBreakdown: []
      }
    });

  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings"
    });
  }
});

module.exports = router;
