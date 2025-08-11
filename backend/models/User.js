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
    required: true,
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
