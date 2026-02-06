const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Staff = require('../models/Staff');
const User = require('../models/User');
const Product = require('../models/Product'); // Import Product model for chatbot
const { authMiddleware } = require('../middleware/auth');

const BOT_EMAIL = 'chatbot@cochindistributors.com';
const BOT_NAME = 'Cochin AI 🤖';
const BOT_PHOTO = 'https://ui-avatars.com/api/?name=Cochin+AI&background=2563eb&color=fff&bold=true';

const getConversationId = (email1, email2) => {
  const emails = [email1, email2].sort();
  return `${emails[0]}_${emails[1]}`;
};

// 🤖 Chatbot Logic
const handleBotResponse = async (userMessage, userEmail, userName) => {
  try {
    const lowerMsg = userMessage.toLowerCase();
    let replyText = '';

    // 1. Personalized Greeting
    if (lowerMsg.match(/\b(hi|hello|hey|greetings)\b/)) {
      replyText = `Hi ${userName}! 👋 I'm your AI assistant. Ask me about our products, stock, or prices!`;
    }
    // 2. Product Query
    else if (lowerMsg.includes('product') || lowerMsg.includes('price') || lowerMsg.includes('stock') || lowerMsg.includes('show')) {
      // Extract potential search terms (remove stop words)
      const searchTerm = lowerMsg.replace(/\b(show|me|the|details|about|product|price|stock|of|for|is|what)\b/g, '').trim();

      if (searchTerm.length < 2) {
        replyText = "Could you specify which product you're looking for?";
      } else {
        const products = await Product.find({
          name: { $regex: searchTerm, $options: 'i' },
          isDeleted: false
        }).limit(3);

        if (products.length > 0) {
          replyText = `Here's what I found for "${searchTerm}":\n\n`;
          products.forEach(p => {
            replyText += `📦 **${p.name}**\n💰 Price: ₹${p.discountPrice} (MRP: ₹${p.originalPrice})\n📊 Stock: ${p.quantity} units\n📍 Rack: ${p.rackNumber}\n\n`;
          });
        } else {
          replyText = `I couldn't find any products matching "${searchTerm}". Try checking the spelling or browse our inventory tab.`;
        }
      }
    }
    // 3. Default Fallback
    else {
      replyText = "I'm trained to help with product information 📦. Try asking 'Show me Lays' or 'Price of KitKat'.";
    }

    // Save Bot Reply
    const conversationId = getConversationId(BOT_EMAIL, userEmail);
    const botReply = new Message({
      conversationId,
      senderEmail: BOT_EMAIL,
      receiverEmail: userEmail,
      senderName: BOT_NAME,
      senderPhoto: BOT_PHOTO,
      message: replyText.trim(),
    });

    await botReply.save();
    return botReply;

  } catch (err) {
    console.error('Bot Error:', err);
  }
};

router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { receiverEmail, message } = req.body;
    const senderEmail = req.user.email;

    // Simplification: Use req.user directly since authMiddleware already attached the full document
    const senderName = req.user.name || senderEmail.split('@')[0];
    const senderPhoto = req.user.profilePhoto || null;

    if (!receiverEmail || !message.trim()) {
      return res.status(400).json({ error: 'Missing receiver or message' });
    }

    const conversationId = getConversationId(senderEmail, receiverEmail);

    const newMessage = new Message({
      conversationId,
      senderEmail,
      receiverEmail,
      senderName: senderName, // Guaranteed to have a value now
      senderPhoto,
      message: message.trim(),
    });

    await newMessage.save();

    // 🤖 Intercept for Bot
    if (receiverEmail === BOT_EMAIL) {
      setTimeout(() => handleBotResponse(message, senderEmail, senderName), 500); // Small delay for realism
    }

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

    // 🤖 Add Bot to everyone's list
    conversations.push({
      email: BOT_EMAIL,
      name: BOT_NAME,
      profilePhoto: BOT_PHOTO,
      isBot: true
    });

    if (userRole === 'admin') {
      const staffMembers = await Staff.find().select('email name profilePhoto');
      conversations.push(...staffMembers.map(staff => ({
        email: staff.email,
        name: staff.name,
        profilePhoto: staff.profilePhoto,
      })));
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
