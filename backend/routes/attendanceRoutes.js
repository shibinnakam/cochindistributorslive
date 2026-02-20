const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Staff = require("../models/Staff");

// Helper: today's date string "YYYY-MM-DD" in IST
function todayIST() {
    const now = new Date();
    // UTC+5:30
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    return ist.toISOString().split("T")[0];
}

// Helper: format working duration
function calcWorkingHours(inTime, outTime) {
    const diffMs = new Date(outTime) - new Date(inTime);
    if (diffMs <= 0) return "0h 0m";
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
}

module.exports = (io) => {
    // POST /api/attendance/scan
    // Called by ESP8266 with { rfidUid: "ABCD1234" }
    router.post("/scan", async (req, res) => {
        try {
            const { rfidUid } = req.body;
            if (!rfidUid) {
                return res.status(400).json({ success: false, message: "rfidUid is required" });
            }

            // Find staff with this RFID
            const staff = await Staff.findOne({ rfidUid: rfidUid.toUpperCase() });
            if (!staff) {
                return res.status(404).json({ success: false, message: "No staff found with this RFID card" });
            }

            const today = todayIST();

            // Find today's attendance record for this staff
            let record = await Attendance.findOne({ staffId: staff._id, date: today });

            if (!record) {
                // First scan today → CHECK IN
                record = await Attendance.create({
                    staffId: staff._id,
                    rfidUid: staff.rfidUid,
                    staffName: staff.name || "",
                    position: staff.position || "",
                    date: today,
                    inTime: new Date(),
                    outTime: null,
                    workingHours: null,
                });

                // Emit Socket Event
                if (io) {
                    io.to("admin").emit("attendanceUpdate", { action: "checkin", record });
                }

                return res.json({
                    success: true,
                    action: "checkin",
                    message: `Welcome ${staff.name || "Staff"}! Check-in recorded.`,
                    record,
                });
            }

            if (record.inTime && !record.outTime) {
                // Second scan today → CHECK OUT
                record.outTime = new Date();
                record.workingHours = calcWorkingHours(record.inTime, record.outTime);
                await record.save();

                // Emit Socket Event
                if (io) {
                    io.to("admin").emit("attendanceUpdate", { action: "checkout", record });
                }

                return res.json({
                    success: true,
                    action: "checkout",
                    message: `Goodbye ${staff.name || "Staff"}! Working hours: ${record.workingHours}`,
                    record,
                });
            }

            // Already checked out
            return res.json({
                success: false,
                message: `Attendance already completed for today (${record.workingHours}).`,
                record,
            });
        } catch (err) {
            console.error("Attendance scan error:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // GET /api/attendance?date=YYYY-MM-DD
    router.get("/", async (req, res) => {
        try {
            const { date } = req.query;
            const filter = {};
            if (date) filter.date = date;

            const records = await Attendance.find(filter).sort({ date: -1, inTime: -1 });
            res.json({ success: true, records });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // GET /api/attendance/today
    router.get("/today", async (req, res) => {
        try {
            const today = todayIST();
            const records = await Attendance.find({ date: today }).sort({ inTime: -1 });
            res.json({ success: true, records, date: today });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    return router;
};
