const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * 📌 REGISTER
 */
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        msg:
          "Password must be at least 8 characters, contain uppercase, lowercase, number & special char",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role: "user" });
    await newUser.save();

    // Send welcome email
    await sgMail.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: "Welcome to Our Service!",
      html: `<p>Hello,</p><p>Thank you for registering with us.</p><p>Best regards,<br/>Your Company Team</p>`,
    });

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ msg: "Server error during registration" });
  }
});

/**
 * 📌 LOGIN
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Send login success message with user role
    res.json({
      msg: "Login successful",
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error during login" });
  }
});

/**
 * 📌 FORGOT PASSWORD
 */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    // Always return success message to avoid exposing valid emails
    if (!user) {
      return res.json({
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    // Generate and hash token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Save hashed token and expiry to DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // Send email with reset link
    await sgMail.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click here to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });

    res.json({
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ msg: "Server error during forgot password" });
  }
});

/**
 * Middleware placeholders (you need to implement these somewhere)
 */
const authMiddleware = (req, res, next) => {
  // Your middleware logic here to verify JWT token and attach user to req.user
  next();
};

const adminMiddleware = (req, res, next) => {
  // Check if req.user.role === 'admin'
  if (req.user && req.user.role === "admin") next();
  else res.status(403).json({ msg: "Access denied. Admins only." });
};

/**
 * 📌 PROFILE (protected route example)
 */
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

/**
 * 📌 CREATE STAFF (admin only)
 */
router.post("/create-staff", authMiddleware, adminMiddleware, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Email and password are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ msg: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const staffUser = new User({ email, password: hashedPassword, role: "staff" });
  await staffUser.save();

  res.status(201).json({ msg: "Staff user created successfully" });
});

/**
 * 📌 RESET PASSWORD
 */
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  try {
    if (!token) {
      return res.status(400).json({ msg: "Token is missing" });
    }
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        msg:
          "Password must be at least 8 characters, contain uppercase, lowercase, number & special char",
      });
    }

    // Hash token and find matching user
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    // Update password and clear reset fields
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ msg: "Server error during reset password" });
  }
});

module.exports = router;
