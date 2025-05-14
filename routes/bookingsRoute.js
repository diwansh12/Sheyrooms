const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Booking = require("../models/booking");
const Room = require("../models/rooms");
const {client} =require("../utils/paypal");


router.post("/bookroom", async (req, res) => {
  try {
    const { roomId, userid, fromdate, todate, totalamount, totalDays } = req.body;

    // 1. Validate required fields
    const missingFields = [];
    if (!roomId) missingFields.push("roomId");
    if (!userid) missingFields.push("userid");
    if (!fromdate) missingFields.push("fromdate");
    if (!todate) missingFields.push("todate");
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: "Missing required fields",
        missing: missingFields
      });
    }

    // 2. Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ 
        message: "Invalid roomid format" 
      });
    }

    // 3. Date validation
    const startDate = new Date(fromdate);
    const endDate = new Date(todate);
    
    if (endDate <= startDate) {
      return res.status(400).json({ 
        message: "todate must be after fromdate" 
      });
    }

    // 4. Verify room exists
    const room = await Room.findById(roomId);
    console.log("Fetched room:", room);
    if (!room) {
      return res.status(404).json({ 
        message: "Room not found" 
      });
    }
    console.log("Room:", room);

    // 5. Calculate values if not provided
    const calculatedTotalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const calculatedTotalAmount = room.rentperday * calculatedTotalDays;

    // 6. Create booking
    const newbooking = new Booking({
      room: room.name,
      roomId,
      userid,
      fromdate: startDate,
      todate: endDate, 
      totalamount: totalamount || calculatedTotalAmount,
      totalDays: totalDays || calculatedTotalDays,
      transactionId: '1234-temp'
    });

    const booking = await newbooking.save();
    console.log("Booking after save:", booking);
    if (!booking) {
      return res.status(500).json({
        message: "Booking creation failed",
      });
    }
    const roomtemp = await Room.findById(roomId)
    roomtemp.currentbookings.push({
      bookingId : booking._id,
      fromdate : startDate,
      todate : endDate,
      userid : userid,
    status : booking.status
  });
  await roomtemp.save();

    // 7. Response
    res.status(201).json({
      message: "Room booked successfully",
      bookingId: booking._id,
      room: room.name,
      dates: `${startDate.toISOString()} to ${endDate.toISOString()}`,
      totalAmount: newbooking.totalamount,
      totalDays: newbooking.totalDays
    });

  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({
      message: "Booking failed",
      error: error.message
    });
  }
});

// ✅ POST /api/bookings/verify-payment — after successful PayPal payment
router.post("/verify-payment", async (req, res) => {
  const { orderID, roomId, userid, fromdate, todate, totalamount, totalDays } = req.body;

  try {
    const request = new paypal.orders.OrdersGetRequest(orderID);
    const response = await client().execute(request);
    const order = response.result;

    if (order.status !== "COMPLETED") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // Create booking after verification
    const startDate = new Date(fromdate);
    const endDate = new Date(todate);
    const room = await Room.findById(roomId);

    const booking = new Booking({
      room: room.name,
      roomId,
      userid,
      fromdate: startDate,
      todate: endDate,
      totalamount,
      totalDays,
      transactionId: order.id,
      paymentMethod: "paypal",
      status: "booked"
    });

    await booking.save();

    room.currentbookings.push({
      bookingId: booking._id,
      fromdate: startDate,
      todate: endDate,
      userid,
      status: "booked"
    });

    await room.save();

    res.status(200).json({
      message: "Booking confirmed via PayPal",
      bookingId: booking._id
    });

  } catch (error) {
    console.error("PayPal verify error:", error);
    res.status(500).json({
      message: "Payment verification failed",
      error: error.message
    });
  }
});

// POST /api/bookings/getuserbookings
router.post("/getuserbookings", async (req, res) => {
  const bookings = await Booking.find({ userid: req.body.userid });
  res.send(bookings);
});

router.post("/cancelBooking", async (req, res) => {
  const { bookingid, roomid } = req.body;

  try {
    const bookingitem = await Booking.findById(bookingid);
    if (!bookingitem) {
      return res.status(404).json({ message: "Booking not found" });
    }

    bookingitem.status = 'cancelled';
    await bookingitem.save();

    const room = await Room.findById(roomid);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.currentbookings = room.currentbookings.filter(
      booking => booking.bookingId.toString() !== bookingid
    );
    await room.save();

    res.send("Your booking was cancelled successfully");
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
});

router.get("/getallbookings", async(req,res) => {

  try{
    const bookings=await Booking.find()
    res.send(bookings)
  }
  catch(error){
    return res.status(400).json({error});
  }

})

module.exports = router;