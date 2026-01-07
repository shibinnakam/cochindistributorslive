const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const User = require("../models/User");
const crypto = require("crypto");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Middleware: Authenticate JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

/**
 * 📌 GET WALLET BALANCE
 */
router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      success: true,
      balance: user.walletBalance || 0
    });
  } catch (err) {
    console.error("Get balance error:", err);
    res.status(500).json({ msg: "Server error fetching balance" });
  }
});

/**
 * 📌 ADD MONEY TO WALLET (Create Razorpay Order)
 */
router.post("/add-money", authMiddleware, async (req, res) => {
  const { amount } = req.body;

  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Valid amount is required" });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paisa
      currency: "INR",
      receipt: `w_${req.user.id}_${Date.now().toString().slice(-10)}`,
      payment_capture: 1, // Auto capture
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error("Add money error:", err);
    res.status(500).json({ msg: "Server error creating payment order" });
  }
});

/**
 * 📌 VERIFY PAYMENT AND UPDATE WALLET
 */
router.post("/verify-payment", authMiddleware, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

  try {
    // Verify payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ msg: "Payment verification failed" });
    }

    // Update user's wallet balance
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.walletBalance = (user.walletBalance || 0) + (amount / 100); // Convert back from paisa
    await user.save();

    res.json({
      success: true,
      msg: "Payment successful and wallet updated",
      newBalance: user.walletBalance
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ msg: "Server error verifying payment" });
  }
});

module.exports = router;
