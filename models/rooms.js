// models/room.js - Enhanced Room Model
const mongoose = require("mongoose");

const amenitySchema = {
  name: String,
  icon: String,
  category: String // 'basic', 'premium', 'business'
};

const roomSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  maxcount: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  phonenumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      }
    }
  },
  rentperday: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    default: function() { return this.rentperday; }
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  imageurls: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  currentbookings: [{
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    fromdate: Date,
    todate: Date,
    userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String
  }],
  type: {
    type: String,
    required: true,
    enum: ['Standard', 'Deluxe','Delux', 'Non-Delux', 'Non-Deluxe', 'Suite', 'Presidential', 'Family']
  },
  category: {
    type: String,
    enum: ['Budget', 'Mid-Range', 'Luxury', 'Premium'],
    default: 'Mid-Range'
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  amenities: [amenitySchema],
  roomFeatures: {
    bedType: String,
    roomSize: Number, // in sq ft
    maxOccupancy: Number,
    smokingAllowed: Boolean,
    petFriendly: Boolean,
    wifi: Boolean,
    airConditioning: Boolean,
    balcony: Boolean,
    cityView: Boolean,
    oceanView: Boolean
  },
  location: {
    floor: Number,
    wing: String,
    roomNumber: String
  },
  pricing: {
    weekdayRate: Number,
    weekendRate: Number,
    seasonalMultiplier: {
      type: Map,
      of: Number
    }
  },
  availability: {
    isActive: { type: Boolean, default: true },
    maintenanceSchedule: [{
      fromDate: Date,
      toDate: Date,
      reason: String
    }]
  },
  featured: {
    type: Boolean,
    default: false
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    breakdown: {
      cleanliness: { type: Number, default: 0 },
      comfort: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      service: { type: Number, default: 0 },
      value: { type: Number, default: 0 }
    }
  },
  policies: {
    cancellationPolicy: String,
    checkInTime: String,
    checkOutTime: String,
    extraBedPolicy: String,
    childPolicy: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discounted price
roomSchema.virtual('currentPrice').get(function() {
  return this.rentperday * (1 - this.discountPercent / 100);
});

// Pre-save middleware
roomSchema.pre('save', function(next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);
