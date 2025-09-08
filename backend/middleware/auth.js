const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Staff = require("../models/Staff");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find user in User collection
    let account = await User.findById(decoded.id).select("-password");

    // If not found, try in Staff collection
    if (!account) {
      account = await Staff.findById(decoded.id).select("-password");
    }

    if (!account) {
      return res.status(401).json({ msg: "Account not found" });
    }

    req.user = account;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ msg: "Admin access required" });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
