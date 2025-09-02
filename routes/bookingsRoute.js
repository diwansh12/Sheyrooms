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


// ✅ ENHANCED: Better date validation with comprehensive logging
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

    // ✅ ENHANCED: Comprehensive date logging and validation
    console.log('📅 BOOKING DATE VALIDATION:', {
      received: {
        fromdate: fromdate,
        todate: todate,
        fromdateType: typeof fromdate,
        todateType: typeof todate
      },
      serverTime: {
        now: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        offset: new Date().getTimezoneOffset()
      }
    });

    // ✅ IMPROVED: More robust date parsing
    let startDate, endDate;
    
    try {
      // Handle both ISO strings and direct Date objects
      startDate = new Date(fromdate);
      endDate = new Date(todate);
      
      // Validate parsed dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format');
      }
      
      console.log('✅ DATE PARSING SUCCESS:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startDateLocal: startDate.toLocaleDateString(),
        endDateLocal: endDate.toLocaleDateString()
      });
      
    } catch (dateError) {
      console.error('❌ DATE PARSING ERROR:', dateError);
      return res.status(400).json({
        success: false,
        message: "Invalid date format provided",
        details: {
          fromdate: fromdate,
          todate: todate,
          error: dateError.message
        }
      });
    }

    // ✅ IMPROVED: More lenient date validation
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
    const startOfDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    
    console.log('🕐 DATE COMPARISON:', {
      now: now.toISOString(),
      today: today.toISOString(),
      startOfDay: startOfDay.toISOString(),
      isStartDateToday: startOfDay.getTime() === today.getTime(),
      isStartDateFuture: startOfDay >= today,
      daysDifference: Math.ceil((startOfDay - today) / (1000 * 60 * 60 * 24))
    });

    // ✅ FIXED: Allow same-day bookings, only reject past dates
    if (startOfDay < today) {
      console.error('❌ DATE VALIDATION FAILED: Check-in date is in the past');
      return res.status(400).json({
        success: false,
        message: "Check-in date cannot be in the past",
        details: {
          requestedDate: startDate.toISOString(),
          serverDate: now.toISOString(),
          daysInPast: Math.ceil((today - startOfDay) / (1000 * 60 * 60 * 24))
        }
      });
    }

    if (endDate <= startDate) {
      console.error('❌ DATE VALIDATION FAILED: End date not after start date');
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
        details: {
          checkIn: startDate.toISOString(),
          checkOut: endDate.toISOString()
        }
      });
    }

    // ✅ ENHANCED: Room validation with logging
    console.log('🏠 ROOM VALIDATION:', { roomId, findingRoom: true });
    
    const room = await Room.findById(roomId).session(session);
    if (!room) {
      console.error('❌ ROOM NOT FOUND:', roomId);
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Room not found",
        roomId: roomId
      });
    }

    console.log('✅ ROOM FOUND:', {
      roomId: room._id,
      roomName: room.name,
      isActive: room.availability?.isActive,
      currentBookingsCount: room.currentbookings?.length || 0
    });

    if (!room.availability?.isActive) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Room is currently not available for booking"
      });
    }

    // ✅ ENHANCED: Conflict detection with detailed logging
    console.log('🔍 CHECKING FOR CONFLICTS...');
    
    const conflictingBookings = room.currentbookings.filter(booking => {
      // Skip cancelled bookings
      if (booking.status === 'cancelled') {
        console.log('⏭️ Skipping cancelled booking:', booking.bookingId);
        return false;
      }

      const bookingStart = new Date(booking.fromdate);
      const bookingEnd = new Date(booking.todate);

      console.log('🔍 Checking conflict with:', {
        bookingId: booking.bookingId,
        bookingStart: bookingStart.toISOString().split('T')[0],
        bookingEnd: bookingEnd.toISOString().split('T'),
        requestedStart: startDate.toISOString().split('T'),
        requestedEnd: endDate.toISOString().split('T'),
        status: booking.status
      });

      // ✅ FIXED: Proper date overlap logic
      // Two date ranges overlap if: start1 < end2 AND start2 < end1
      const hasConflict = (
        startDate < bookingEnd && bookingStart < endDate
      );
      
      if (hasConflict) {
        console.log('⚠️ CONFLICT DETECTED');
      } else {
        console.log('✅ NO CONFLICT');
      }

      return hasConflict;
    });

    console.log('📊 CONFLICT CHECK RESULTS:', {
      totalBookings: room.currentbookings.length,
      conflictsFound: conflictingBookings.length,
      conflictDetails: conflictingBookings.map(b => ({
        id: b.bookingId,
        dates: `${new Date(b.fromdate).toISOString().split('T')[0]} to ${new Date(b.todate).toISOString().split('T')}`,
        status: b.status
      }))
    });

    if (conflictingBookings.length > 0) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: "Room is not available for the selected dates",
        conflictingBookings: conflictingBookings.map(booking => ({
          bookingId: booking.bookingId,
          fromdate: booking.fromdate,
          todate: booking.todate,
          status: booking.status,
          userid: booking.userid
        }))
      });
    }

    // ✅ Continue with the rest of your booking logic...
    // Calculate pricing
    const basePrice = room.currentPrice || room.rentperday;
    const subtotal = basePrice * totalNights;
    const addOnTotal = addOns ? addOns.reduce((sum, addOn) => sum + addOn.price, 0) : 0;
    const totalBeforeTax = subtotal + addOnTotal;
    const taxes = Math.round(totalBeforeTax * 0.18); // 18% GST
    const serviceFee = Math.round(totalBeforeTax * 0.05); // 5% service fee
    const calculatedTotal = totalBeforeTax + taxes + serviceFee;

    console.log('💰 PRICING CALCULATION:', {
      basePrice,
      totalNights,
      subtotal,
      addOnTotal,
      totalBeforeTax,
      taxes,
      serviceFee,
      calculatedTotal,
      receivedTotal: totalamount
    });

    // ✅ IMPROVED: More lenient total validation (allow 5% tolerance)
    const tolerance = calculatedTotal * 0.05;
    if (Math.abs(totalamount - calculatedTotal) > tolerance) {
      console.error('❌ PRICE MISMATCH:', {
        expected: calculatedTotal,
        received: totalamount,
        difference: Math.abs(totalamount - calculatedTotal),
        tolerance: tolerance
      });
      
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Total amount mismatch",
        expected: calculatedTotal,
        received: totalamount,
        tolerance: tolerance
      });
    }

    // Rest of your booking creation code remains the same...
    const newBooking = new Booking({
      room: room.name,
      roomId,
      userid,
      fromdate: startDate,
      todate: endDate,
      guests: {
        adults: guestCount.adults,
        children: guestCount.children,
        infants: guestCount.infants || 0,
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

    console.log('💾 SAVING BOOKING:', {
      bookingId: 'generating...',
      room: room.name,
      dates: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')}`,
      amount: calculatedTotal
    });

    const savedBooking = await newBooking.save({ session });
    
    console.log('✅ BOOKING SAVED:', {
      bookingId: savedBooking._id,
      bookingReference: savedBooking.bookingReference
    });

    // Update room bookings
    room.currentbookings.push({
      bookingId: savedBooking._id,
      fromdate: startDate,
      todate: endDate,
      userid,
      status: 'confirmed'
    });

    await room.save({ session });
    console.log('✅ ROOM UPDATED with new booking');

    // Update user (with null check for loyaltyProgram)
    const user = await User.findById(userid).session(session);
    if (user) {
      if (!user.loyaltyProgram) {
        user.loyaltyProgram = {
          points: 0,
          totalSpent: 0,
          level: 'Bronze'
        };
      }
      
      user.loyaltyProgram.points += Math.floor(totalamount / 100);
      user.loyaltyProgram.totalSpent += totalamount;
      
      if (user.loyaltyProgram.totalSpent >= 100000) user.loyaltyProgram.level = 'Platinum';
      else if (user.loyaltyProgram.totalSpent >= 50000) user.loyaltyProgram.level = 'Gold';
      else if (user.loyaltyProgram.totalSpent >= 25000) user.loyaltyProgram.level = 'Silver';
      
      await user.save({ session });
      console.log('✅ USER UPDATED with loyalty points');
    }

    await session.commitTransaction();
    console.log('✅ TRANSACTION COMMITTED SUCCESSFULLY');

    // Send confirmation email (async, don't wait)
    if (user) {
      sendBookingConfirmation(user.email, {
        booking: savedBooking,
        room,
        guest: primaryGuest
      }).catch(console.error);
    }

    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully",
      data: {
        bookingId: savedBooking._id,
        bookingReference: savedBooking.bookingReference,
        room: room.name,
        checkIn: startDate.toISOString(),
        checkOut: endDate.toISOString(),
        totalamount: calculatedTotal,
        paymentStatus: savedBooking.payment.status,
        loyaltyPointsEarned: Math.floor(totalamount / 100)
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("❌ BOOKING CREATION ERROR:", {
      error: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      debug: process.env.NODE_ENV === 'development' ? {
        errorType: error.constructor.name,
        errorMessage: error.message
      } : undefined
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
   console.error("Get all bookings error:", error);
res.status(500).json({
  success: false,
  message: "Failed to fetch bookings",
  error: error.message // Add this temporarily for dev debugging
});

  }
});

router.post("/cancelBooking", authenticateToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingId, reason } = req.body;

    if (!bookingId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Booking ID is required"
      });
    }

    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    booking.status = "cancelled";
    booking.cancellation = {
      cancelledAt: new Date(),
      reason: reason || "User requested cancellation",
      cancelledBy: "user"
    };

    await booking.save({ session });

    await session.commitTransaction();
    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (err) {
    await session.abortTransaction();
    console.error("❌ Cancel Booking Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: err.message
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
    // In your backend bookingsRoute.js, update the conflict check:

// ✅ FIXED conflict checking logic in your backend
const conflictingBookings = room.currentbookings.filter(booking => {
  // Skip cancelled bookings
  if (booking.status === 'cancelled') {
    console.log('⏭️ Skipping cancelled booking:', booking.bookingId);
    return false;
  }

  const bookingStart = new Date(booking.fromdate);
  const bookingEnd = new Date(booking.todate);

  console.log('🔍 Checking conflict with:', {
    bookingId: booking.bookingId,
    bookingStart: bookingStart.toISOString().split('T')[0],
    bookingEnd: bookingEnd.toISOString().split('T'),
    requestedStart: startDate.toISOString().split('T'),
    requestedEnd: endDate.toISOString().split('T'),
    status: booking.status
  });

  // ✅ FIXED: Proper date overlap logic
  // Two date ranges overlap if: start1 < end2 AND start2 < end1
  const hasConflict = (
    startDate < bookingEnd && bookingStart < endDate
  );
  
  if (hasConflict) {
    console.log('⚠️ CONFLICT DETECTED');
  } else {
    console.log('✅ NO CONFLICT');
  }

  return hasConflict;
});



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


// ✅ ADD THIS: Debug endpoint to check room bookings
router.get('/debug-room/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    const currentBookings = room.currentbookings.map(booking => ({
      bookingId: booking.bookingId,
      fromdate: booking.fromdate,
      todate: booking.todate,
      status: booking.status,
      userid: booking.userid,
      datesFormatted: {
        from: new Date(booking.fromdate).toISOString().split('T')[0],
        to: new Date(booking.todate).toISOString().split('T')
      }
    }));
    
    res.json({
      success: true,
      data: {
        roomId: room._id,
        roomName: room.name,
        roomType: room.type,
        isActive: room.availability?.isActive,
        totalBookings: currentBookings.length,
        activeBookings: currentBookings.filter(b => b.status !== 'cancelled').length,
        bookings: currentBookings
      }
    });
    
  } catch (error) {
    console.error('Debug room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to debug room',
      error: error.message
    });
  }
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
