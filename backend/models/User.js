const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function () {
      // Require password only if the user is not using Google Sign-in
      return !this.googleId;
    },
  },
  googleId: {
    type: String, // Store Google account ID here
    default: null,
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'user'],
    default: 'user', // default role for self-registered users
  },

  // New fields
  name: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  pincode: {
    type: String,
    required: false,
  },
  storeName: {
    type: String,
    required: false,
  },
  storeAddress: {
    type: String,
    required: false,
  },
  landmark: {
    type: String,
  },

  // Status fields
  isActive: {
    type: Boolean,
    default: true,   // user not active until admin activates
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'not_verified'],
    default: 'pending',  // initially pending
  },

  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Cart
  cart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
    }
  ],

  // Wallet
  walletBalance: {
    type: Number,
    default: 0,
    min: 0,
  }
}, {
  collection: 'users',
  timestamps: true, // adds createdAt & updatedAt
});

module.exports = mongoose.model('User', userSchema);
