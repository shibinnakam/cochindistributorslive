const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const Notification = require("../models/Notification");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

module.exports = (io) => {

const checkProfileCompletion = (user) => {
  const requiredFields = ['name', 'phone', 'pincode', 'storeName', 'storeAddress'];
  const missingFields = requiredFields.filter(field => !user[field] || user[field].trim() === '');
  return missingFields;
};

const notifyAdmins = async (message, type, orderId) => {
  try {
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        message,
        type,
        orderId,
      });
    }
  } catch (error) {
    console.error("Error notifying admins:", error);
  }
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a Razorpay Order
router.post("/create-razorpay-order", authMiddleware, async (req, res) => {
  const { amount } = req.body;

  try {
    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).send("Some error occured");

    res.json(order);
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).send(error);
  }
});

// Verify Payment and Create Local Order
router.post("/verify-payment", authMiddleware, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    items,
    totalAmount,
  } = req.body;

  // Check profile completion
  const missingFields = checkProfileCompletion(req.user);
  if (missingFields.length > 0) {
    return res.status(400).json({
      msg: `Please complete your profile before placing an order. Missing fields: ${missingFields.join(', ')}`
    });
  }

  const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest("hex");

  if (digest !== razorpay_signature) {
    return res.status(400).json({ msg: "Transaction not legit!" });
  }

  try {
    // Create new order
    const newOrder = new Order({
      user: req.user._id,
      items,
      totalAmount,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      status: "ordered",
    });

    await newOrder.save();

    // Notify Admins
    await notifyAdmins(
      `New order placed by ${req.user.email}. Total: ₹${totalAmount}`,
      "order_placed",
      newOrder._id
    );

    // Clear user's cart
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    // Decrease product quantity in stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity },
      });
    }

    res.json({ msg: "Payment successful and order placed", order: newOrder });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Place Order with Wallet Payment
router.post("/place-order-wallet", authMiddleware, async (req, res) => {
  const { items, totalAmount } = req.body;

  try {
    // Get user and check wallet balance
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (user.walletBalance < totalAmount) {
      return res.status(400).json({ msg: "Insufficient wallet balance" });
    }

    // Deduct amount from wallet
    user.walletBalance -= totalAmount;
    await user.save();

    // Create new order
    const newOrder = new Order({
      user: req.user._id,
      items,
      totalAmount,
      paymentMethod: "wallet",
      status: "ordered",
    });

    await newOrder.save();

    // Notify Admins
    await notifyAdmins(
      `New order placed by ${user.email} using wallet. Total: ₹${totalAmount}`,
      "order_placed",
      newOrder._id
    );

    // Clear user's cart
    user.cart = [];
    await user.save();

    // Decrease product quantity in stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity },
      });
    }

    res.json({
      msg: "Order placed successfully with wallet payment",
      order: newOrder,
      newBalance: user.walletBalance
    });
  } catch (error) {
    console.error("Wallet order placement error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get User Orders
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin: Get All Orders with User details
router.get("/admin/all-orders", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone storeName storeAddress")
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Admin get all orders error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin: Update Order Status
router.patch("/admin/orders/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ msg: "Order not found" });

    // Notify user about status update
    await Notification.create({
      recipient: order.user,
      message: `Your order #${order._id} status has been updated to ${status}`,
      type: "order_status_update",
      orderId: order._id,
    });

    // Emit real-time update to the user
    io.to(order.user.toString()).emit('orderStatusUpdate', {
      orderId: order._id,
      status: order.status
    });

    res.json(order);
  } catch (error) {
    console.error("Admin update status error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get Notifications
router.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Mark Notification as Read
router.patch("/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ msg: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

  return router;
};
