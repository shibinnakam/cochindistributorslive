const express = require("express");
const router = express.Router();
const Location = require("../models/Location");

// POST /api/location - Save new location (from ESP8266)
router.post("/", async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ success: false, msg: "Latitude and longitude are required" });
        }

        const newLocation = new Location({
            latitude,
            longitude,
        });

        await newLocation.save();
        console.log(`Location updated: Lat ${latitude}, Lng ${longitude}`);
        res.status(201).json({ success: true, msg: "Location saved" });
    } catch (error) {
        console.error("Error saving location:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
});

// GET /api/location/latest - Get the most recent location
router.get("/latest", async (req, res) => {
    try {
        const latest = await Location.findOne().sort({ time: -1 });
        if (!latest) {
            return res.status(404).json({ success: false, msg: "No location data found" });
        }
        res.json({ success: true, data: latest });
    } catch (error) {
        console.error("Error fetching latest location:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
});

// GET /api/location/history - Get all locations for route history
// Optional query params: ?hours=24 (default: 24 hours) or ?date=YYYY-MM-DD
router.get("/history", async (req, res) => {
    try {
        let query = {};
        const { hours, date } = req.query;

        if (date) {
            // Filter by specific date (start of day to end of day)
            const [year, month, day] = date.split('-').map(Number);
            const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
            const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);

            query.time = { $gte: startDate, $lte: endDate };
        } else {
            // Fallback to hours logic
            const hrs = parseInt(hours) || 24;
            const since = new Date(Date.now() - hrs * 60 * 60 * 1000);
            query.time = { $gte: since };
        }

        const locations = await Location.find(query).sort({ time: 1 });
        res.json({ success: true, count: locations.length, data: locations });
    } catch (error) {
        console.error("Error fetching location history:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
});

module.exports = router;
