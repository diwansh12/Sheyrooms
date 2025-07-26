const mongoose = require("mongoose");

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
    minlength: 6
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;
