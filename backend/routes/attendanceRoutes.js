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

// Queue for camera triggers (UID: timestamp)
const pendingTriggers = {};

// Global scan history for burst detection (Proxy Detection)
let globalScanHistory = [];
const BURST_WINDOW_MS = 60000; // 60 seconds
let lastScanTimestamp = Date.now();

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

// Helper: robustly get AI service base URL
function getAiBaseUrl() {
    // 1. Check for manual override in environment
    let url = process.env.PYTHON_AI_SERVICE_URL;

    // 2. Fallback to Internal Render URL (More reliable for inter-service communication)
    // Format: http://<service-name>:<port>
    if (!url || url.includes("localhost")) {
        url = "http://distribution-agency-ai:10000";
    }

    // Clean the URL
    return url.replace(/\/analyze$/, "").replace(/\/$/, "");
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
                // Feature Vector: x = [d, a, i, s, t, f] per Research Paper
                try {
                    // 1. Extract Behavioral Features
                    const inTime = new Date(record.inTime);
                    const outTime = new Date(record.outTime);
                    const durationMs = outTime - inTime;
                    const durationMinutes = Math.floor(durationMs / 60000);

                    // Eq(7): Arrival deviation from 8:30 AM standard (in minutes)
                    const eightThirtyAM = new Date(inTime);
                    eightThirtyAM.setHours(8, 30, 0, 0);
                    const arrivalDeviation = Math.abs(Math.floor((inTime - eightThirtyAM) / 60000));

                    // Eq(8)-(9): Compute REAL historical features from past records
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    const pastDateStr = thirtyDaysAgo.toISOString().split("T")[0];

                    const historyRecords = await Attendance.find({
                        staffId: staff._id,
                        date: { $gte: pastDateStr, $lt: today },
                        outTime: { $ne: null }
                    }).sort({ date: -1 });

                    // --- NEW PROXY DETECTION FEATURES ---
                    // 1. Inter-Arrival Time (ms since last scan at this reader)
                    const interArrivalTime = Date.now() - lastScanTimestamp;
                    lastScanTimestamp = Date.now();

                    // 2. Frequency Score (unique cards in last 60s)
                    const nowMs = Date.now();
                    globalScanHistory.push({ timestamp: nowMs, rfidUid: staff.rfidUid });
                    globalScanHistory = globalScanHistory.filter(s => (nowMs - s.timestamp) < BURST_WINDOW_MS);
                    const uniqueUids = new Set(globalScanHistory.map(s => s.rfidUid));
                    const frequencyScore = uniqueUids.size;

                    // shortStayCount: number of days with duration < 15 min
                    let shortStayCount = 0;
                    const scanDates = [];
                    for (const pastRec of historyRecords) {
                        if (pastRec.inTime && pastRec.outTime) {
                            const pastDuration = Math.floor((new Date(pastRec.outTime) - new Date(pastRec.inTime)) / 60000);
                            if (pastDuration < 15) shortStayCount++;
                            scanDates.push(new Date(pastRec.date));
                        }
                    }
                    if (durationMinutes < 15) shortStayCount++;

                    // scanInterval: average days between scans
                    let scanInterval = 0;
                    if (scanDates.length >= 2) {
                        let totalGapDays = 0;
                        for (let g = 0; g < scanDates.length - 1; g++) {
                            const gapMs = Math.abs(scanDates[g] - scanDates[g + 1]);
                            totalGapDays += gapMs / (1000 * 60 * 60 * 24);
                        }
                        scanInterval = Math.round(totalGapDays / (scanDates.length - 1));
                    }

                    const currentFeatures = {
                        duration_minutes: durationMinutes,
                        arrival_deviation: arrivalDeviation,
                        arrival_deviation_from_personal_avg: 0, // placeholder, will calculate
                        scan_interval: scanInterval,
                        short_stay_count: shortStayCount,
                        inter_arrival_time: interArrivalTime,
                        frequency_score: frequencyScore
                    };

                    // --- NEW: Calculate Personal Arrival Baseline ---
                    let totalArrivalMinutes = 0;
                    let validArrivals = 0;
                    for (const pastRec of historyRecords) {
                        if (pastRec.inTime) {
                            const pastIn = new Date(pastRec.inTime);
                            // Convert arrival time to minutes past midnight
                            totalArrivalMinutes += (pastIn.getHours() * 60) + pastIn.getMinutes();
                            validArrivals++;
                        }
                    }

                    if (validArrivals > 0) {
                        const avgArrivalMinutes = Math.round(totalArrivalMinutes / validArrivals);
                        const todayArrivalMinutes = (inTime.getHours() * 60) + inTime.getMinutes();
                        currentFeatures.arrival_deviation_from_personal_avg = Math.abs(todayArrivalMinutes - avgArrivalMinutes);
                    }

                    record.features = {
                        durationMinutes,
                        arrivalDeviation,
                        arrivalDeviationFromPersonalAvg: currentFeatures.arrival_deviation_from_personal_avg,
                        scanInterval,
                        shortStayCount,
                        interArrivalTime,
                        frequencyScore
                    };

                    // 2. Call Python AI Microservice
                    const PYTHON_AI_BASE = getAiBaseUrl();
                    const PYTHON_AI_URL = `${PYTHON_AI_BASE}/analyze`;
                    const allFeatures = [currentFeatures];

                    // Add history for batch ML context
                    for (const pastRec of historyRecords.slice(0, 19)) {
                        if (pastRec.features && pastRec.features.durationMinutes !== undefined) {
                            allFeatures.push({
                                duration_minutes: pastRec.features.durationMinutes,
                                arrival_deviation: pastRec.features.arrivalDeviation || 0,
                                arrival_deviation_from_personal_avg: pastRec.features.arrivalDeviationFromPersonalAvg || 0,
                                scan_interval: pastRec.features.scanInterval || 0,
                                short_stay_count: pastRec.features.shortStayCount || 0,
                                inter_arrival_time: pastRec.features.interArrivalTime || 0,
                                frequency_score: pastRec.features.frequencyScore || 1
                            });
                        }
                    }

                    const aiResponse = await axios.post(PYTHON_AI_URL, { features: allFeatures });

                    if (aiResponse.data && aiResponse.data.success && aiResponse.data.results.length > 0) {
                        const result = aiResponse.data.results[0];
                        record.anomalyScore = result.score;
                        record.anomalyStatus = result.status;
                    }
                } catch (aiErr) {
                    console.error("AI Anomaly Detection Error:", aiErr.message);
                    // Minimal fallback
                    record.anomalyStatus = (calcWorkingHours(record.inTime, record.outTime).includes("0h 0m")) ? "Suspicious" : "Normal";
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

                // Queue a trigger for the wireless camera
                pendingTriggers[staff.rfidUid] = Date.now();

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

    // GET /api/attendance/comparison
    // Benchmarks multiple algorithms across recent records
    router.get("/comparison", async (req, res) => {
        try {
            // Fetch records from the last 30 days that have outTime (completed check-outs)
            const records = await Attendance.find({
                outTime: { $ne: null }
            }).sort({ date: -1 }).limit(100);

            if (records.length < 2) {
                return res.json({
                    success: false,
                    message: "Insufficient data for benchmark (need at least 2 records with completed check-outs)"
                });
            }

            const featuresList = records.map(r => ({
                duration_minutes: (r.features && r.features.durationMinutes) || 0,
                arrival_deviation: (r.features && r.features.arrivalDeviation) || 0,
                arrival_deviation_from_personal_avg: (r.features && r.features.arrivalDeviationFromPersonalAvg) || 0,
                scan_interval: (r.features && r.features.scanInterval) || 0,
                short_stay_count: (r.features && r.features.shortStayCount) || 0,
                inter_arrival_time: (r.features && r.features.interArrivalTime) || 0,
                frequency_score: (r.features && r.features.frequencyScore) || 1
            }));

            const PYTHON_AI_BASE = getAiBaseUrl();
            const fullUrl = `${PYTHON_AI_BASE}/compare`;
            console.log(`[AI-COMP] Calling: ${fullUrl} for ${records.length} records`);

            const aiRes = await axios.post(fullUrl, { features: featuresList }, { timeout: 30000 }).catch(e => {
                const status = e.response ? e.response.status : 'NO_RESPONSE';
                const data = e.response ? e.response.data : e.message;
                console.error(`[AI-COMP] Call failed. Status: ${status}, Detail:`, data);
                return { error: true, message: e.message, status, data };
            });

            if (aiRes.error) {
                return res.status(502).json({
                    success: false,
                    message: `AI Service Unreachable: ${aiRes.message}. Status: ${aiRes.status}. (Check https://distribution-agency-ai.onrender.com in browser)`
                });
            }

            if (aiRes.data && aiRes.data.success) {
                console.log(`[AI-COMP] Success: ${Object.keys(aiRes.data.comparison).length} algos evaluated`);
                return res.json({ success: true, comparison: aiRes.data.comparison, count: records.length });
            } else {
                console.error(`[AI-COMP] Engine Failure:`, aiRes.data);
                return res.status(500).json({ success: false, message: (aiRes.data && aiRes.data.error) || "AI Comparison engine failure" });
            }
        } catch (err) {
            console.error("Comparison error:", err.message);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    return router;
};
