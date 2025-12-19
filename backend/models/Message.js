const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    senderEmail: {
      type: String,
      required: true,
    },
    receiverEmail: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderPhoto: String,
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    deletedBy: [
      {
        type: String,
      },
    ],
    deletedForEveryone: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
