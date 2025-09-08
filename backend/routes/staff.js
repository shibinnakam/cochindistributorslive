const express = require("express");
const router = express.Router();
const Staff = require("../models/Staff");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const { authMiddleware } = require("../middleware/auth");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/staff"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + file.fieldname + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error("Only .jpg, .jpeg, .png files are allowed"));
  },
});

// Admin invites staff
router.post("/invite", async (req, res) => {
  try {
    const { email, invitedBy } = req.body;

    // Check if the email is already a registered user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered as a user. Please contact the Person."
      });
    }

    // Check if the email is already in Staff
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: "Staff already exists with this email."
      });
    }

    // Create new Staff invitation
    const staff = new Staff({ email, invitedBy });
    await staff.save();

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "2d" });
    const link = `${process.env.CLIENT_URL}/staff/staffregister?token=${token}`;

    const msg = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: "Staff Invitation",
      html: `
        <h2>Welcome!</h2>
        <p>Please complete your registration:</p>
        <a href="${link}" style="padding:10px 20px; background:#007BFF; color:white; text-decoration:none; border-radius:5px;">
          Complete Registration
        </a>
      `,
    };

    await sgMail.send(msg);

    res.json({ success: true, message: "Invitation sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});
// Staff registration (with photo upload)
router.post("/register", upload.single("profilePhoto"), async (req, res) => {
  try {
    const { token, name, address, phone, password, gender, pincode } = req.body;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Invalid or expired link" });
    }

    const staff = await Staff.findOne({ email: decoded.email });
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    // Prevent reuse if already registered
    if (staff.isRegistered) {
      return res.status(400).json({
        alreadySubmitted: true,
        message: "You have already submitted your registration",
      });
    }

    // ===== VALIDATIONS =====
    // Name: letters & spaces, 3–50 chars
    if (!name || !/^[a-zA-Z ]{3,50}$/.test(name))
      return res.status(400).json({ message: "Name must be 3–50 letters only" });

    // Address: 5–100 chars
    if (!address || address.length < 5 || address.length > 100)
      return res.status(400).json({ message: "Address must be 5–100 characters" });

    // Phone: Indian format, 10 digits, starts with 6-9
    if (!/^[6-9]\d{9}$/.test(phone))
      return res.status(400).json({ message: "Invalid Indian phone number" });

    // Pincode: Indian 6-digit, first digit 1–9
    if (!/^[1-9][0-9]{5}$/.test(pincode))
      return res.status(400).json({ message: "Invalid Indian pincode" });

    // Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!password || !passwordRegex.test(password))
      return res.status(400).json({
        message:
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
      });

    // Profile photo already validated via Multer (jpeg, jpg, png, max 2MB)

    // ===== SAVE STAFF =====
    const hashedPassword = await bcrypt.hash(password, 10);
    staff.name = name;
    staff.address = address;
    staff.phone = phone;
    staff.password = hashedPassword;
    staff.gender = gender;
    staff.pincode = pincode;
    if (req.file) staff.profilePhoto = `/uploads/staff/${req.file.filename}`;
    staff.status = "pending";
    staff.isRegistered = true; // token now invalid
    await staff.save();

    res.json({
      success: true,
      message: "Registration submitted, awaiting admin approval",
      redirect: "/check-mail",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// Check if token/staff already submitted
router.post("/check-submitted", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const staff = await Staff.findOne({ email: decoded.email });
    if (!staff) return res.json({ submitted: false });

    res.json({ submitted: !!staff.isRegistered });
  } catch {
    res.json({ submitted: false });
  }
});

// Admin approves staff
// Admin approves staff
router.put("/approve/:id", async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    // Safe destructuring
    const { joiningDate } = req.body || {};

    staff.status = "active";
    staff.role = "staff";
    staff.dateOfJoining = joiningDate ? new Date(joiningDate) : new Date();

    await staff.save();

    // Try sending email, but don't fail approval if email fails
    try {
      const msg = {
        to: staff.email,
        from: process.env.FROM_EMAIL,
        subject: "Congratulations! Your application is approved",
        html: `
          <h2>Congratulations ${staff.name || ""}!</h2>
          <p>You are appointed as a worker at <strong>Cochin Distributors, Kattappana</strong>.</p>
          <p>You can use your registered email and password to log in and start working.</p>
          <p>Our company will contact you within one day.</p>
          <p>This is your official joining date: <strong>${staff.dateOfJoining.toDateString()}</strong></p>
          <br/>
          <p>Welcome aboard!</p>
          <p><strong>Cochin Distributors Team</strong></p>
        `,
      };
      await sgMail.send(msg);
    } catch (emailErr) {
      console.error("Email failed: ", emailErr.message);
    }

    res.json({
      success: true,
      message: "Staff approved successfully",
      staff,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to approve staff" });
  }
});



// Admin updates staff status
router.put("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "deactivated"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    staff.status = status;
    await staff.save();
    res.json({ success: true, message: `Staff ${status}`, staff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get logged-in staff profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.id).select("-password");
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile
router.put("/update", authMiddleware, upload.single("profilePhoto"), async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) updates.profilePhoto = `/uploads/staff/${req.file.filename}`;

    const staff = await Staff.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");

    res.json({ success: true, message: "Profile updated", staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all staff
router.get("/", async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json({ success: true, staff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});
// DELETE /api/staff/:id
router.delete("/:id", async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    await Staff.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Staff deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
