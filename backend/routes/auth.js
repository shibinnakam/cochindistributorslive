const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sgMail = require("@sendgrid/mail");
const passport = require("passport");
const Staff = require("../models/Staff");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}


// Google OAuth setup only if environment variables are properly set
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID.trim() !== '' && process.env.GOOGLE_CLIENT_SECRET.trim() !== '') {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value.toLowerCase();

          // 1️⃣ Check if this email exists in Staff collection
          let staff = await Staff.findOne({ email });
          if (staff) {
            // If staff account found → treat as staff
            return done(null, {
              _id: staff._id,
              email: staff.email,
              role: "staff",
              name: staff.name || profile.displayName,
            });
          }

          // 2️⃣ Otherwise, check in User collection
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            user = await User.findOne({ email });
          }

          // If no user exists → create new user
          if (!user) {
            user = new User({
              googleId: profile.id,
              email,
              role: "user",
            });
            await user.save();
          }

          return done(null, {
            _id: user._id,
            email: user.email,
            role: user.role || "user",
            name: profile.displayName,
          });
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}


// Validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Token generation helpers
const generateTokens = (id, role) => {
  const accessToken = jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET || "refresh_secret_keys_123", {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

// Middleware: Authenticate JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid or expired token", expired: true });
  }
};

// Middleware: Check admin role
const adminMiddleware = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ msg: "Access denied. Admins only." });
};

/**
 * 📌 REGISTER
 */
router.post("/register", async (req, res) => {
  let { email, password } = req.body;
  email = email?.trim().toLowerCase();

  try {
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        msg: "Password must be at least 8 characters long and contain uppercase, lowercase, number & special character.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role: "user" });
    await newUser.save();

    // Send welcome email (non-blocking)
    sgMail
      .send({
        to: email,
        from: process.env.FROM_EMAIL,
        subject: "Welcome to Our Service!",
        html: `<p>Hello,</p><p>Thank you for registering with us.</p><p>Best regards,<br/>Your Company Team</p>`,
      })
      .catch((err) => console.error("Email send error:", err));

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
  let { email, password } = req.body;
  email = email?.trim().toLowerCase();

  try {
    // 1️⃣ Check User collection first
    let user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Invalid email or password" });

      const role = user.role || "user";
      const { accessToken, refreshToken } = generateTokens(user._id, role);

      // Save refresh token to user
      user.refreshTokens = user.refreshTokens || [];
      user.refreshTokens.push(refreshToken);
      await user.save();

      // Set cookie for refresh token
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.json({
        msg: `${role} login successful`,
        token: accessToken,
        user: { id: user._id, email: user.email, role },
        redirect: role === "admin" ? "/admin" : "/user",
      });
    }

    // 2️⃣ If not found in User → Check Staff collection
    const staff = await Staff.findOne({ email });
    if (!staff)
      return res.status(400).json({ msg: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid email or password" });

    if (staff.status !== "active") {
      return res
        .status(403)
        .json({ msg: "Your account is not active. Contact admin." });
    }

    const { accessToken, refreshToken } = generateTokens(staff._id, "staff");

    // Save refresh token to staff
    staff.refreshTokens = staff.refreshTokens || [];
    staff.refreshTokens.push(refreshToken);
    await staff.save();

    // Set cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      msg: "Staff login successful",
      token: accessToken,
      user: {
        id: staff._id,
        email: staff.email,
        role: "staff",
        name: staff.name,
      },
      redirect: "/staff",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error during login" });
  }
});

/**
 * 📌 REFRESH TOKEN
 */
router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ msg: "No refresh token" });

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "refresh_secret_keys_123"
    );

    // Check if token exists in either User or Staff
    let account = await User.findById(decoded.id);
    if (!account) {
      account = await Staff.findById(decoded.id);
    }

    if (!account || !account.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ msg: "Invalid refresh token" });
    }

    // Issue new access token
    const newAccessToken = jwt.sign(
      { id: account._id, role: account.role || "user" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ token: newAccessToken });
  } catch (err) {
    res.status(403).json({ msg: "Refresh token expired or invalid" });
  }
});

/**
 * 📌 LOGOUT
 */
router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || "refresh_secret_keys_123"
      );
      // Remove token from User or Staff
      await User.findByIdAndUpdate(decoded.id, {
        $pull: { refreshTokens: refreshToken },
      });
      await Staff.findByIdAndUpdate(decoded.id, {
        $pull: { refreshTokens: refreshToken },
      });
    } catch (err) {
      // Ignore token decoding errors on logout
    }
  }

  res.clearCookie("refreshToken");
  res.json({ msg: "Logged out successfully" });
});



/**
 * 📌 FORGOT PASSWORD
 */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
      await user.save();

      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;


      sgMail.send({
        to: email,
        from: process.env.FROM_EMAIL,
        subject: "Password Reset Request",
        html: `<p>You requested a password reset.</p>
               <p>Click here: <a href="${resetUrl}">${resetUrl}</a></p>
               <p>This link will expire in 15 minutes.</p>`,
      }).catch(err => console.error("Email send error:", err));
    }

    res.json({
      msg: "If that email is registered, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ msg: "Server error during forgot password" });
  }
});

/**
 * 📌 PROFILE (protected)
 */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const userObj = user.toObject();
    const hasPassword = !!user.password;
    delete userObj.password;

    res.json({ user: { ...userObj, hasPassword } });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ msg: "Error fetching profile" });
  }
});

/**
 * 📌 UPDATE PROFILE
 */
router.put("/profile", authMiddleware, async (req, res) => {
  const { name, phone, storeName, storeAddress, pincode, landmark } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (storeName) user.storeName = storeName;
    if (storeAddress) user.storeAddress = storeAddress;
    if (pincode) user.pincode = pincode;
    if (landmark) user.landmark = landmark;

    await user.save();
    res.json({ msg: "Profile updated successfully", user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ msg: "Server error updating profile" });
  }
});

/**
 * 📌 CHANGE PASSWORD (Authenticated)
 */
router.post("/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // If user has a password (not just Google login), verify it
    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ msg: "Current password is required" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Incorrect current password" });
      }
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        msg: "Password must be at least 8 characters, contain uppercase, lowercase, number & special character.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ msg: "Server error changing password" });
  }
});

router.post("/register-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }

    // Check if already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // Generate password setup token (store only in email link)
    const resetToken = crypto.randomBytes(32).toString("hex");

    const link = `${process.env.CLIENT_URL}/set-password/${resetToken}?email=${encodeURIComponent(email)}`;


    // Optionally: store this token in a temporary in-memory object or Redis with expiration
    // For now: just send the email
    await sgMail.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: "Set Your Password",
      html: `
        <h3>Welcome!</h3>
        <p>Click below to set your password:</p>
        <p><a href="${link}">${link}</a></p>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    res.json({ msg: "Password setup link sent to email." });
  } catch (err) {
    console.error("Error in /register-email:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/**
 * 📌 CREATE STAFF (admin only)
 */
router.post("/create-staff", authMiddleware, adminMiddleware, async (req, res) => {
  let { email, password } = req.body;
  email = email?.trim().toLowerCase();

  try {
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        msg: "Password must meet the security requirements.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const staffUser = new User({ email, password: hashedPassword, role: "staff" });
    await staffUser.save();

    res.status(201).json({ msg: "Staff user created successfully" });
  } catch (err) {
    console.error("Create staff error:", err);
    res.status(500).json({ msg: "Server error creating staff" });
  }
});
/**
 * 📌 SET PASSWORD (first time setup, not reset)
 */
router.post("/set-password", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        msg: "Password must be at least 8 characters, contain uppercase, lowercase, number & special character.",
      });
    }

    // Find user by email
    let user = await User.findOne({ email });

    if (!user) {
      // If user does not exist, create it now
      user = new User({ email });
    }

    // Overwrite password without error even if already set
    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ msg: "Password set successfully. You can now log in." });
  } catch (err) {
    console.error("Set password error:", err);
    res.status(500).json({ msg: "Server error during password setup" });
  }
});

router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  async (req, res) => {
    const { accessToken, refreshToken } = generateTokens(req.user._id, req.user.role);

    // Save refresh token to User or Staff
    if (req.user.role === "staff") {
      await Staff.findByIdAndUpdate(req.user._id, { $push: { refreshTokens: refreshToken } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $push: { refreshTokens: refreshToken } });
    }

    // Set cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect based on role
    let redirectPath = "/user";
    if (req.user.role === "staff") redirectPath = "/staff";
    if (req.user.role === "admin") redirectPath = "/admin";

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";
    res.redirect(
      `${FRONTEND_URL}/google-success?token=${accessToken}&user=${encodeURIComponent(
        JSON.stringify(req.user)
      )}&redirect=${redirectPath}`
    );
  }
);

/**
 * 📌 RESET PASSWORD
 */
router.post("/reset-password", async (req, res) => {

  const { token, email, password } = req.body;

  try {
    if (!token || !email) {
      return res.status(400).json({ msg: "Token and email are required" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        msg: "Password must be at least 8 characters, contain uppercase, lowercase, number & special char",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Verify token matches hashed token in DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    if (
      user.resetPasswordToken !== hashedToken ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    // Hash new password & save
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ msg: "Server error during password reset" });
  }
});
/**
 * 📌 VERIFY TOKEN (check if token is valid)
 */
router.get("/verify", authMiddleware, async (req, res) => {
  try {
    // If we reach here, token is valid (authMiddleware passed)
    // Try to find user in User collection
    let account = await User.findById(req.user.id).select("-password");

    // If not found, try in Staff collection
    if (!account) {
      account = await Staff.findById(req.user.id).select("-password");
    }

    if (!account) {
      return res.status(401).json({ msg: "Account not found" });
    }

    res.json({
      valid: true,
      user: {
        id: account._id,
        email: account.email,
        role: account.role || "user",
        name: account.name,
      }
    });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ msg: "Server error during verification" });
  }
});

/**
 * 📌 CREATE ADMIN (one-time setup via Postman)
 */
router.post("/create-admin", async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    // check if already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ msg: "Admin already exists with this email" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new admin
    const adminUser = new User({
      email,
      password: hashedPassword,
      role: "admin",   // ✅ force role = admin
    });

    await adminUser.save();

    res.status(201).json({ msg: "Admin created successfully", adminId: adminUser._id });
  } catch (err) {
    console.error("Create admin error:", err);
    res.status(500).json({ msg: "Server error while creating admin" });
  }
});




module.exports = router;
