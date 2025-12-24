const express = require("express");
const router = express.Router();
const Staff = require("../models/Staff");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const PDFDocument = require("pdfkit");
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
    const { joiningDate, position, salary } = req.body || {};

    staff.status = "active";
    staff.role = "staff";
    staff.dateOfJoining = joiningDate ? new Date(joiningDate) : new Date();
    if (position) staff.position = position;
    if (salary) staff.salary = salary;

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

// Admin updates staff details (position, salary)
router.put("/update-details/:id", async (req, res) => {
  try {
    const { position, salary } = req.body;
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    if (position !== undefined) staff.position = position;
    if (salary !== undefined) staff.salary = salary;

    await staff.save();
    res.json({ success: true, message: "Staff details updated", staff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
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

// Resignation Request (Staff)
router.post("/resign", authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const staff = await Staff.findById(req.user.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    if (staff.resignationStatus === "pending") {
      return res.status(400).json({ message: "Resignation request already pending" });
    }

    staff.resignationStatus = "pending";
    staff.resignationDate = new Date();
    staff.resignationReason = reason;
    await staff.save();

    res.json({ success: true, message: "Resignation request submitted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Approve Resignation (Admin)
router.put("/resign/approve/:id", async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    const lastWorkingDay = new Date();
    staff.resignationStatus = "approved";
    staff.lastWorkingDay = lastWorkingDay;
    staff.status = "deactivated"; // User said consider it as last working day, so they are done.
    await staff.save();

    // Generate PDF
    const generatePDF = () => {
      return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        let buffers = [];
        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        // Logo
        const logoPath = path.join(__dirname, "../../frontend/src/assets/logo.jpeg");
        // PDFKit images use points. 30mm ~ 85pt, 25mm ~ 71pt.
        // Assuming page margin 50pt (default). 
        // Centering or positioning similar to frontend: x=34mm (96pt), y=13mm (37pt)
        try {
           doc.image(logoPath, 130, 40, { width: 85, height: 71 });
        } catch (e) {
           console.log("Logo not found or invalid", e);
        }

        doc.moveDown(4);
        
        // Header
        doc.fontSize(16).font("Helvetica-Bold").text("COCHIN DISTRIBUTORS", { align: "center" });
        doc.fontSize(11).font("Helvetica").text("Merchant Association Building,", { align: "center" });
        doc.text("Santhi Nagar, Kattappana", { align: "center" });
        doc.text("Ph: 9447419293, 9446074962", { align: "center" });
        
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(2);

        // Title
        doc.fontSize(22).font("Helvetica-Bold").text("Experience Certificate", { align: "center" });
        doc.moveDown(2);

        // Content Table (Manual construction for simple table)
        const startX = 100;
        let currentY = doc.y;
        const rowHeight = 30;
        const colWidth = 200;

        doc.fontSize(12).font("Helvetica");

        const drawRow = (label, value) => {
           doc.rect(startX, currentY, colWidth, rowHeight).stroke();
           doc.rect(startX + colWidth, currentY, colWidth, rowHeight).stroke();
           doc.text(label, startX + 10, currentY + 10);
           doc.text(value, startX + colWidth + 10, currentY + 10);
           currentY += rowHeight;
        };

        drawRow("Employee Name", staff.name);
        drawRow("Date of Joining", staff.dateOfJoining ? staff.dateOfJoining.toLocaleDateString() : "—");
        drawRow("Last Working Day", lastWorkingDay.toLocaleDateString());
        drawRow("Designation", staff.position || "Staff");

        doc.moveDown(3);
        currentY += 20;
        doc.y = currentY;

        // Certificate Text
        doc.font("Helvetica").fontSize(12);
        const text = `This is to certify that Mr./Ms. ${staff.name} has worked with Cochin Distributors from ${staff.dateOfJoining ? staff.dateOfJoining.toLocaleDateString() : ""} to ${lastWorkingDay.toLocaleDateString()}.`;
        doc.text(text, { align: "justify" });
        
        doc.moveDown();
        const genderText = staff.gender === "female" ? "her" : "him";
        doc.text(`We wish ${genderText} all the best for future endeavors.`, { align: "justify" });

        doc.moveDown(4);
        doc.text("Sincerely,");
        doc.moveDown();
        doc.text("Manager");
        doc.text("Cochin Distributors");

        doc.end();
      });
    };

    let pdfBuffer;
    try {
      pdfBuffer = await generatePDF();
    } catch (e) {
      console.error("PDF Generation failed", e);
    }

    // Send Email
    try {
      const msg = {
        to: staff.email,
        from: process.env.FROM_EMAIL,
        subject: "Resignation Request Approved - Experience Certificate",
        html: `
          <h2>Resignation Approved</h2>
          <p>Dear ${staff.name},</p>
          <p>Your resignation request has been approved.</p>
          <p>Your last working day is: <strong>${lastWorkingDay.toLocaleDateString()}</strong></p>
          <p>Please find your Experience Certificate attached.</p>
          <br/>
          <p>Thank you for your service.</p>
          <p><strong>Cochin Distributors Team</strong></p>
        `,
        attachments: pdfBuffer ? [
          {
            content: pdfBuffer.toString("base64"),
            filename: `${staff.name.replace(/\s+/g, "_")}_Experience_Certificate.pdf`,
            type: "application/pdf",
            disposition: "attachment",
          },
        ] : [],
      };
      await sgMail.send(msg);
    } catch (emailErr) {
      console.error("Email failed: ", emailErr.message);
    }

    res.json({ success: true, message: "Resignation approved", staff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reject Resignation (Admin)
router.put("/resign/reject/:id", async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    staff.resignationStatus = "rejected";
    await staff.save();

    res.json({ success: true, message: "Resignation rejected", staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
