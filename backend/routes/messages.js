const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Staff = require('../models/Staff');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const getConversationId = (email1, email2) => {
  const emails = [email1, email2].sort();
  return `${emails[0]}_${emails[1]}`;
};

router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { receiverEmail, message } = req.body;
    const senderEmail = req.user.email;

    if (!receiverEmail || !message.trim()) {
      return res.status(400).json({ error: 'Missing receiver or message' });
    }

    let sender = await Staff.findOne({ email: senderEmail });
    if (!sender) {
      sender = await User.findOne({ email: senderEmail });
    }
    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    const conversationId = getConversationId(senderEmail, receiverEmail);

    const newMessage = new Message({
      conversationId,
      senderEmail,
      receiverEmail,
      senderName: sender.name || senderEmail.split('@')[0],
      senderPhoto: sender.profilePhoto || null,
      message: message.trim(),
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: newMessage,
    });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/conversation/:receiverEmail', authMiddleware, async (req, res) => {
  try {
    const { receiverEmail } = req.params;
    const senderEmail = req.user.email;
    const conversationId = getConversationId(senderEmail, receiverEmail);

    const messages = await Message.find({ conversationId })
      .sort({ timestamp: 1 })
      .limit(100);

    const filteredMessages = messages.map(msg => {
      const msgObj = msg.toObject();
      if (msgObj.deletedForEveryone || msgObj.deletedBy?.includes(senderEmail)) {
        return msgObj;
      }
      return msgObj;
    });

    await Message.updateMany(
      {
        conversationId,
        receiverEmail: senderEmail,
        isRead: false,
        deletedForEveryone: false,
      },
      { isRead: true }
    );

    res.json({
      success: true,
      data: filteredMessages,
    });
  } catch (err) {
    console.error('Error fetching conversation:', err);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

router.get('/list', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const userRole = req.user.role;

    let conversations = [];

    if (userRole === 'admin') {
      const staffMembers = await Staff.find().select('email name profilePhoto');
      conversations = staffMembers.map(staff => ({
        email: staff.email,
        name: staff.name,
        profilePhoto: staff.profilePhoto,
      }));
    } else {
      const admin = await User.findOne({ role: 'admin' }).select('email');
      if (admin) {
        conversations.push({
          email: admin.email,
          name: 'Admin',
          profilePhoto: null,
          isAdmin: true,
        });
      }

      const otherStaff = await Staff.find({ email: { $ne: userEmail } }).select('email name profilePhoto');
      conversations.push(...otherStaff.map(staff => ({
        email: staff.email,
        name: staff.name,
        profilePhoto: staff.profilePhoto,
      })));
    }

    for (const conv of conversations) {
      const unreadCount = await Message.countDocuments({
        conversationId: getConversationId(userEmail, conv.email),
        receiverEmail: userEmail,
        isRead: false,
      });
      conv.unreadCount = unreadCount;
    }

    res.json({
      success: true,
      data: conversations,
    });
  } catch (err) {
    console.error('Error fetching conversation list:', err);
    res.status(500).json({ error: 'Failed to fetch conversation list' });
  }
});

router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;

    const unreadCount = await Message.countDocuments({
      receiverEmail: userEmail,
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount,
    });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userEmail = req.user.email;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (!message.deletedBy.includes(userEmail)) {
      message.deletedBy.push(userEmail);
      await message.save();
    }

    res.json({
      success: true,
      message: 'Message deleted for you',
    });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

router.delete('/:messageId/everyone', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userEmail = req.user.email;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderEmail !== userEmail) {
      return res.status(403).json({ error: 'Only sender can delete for everyone' });
    }

    message.deletedForEveryone = true;
    message.deletedBy = [message.senderEmail, message.receiverEmail];
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted for everyone',
    });
  } catch (err) {
    console.error('Error deleting message for everyone:', err);
    res.status(500).json({ error: 'Failed to delete message for everyone' });
  }
});

module.exports = router;
