const express = require("express");
module.exports = (io) => {
  const router = express.Router();
  const Razorpay = require("razorpay");
  const crypto = require("crypto");
  const Order = require("../models/Order");
  const User = require("../models/User");
  const Product = require("../models/Product");
  const Notification = require("../models/Notification");
  const Invoice = require("../models/Invoice");
  const { authMiddleware, adminMiddleware } = require("../middleware/auth");

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
    }
  };

  const createInvoice = async (order, user, paymentMethod, paymentId = "") => {
    try {
      const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const invoiceItems = await Promise.all(order.items.map(async (item) => {
        const product = await Product.findById(item.product);
        return {
          product: item.product,
          productName: product ? product.name : "Product",
          quantity: item.quantity,
          price: item.price
        };
      }));

      const newInvoice = new Invoice({
        invoiceNumber,
        user: user._id,
        order: order._id,
        items: invoiceItems,
        totalAmount: order.totalAmount,
        paymentMethod,
        paymentId,
        status: "paid"
      });

      await newInvoice.save();
      console.log(`Invoice generated: ${invoiceNumber}`);
      return newInvoice;
    } catch (error) {
      console.error("Error generating invoice:", error);
    }
  };

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const generateScratchCardOffer = (totalAmount) => {
    // If order amount is 100 or less, give "Better luck next time" 90% of the time
    // and small rewards (1 or 2 rupees) 10% of the time (5% each)
    if (totalAmount <= 100) {
      const random = Math.random() * 100;
      if (random < 90) {
        return 0;
      } else if (random < 95) {
        return 1;
      } else {
        return 2;
      }
    }

    // Generate random scratch card offer between 1 and 20 rupees for orders > 100
    return Math.floor(Math.random() * 20) + 1;
  };

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
      // Generate random scratch card offer based on total amount
      const scratchCardOffer = generateScratchCardOffer(totalAmount);

      // Populate items with latest costPrice for profit tracking
      const enrichedItems = await Promise.all(items.map(async (item) => {
        const product = await Product.findById(item.product);
        return {
          ...item,
          costPrice: product ? product.costPrice : 0
        };
      }));

      // Create new order
      const newOrder = new Order({
        user: req.user._id,
        items: enrichedItems,
        totalAmount,
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        status: "ordered",
        scratchCardOffer,
      });

      await newOrder.save();

      // Generate Invoice
      await createInvoice(newOrder, req.user, "razorpay", razorpay_payment_id);

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

      // Emit real-time update to the user
      io.to(req.user._id.toString()).emit('orderPlaced', { order: newOrder });

      // Emit to admin room for dashboard stats update
      io.to('admin').emit('statsUpdated');

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

      // Generate random scratch card offer based on total amount
      const scratchCardOffer = generateScratchCardOffer(totalAmount);

      // Populate items with latest costPrice for profit tracking
      const enrichedItems = await Promise.all(items.map(async (item) => {
        const product = await Product.findById(item.product);
        return {
          ...item,
          costPrice: product ? product.costPrice : 0
        };
      }));

      // Create new order
      const newOrder = new Order({
        user: req.user._id,
        items: enrichedItems,
        totalAmount,
        paymentMethod: "wallet",
        status: "ordered",
        scratchCardOffer,
      });

      await newOrder.save();

      // Generate Invoice
      await createInvoice(newOrder, user, "wallet");

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

      // Emit to admin room for dashboard stats update
      io.to('admin').emit('statsUpdated');

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

  // Admin: Get Sales Analytics
  router.get("/admin/sales-analytics", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const orders = await Order.find({ status: { $ne: "cancelled" } }).populate("items.product");

      let totalPurchases = 0;
      let totalProfit = 0;
      let dailyPurchases = {};
      let monthlyPurchases = {};
      let yearlyPurchases = {};
      let dailyProfit = {};
      let monthlyProfit = {};
      let yearlyProfit = {};

      orders.forEach(order => {
        const date = new Date(order.createdAt);
        const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
        const yearKey = date.getFullYear().toString(); // YYYY

        let orderProfit = 0;
        order.items.forEach(item => {
          const cost = item.costPrice * item.quantity;
          const revenue = item.price * item.quantity;
          orderProfit += revenue - cost;
        });

        totalPurchases += order.totalAmount;
        totalProfit += orderProfit;

        // Daily
        if (!dailyPurchases[dayKey]) dailyPurchases[dayKey] = 0;
        if (!dailyProfit[dayKey]) dailyProfit[dayKey] = 0;
        dailyPurchases[dayKey] += order.totalAmount;
        dailyProfit[dayKey] += orderProfit;

        // Monthly
        if (!monthlyPurchases[monthKey]) monthlyPurchases[monthKey] = 0;
        if (!monthlyProfit[monthKey]) monthlyProfit[monthKey] = 0;
        monthlyPurchases[monthKey] += order.totalAmount;
        monthlyProfit[monthKey] += orderProfit;

        // Yearly
        if (!yearlyPurchases[yearKey]) yearlyPurchases[yearKey] = 0;
        if (!yearlyProfit[yearKey]) yearlyProfit[yearKey] = 0;
        yearlyPurchases[yearKey] += order.totalAmount;
        yearlyProfit[yearKey] += orderProfit;
      });

      res.json({
        totalPurchases,
        totalProfit,
        daily: { purchases: dailyPurchases, profit: dailyProfit },
        monthly: { purchases: monthlyPurchases, profit: monthlyProfit },
        yearly: { purchases: yearlyPurchases, profit: yearlyProfit }
      });
    } catch (error) {
      console.error("Sales analytics error:", error);
      res.status(500).json({ msg: "Server error" });
    }
  });

  // Rate Order Item
  router.patch("/rate-item", authMiddleware, async (req, res) => {
    const { orderId, itemId, rating, suggestion } = req.body;
    const Review = require("../models/Review");

    try {
      const order = await Order.findOne({ _id: orderId, user: req.user._id });
      if (!order) return res.status(404).json({ msg: "Order not found" });

      if (order.status !== "delivered") {
        return res.status(400).json({ msg: "Can only rate delivered orders" });
      }

      const item = order.items.id(itemId);
      if (!item) return res.status(404).json({ msg: "Item not found in order" });

      // Check if already rated in Order model
      if (item.rating) {
        return res.status(400).json({ msg: "Item already rated" });
      }

      // Update Order model
      item.rating = rating;
      item.suggestion = suggestion || "";
      await order.save();

      // Create a Review document - Automatically Approved
      const review = new Review({
        user: req.user._id,
        product: item.product,
        rating: rating,
        comment: suggestion || "No comment provided",
        isApproved: true // Automatically approved as requested
      });
      await review.save();

      // Recalculate product rating stats
      const reviews = await Review.find({
        product: item.product,
        isApproved: true,
        isDeleted: false,
      });

      const ratingCount = reviews.length;
      const averageRating =
        ratingCount > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
          : 0;

      await Product.findByIdAndUpdate(item.product, {
        averageRating: parseFloat(averageRating.toFixed(1)),
        ratingCount,
      });

      // Notify admins about new review
      await notifyAdmins(
        `New product review from ${req.user.name} for item in order #${orderId}`,
        "new_review",
        orderId
      );

      res.json({ msg: "Rating submitted successfully" });
    } catch (error) {
      console.error("Rate item error:", error);
      res.status(500).json({ msg: "Server error" });
    }
  });

  // Scratch Card Reveal and Credit Wallet
  router.post("/scratch-card", authMiddleware, async (req, res) => {
    const { orderId } = req.body;

    try {
      const order = await Order.findOne({ _id: orderId, user: req.user._id });
      if (!order) return res.status(404).json({ msg: "Order not found" });

      if (order.scratchCardOffer === null || order.scratchCardOffer === undefined) {
        return res.status(400).json({ msg: "No scratch card offer for this order" });
      }

      if (order.scratchCardRevealed) {
        return res.status(400).json({ msg: "Scratch card already revealed" });
      }

      // Mark as revealed and credit wallet
      order.scratchCardRevealed = true;
      await order.save();

      const user = await User.findById(req.user._id);
      user.walletBalance += order.scratchCardOffer;
      await user.save();

      // Emit real-time update to the user
      io.to(req.user._id.toString()).emit('walletUpdated', { balance: user.walletBalance });

      res.json({
        msg: "Scratch card revealed!",
        amount: order.scratchCardOffer,
        newBalance: user.walletBalance
      });
    } catch (error) {
      console.error("Scratch card error:", error);
      res.status(500).json({ msg: "Server error" });
    }
  });

  // Get User's Unrevealed Scratch Cards
  router.get("/my-scratchcards", authMiddleware, async (req, res) => {
    try {
      const orders = await Order.find({
        user: req.user._id,
        scratchCardOffer: { $ne: null }
      }).sort({ createdAt: -1 });
      res.json(orders);
    } catch (error) {
      console.error("Get scratchcards error:", error);
      res.status(500).json({ msg: "Server error" });
    }
  });

  return router;
};
