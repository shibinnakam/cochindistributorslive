const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

// Middleware to authenticate user
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

// Get Cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user.cart);
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Add to Cart
router.post('/add', authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = quantity || 1;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    // Check if product already in cart
    const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

    let currentQuantity = 0;
    if (cartItemIndex > -1) {
      currentQuantity = user.cart[cartItemIndex].quantity;
    }

    const newQuantity = currentQuantity + qty;

    // Check stock availability
    if (newQuantity > product.quantity) {
      return res.status(400).json({ msg: "No item left" });
    }

    if (newQuantity < 1) {
       return res.status(400).json({ msg: "Quantity cannot be less than 1" });
    }

    if (cartItemIndex > -1) {
      // Update quantity
      user.cart[cartItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      user.cart.push({ product: productId, quantity: qty });
    }

    await user.save();
    // Populate product details for the response so frontend can update UI immediately
    await user.populate('cart.product');
    
    res.json({ msg: "Cart updated", cart: user.cart });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Remove from Cart
router.delete('/remove/:productId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.cart = user.cart.filter(item => item.product.toString() !== req.params.productId);
    await user.save();
    
    res.json({ msg: "Product removed from cart", cart: user.cart });
  } catch (err) {
    console.error("Remove from cart error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
