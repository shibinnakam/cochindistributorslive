const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header (format: Bearer token)
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify token and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by decoded ID, exclude password
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    // Attach user object to request for downstream handlers
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

// Middleware to restrict routes to admin users only
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ msg: "Admin access required" });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
