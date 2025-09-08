const express = require("express");
const router = express.Router();
const Leave = require("../models/Leave");
// ----------------------------
// Staff requests leave
// ----------------------------
router.post("/request", async (req, res) => {
  try {
    const { email, date, reason } = req.body;

    if (!email || !date || !reason)
      return res.status(400).json({ error: "All fields are required" });

    const leave = new Leave({
      email,
      date,       // store the single leave date
      reason,
      status: "Pending", // default status
    });

    await leave.save();
    res.status(201).json({ message: "Leave request submitted" });
  } catch (err) {
    console.error("Error saving leave:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------------
// Get leave status for a staff
// ----------------------------
router.get("/my", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const leaves = await Leave.find({ email }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error("Error fetching leave status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------------
// Admin: get all leaves
// ----------------------------
router.get("/all", async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error("Error fetching all leaves:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------------
// Admin: update leave status
// ----------------------------
router.patch("/update/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Approved", "Rejected", "Pending"].includes(status))
      return res.status(400).json({ error: "Invalid status" });

    let updateData = { status };

    if (status === "Approved") {
      updateData.approvedDate = new Date();
      updateData.rejectedDate = null; // clear rejected date if re-approved
    } else if (status === "Rejected") {
      updateData.rejectedDate = new Date();
      updateData.approvedDate = null; // clear approved date if re-rejected
    } else if (status === "Pending") {
      updateData.approvedDate = null;
      updateData.rejectedDate = null;
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!leave) return res.status(404).json({ error: "Leave not found" });

    res.json(leave);
  } catch (err) {
    console.error("Error updating leave status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a leave
router.delete("/delete/:id", async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) return res.status(404).json({ error: "Leave not found" });
    res.json({ message: "Leave deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;


// ----------------------------
// Get leave status for a staff
// ----------------------------
router.get("/my", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const leaves = await Leave.find({ email }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error("Error fetching leave status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------------
// Admin: get all leaves
// ----------------------------
router.get("/all", async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error("Error fetching all leaves:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------------
// Admin: update leave status
// ----------------------------
router.patch("/update/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Approved", "Rejected", "Pending"].includes(status))
      return res.status(400).json({ error: "Invalid status" });

    let updateData = { status };

    if (status === "Approved") {
      updateData.approvedDate = new Date();
      updateData.rejectedDate = null; // clear rejected date if re-approved
    } else if (status === "Rejected") {
      updateData.rejectedDate = new Date();
      updateData.approvedDate = null; // clear approved date if re-rejected
    } else if (status === "Pending") {
      updateData.approvedDate = null;
      updateData.rejectedDate = null;
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!leave) return res.status(404).json({ error: "Leave not found" });

    res.json(leave);
  } catch (err) {
    console.error("Error updating leave status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a leave
router.delete("/delete/:id", async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) return res.status(404).json({ error: "Leave not found" });
    res.json({ message: "Leave deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
