const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Staff = require("../models/Staff");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

// Configure Multer for image storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/attendance";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + ".jpg");
    },
});

const upload = multer({ storage: storage });

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

            // Check if today is Sunday (Holiday)
            const now = new Date();
            const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
            if (ist.getDay() === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Attendance cannot be recorded on Sundays (Holiday)."
                });
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

                // --- AI ANOMALY DETECTION START ---
                // Feature Vector: x = [d, a, i, s] per Research Paper Equations (6)-(9)
                try {
                    // 1. Extract Behavioral Features
                    const inTime = new Date(record.inTime);
                    const outTime = new Date(record.outTime);
                    const durationMs = outTime - inTime;
                    const durationMinutes = Math.floor(durationMs / 60000);

                    // Eq(7): Arrival deviation from 9:00 AM standard (in minutes)
                    const nineAM = new Date(inTime);
                    nineAM.setHours(9, 0, 0, 0);
                    const arrivalDeviation = Math.abs(Math.floor((inTime - nineAM) / 60000));

                    // Eq(8)-(9): Compute REAL historical features from past records
                    // Get this staff's attendance from the past 30 days
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    const pastDateStr = thirtyDaysAgo.toISOString().split("T")[0];

                    const historyRecords = await Attendance.find({
                        staffId: staff._id,
                        date: { $gte: pastDateStr, $lt: today },
                        outTime: { $ne: null }
                    }).sort({ date: -1 });

                    // shortStayCount: number of days with duration < 15 min in past 30 days
                    // Paper Eq(9): s = 1[d < 15] — we count total occurrences
                    let shortStayCount = 0;
                    const scanDates = [];
                    for (const pastRec of historyRecords) {
                        if (pastRec.inTime && pastRec.outTime) {
                            const pastDuration = Math.floor((new Date(pastRec.outTime) - new Date(pastRec.inTime)) / 60000);
                            if (pastDuration < 15) {
                                shortStayCount++;
                            }
                            scanDates.push(new Date(pastRec.date));
                        }
                    }
                    // Include current session if it's also a short stay
                    if (durationMinutes < 15) {
                        shortStayCount++;
                    }

                    // scanInterval: average days between consecutive attendance scans
                    // Paper Eq(8): i = scan interval (consistency measure)
                    let scanInterval = 0;
                    if (scanDates.length >= 2) {
                        let totalGapDays = 0;
                        for (let g = 0; g < scanDates.length - 1; g++) {
                            const gapMs = Math.abs(scanDates[g] - scanDates[g + 1]);
                            totalGapDays += gapMs / (1000 * 60 * 60 * 24);
                        }
                        scanInterval = Math.round(totalGapDays / (scanDates.length - 1));
                    }

                    const features = {
                        duration_minutes: durationMinutes,
                        arrival_deviation: arrivalDeviation,
                        scan_interval: scanInterval,
                        short_stay_count: shortStayCount
                    };

                    record.features = {
                        durationMinutes,
                        arrivalDeviation,
                        scanInterval,
                        shortStayCount
                    };

                    // 2. Call Python AI Microservice
                    const axios = require("axios");
                    const PYTHON_AI_URL = process.env.PYTHON_AI_SERVICE_URL || "http://localhost:5001/analyze";

                    // Send current + historical features for better ML analysis
                    const allFeatures = [features];
                    // Add recent history for batch ML if available (>= 5 for Isolation Forest)
                    for (const pastRec of historyRecords.slice(0, 19)) {
                        if (pastRec.features && pastRec.features.durationMinutes !== undefined) {
                            allFeatures.push({
                                duration_minutes: pastRec.features.durationMinutes,
                                arrival_deviation: pastRec.features.arrivalDeviation || 0,
                                scan_interval: pastRec.features.scanInterval || 0,
                                short_stay_count: pastRec.features.shortStayCount || 0
                            });
                        }
                    }

                    const aiResponse = await axios.post(PYTHON_AI_URL, {
                        features: allFeatures
                    });

                    if (aiResponse.data && aiResponse.data.success && aiResponse.data.results.length > 0) {
                        // First result is for the current record
                        const result = aiResponse.data.results[0];
                        record.anomalyScore = result.score;
                        record.anomalyStatus = result.status;
                    }
                } catch (aiErr) {
                    console.error("AI Anomaly Detection Error:", aiErr.message);
                    // FALLBACK: Rule-based anomaly detection if Python AI is unavailable
                    // Matches paper's classification rule Eq(5) with threshold τ = 70%
                    const inT = new Date(record.inTime);
                    const outT = new Date(record.outTime);
                    const durMs = outT - inT;
                    const durMin = Math.floor(durMs / 60000);

                    let fallbackScore = 0;
                    // Proxy attendance / scan & leave
                    if (durMin < 5) {
                        fallbackScore = 90;
                    } else if (durMin < 15) {
                        fallbackScore = 80;
                    } else if (durMin < 30) {
                        fallbackScore = 65;
                    } else if (durMin < 120) {
                        fallbackScore = 40;
                    }

                    // Late arrival check
                    const nineAMFb = new Date(inT);
                    nineAMFb.setHours(9, 0, 0, 0);
                    const arrDevFb = Math.abs(Math.floor((inT - nineAMFb) / 60000));
                    if (arrDevFb > 180) {
                        fallbackScore = Math.max(fallbackScore, 60);
                    }

                    // Apply threshold τ = 70%
                    if (fallbackScore > 70) {
                        record.anomalyScore = fallbackScore;
                        record.anomalyStatus = "Suspicious";
                    } else {
                        record.anomalyScore = fallbackScore;
                        record.anomalyStatus = "Normal";
                    }
                }
                // --- AI ANOMALY DETECTION END ---

                await record.save();

                // Emit Socket Event
                if (io) {
                    io.to("admin").emit("attendanceUpdate", {
                        action: "checkout",
                        record,
                        alert: record.anomalyStatus === "Suspicious"
                    });
                }

                return res.json({
                    success: true,
                    action: "checkout",
                    message: `Goodbye ${staff.name || "Staff"}! Working hours: ${record.workingHours}${record.anomalyStatus === "Suspicious" ? " (Suspicious activity detected)" : ""}`,
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

    // POST /api/attendance/upload-image
    // Called by ESP32-CAM with { rfidUid: "ABCD1234", image: [file] }
    router.post("/upload-image", upload.single("image"), async (req, res) => {
        try {
            const { rfidUid } = req.body;
            if (!rfidUid || !req.file) {
                return res.status(400).json({ success: false, message: "rfidUid and image are required" });
            }

            const staff = await Staff.findOne({ rfidUid: rfidUid.toUpperCase() });
            if (!staff) {
                return res.status(404).json({ success: false, message: "Staff not found" });
            }

            const today = todayIST();
            const record = await Attendance.findOne({ staffId: staff._id, date: today });
            if (!record) {
                return res.status(404).json({ success: false, message: "Attendance record not found for today" });
            }

            const imagePath = `/uploads/attendance/${req.file.filename}`;

            // Determine if it's check-in or check-out
            if (!record.checkInImage) {
                record.checkInImage = imagePath;
            } else {
                record.checkOutImage = imagePath;
            }

            // Trigger Facial Verification if staff has a profile photo
            if (staff.profilePhoto) {
                try {
                    const PYTHON_AI_URL = process.env.PYTHON_AI_SERVICE_URL || "http://localhost:5001";
                    const verifyResponse = await axios.post(`${PYTHON_AI_URL}/verify-face`, {
                        capturedImage: imagePath,
                        registeredImage: staff.profilePhoto
                    });

                    if (verifyResponse.data && verifyResponse.data.success) {
                        record.isFaceVerified = verifyResponse.data.isVerified;
                        record.faceScore = verifyResponse.data.score;
                    }
                } catch (aiErr) {
                    console.error("Facial verification AI error:", aiErr.message);
                }
            }

            await record.save();

            // Emit update to admin
            if (io) {
                io.to("admin").emit("attendanceUpdate", { action: "imageUpload", record });
            }

            res.json({ success: true, message: "Image uploaded and verified", record });
        } catch (err) {
            console.error("Image upload error:", err);
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
