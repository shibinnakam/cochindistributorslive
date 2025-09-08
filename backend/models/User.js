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
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {
  collection: 'users'
});

module.exports = mongoose.model('User', userSchema);
