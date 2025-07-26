// models/booking.js - Enhanced Booking Model
const mongoose = require("mongoose");

const guestSchema = {
  name: { type: String, required: true },
  age: { type: Number, min: 0 },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  idType: String,
  idNumber: String
};

const bookingSchema = mongoose.Schema({
  bookingReference: {
    type: String,
    unique: true,
    default: function() {
      return 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  room: { type: String, required: true },
  roomId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room', 
    required: true 
  },
  userid: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  fromdate: { type: Date, required: true },
  todate: { type: Date, required: true },
  checkInTime: String,
  checkOutTime: String,
  guests: {
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0 },
    infants: { type: Number, default: 0 },
    details: [guestSchema]
  },
  pricing: {
    roomRate: Number,
    totalNights: Number,
    subtotal: Number,
    taxes: {
      gst: Number,
      serviceTax: Number,
      other: Number
    },
    discounts: {
      couponCode: String,
      amount: Number,
      type: { type: String, enum: ['fixed', 'percentage'] }
    },
    addOns: [{
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 }
    }],
    totalamount: { type: Number, required: true }
  },
  payment: {
    method: { 
      type: String, 
      enum: ['paypal', 'stripe', 'razorpay', 'manual', 'wallet'],
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded', 'partial'],
      default: 'pending' 
    },
    transactionId: String,
    paymentDate: Date,
    refundAmount: { type: Number, default: 0 },
    refundDate: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'],
    default: 'pending'
  },
  specialRequests: String,
  preferences: {
    earlyCheckIn: Boolean,
    lateCheckOut: Boolean,
    roomPreferences: [String],
    dietaryRestrictions: [String]
  },
  cancellation: {
    cancelledAt: Date,
    reason: String,
    refundAmount: Number,
    cancelledBy: { type: String, enum: ['user', 'admin', 'system'] }
  },
  reviews: [{
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  notifications: {
    confirmationSent: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
    checkInSent: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Calculate total nights
bookingSchema.pre('save', function(next) {
  if (this.fromdate && this.todate) {
    const nights = Math.ceil((this.todate - this.fromdate) / (1000 * 60 * 60 * 24));
    this.pricing.totalNights = nights;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
