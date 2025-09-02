const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
  name: {
    type: String,  // ✅ Enforce string only
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false  // ✅ Hide password from queries by default
  },
  wallet: {
    points: { type: Number, default: 0 }
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  // ✅ NEW: Password reset fields
  passwordResetToken: {
    type: String,
    select: false  // Hide from queries for security
  },
  passwordResetExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true
});

// ✅ Add method to generate password reset token
userSchema.methods.generatePasswordReset = function() {
  // Generate secure random token
  this.passwordResetToken = crypto.randomBytes(32).toString('hex');
  // Set expiration time (10 minutes from now)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return this.passwordResetToken;
};

// ✅ Method to check if reset token is valid
userSchema.methods.isResetTokenValid = function(token) {
  return this.passwordResetToken === token && 
         this.passwordResetExpires && 
         this.passwordResetExpires > Date.now();
};

// ✅ Method to clear reset token
userSchema.methods.clearPasswordReset = function() {
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
};

// ✅ Protect sensitive fields in JSON responses
userSchema.set('toJSON', {
  transform: function(doc, ret, opt) {
    delete ret.password;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.__v;
    return ret;
  }
});

// ✅ Also protect in regular object conversion
userSchema.set('toObject', {
  transform: function(doc, ret, opt) {
    delete ret.password;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.__v;
    return ret;
  }
});

// ✅ Add text index for searching users (optional)
userSchema.index({ 
  name: 'text', 
  email: 'text' 
});

// ✅ Add compound index for password reset
userSchema.index({ 
  passwordResetToken: 1, 
  passwordResetExpires: 1 
});

userSchema.plugin(mongoosePaginate);

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
