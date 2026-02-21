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

    // GET /api/attendance/analysis?month=YYYY-MM
    router.get("/analysis", async (req, res) => {
        try {
            const { month } = req.query; // e.g. "2026-02"
            if (!month) {
                return res.status(400).json({ success: false, message: "Month (YYYY-MM) is required" });
            }

            const staffList = await Staff.find({}).select("name position rfidUid");

            // Get all attendance for the specified month
            // Date format in DB is "YYYY-MM-DD"
            const regex = new RegExp(`^${month}`);
            const records = await Attendance.find({ date: regex });

            // Generate list of days in that month
            const year = parseInt(month.split("-")[0]);
            const mon = parseInt(month.split("-")[1]);
            const lastDay = new Date(year, mon, 0).getDate();
            const daysList = [];
            for (let d = 1; d <= lastDay; d++) {
                daysList.push(`${month}-${d.toString().padStart(2, "0")}`);
            }

            const data = {};
            const summaries = {};

            // Initialize data structure
            staffList.forEach(s => {
                data[s._id] = {};
                daysList.forEach(day => {
                    data[s._id][day] = { hours: 0, present: false };
                });
                summaries[s._id] = { totalMonthlyHours: 0, totalMs: 0 };
            });

            // Populate data
            records.forEach(r => {
                if (data[r.staffId] && data[r.staffId][r.date]) {
                    let h = 0;
                    let ms = 0;
                    if (r.inTime && r.outTime) {
                        ms = new Date(r.outTime) - new Date(r.inTime);
                        if (ms < 0) ms = 0;
                        h = ms / (1000 * 60 * 60);
                    } else if (r.workingHours) {
                        // Fallback for older records or if only workingHours exists
                        const match = r.workingHours.match(/(\d+)h\s*(\d+)m/);
                        if (match) {
                            h = parseInt(match[1]) + parseInt(match[2]) / 60;
                            ms = h * 60 * 60 * 1000;
                        }
                    }
                    data[r.staffId][r.date] = { hours: parseFloat(h.toFixed(4)), present: true };
                    summaries[r.staffId].totalMs += ms;
                    summaries[r.staffId].totalMonthlyHours += h;
                }
            });

            // Final formatting for summaries
            Object.keys(summaries).forEach(sid => {
                summaries[sid].totalMonthlyHours = parseFloat(summaries[sid].totalMonthlyHours.toFixed(4));
            });

            res.json({
                success: true,
                staff: staffList,
                days: daysList,
                data,
                summaries
            });
        } catch (err) {
            console.error("Attendance analysis error:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    return router;
};
