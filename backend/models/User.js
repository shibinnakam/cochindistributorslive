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
}, {
  collection: 'users' // 👈 This ensures it saves to your `users` collection
});

module.exports = mongoose.model('User', userSchema);
