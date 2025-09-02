const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicates: one room per user in wishlist
wishlistSchema.index({ userid: 1, roomId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
