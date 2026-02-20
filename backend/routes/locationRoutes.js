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
// Optional query params: ?hours=24 (default: 24 hours)
router.get("/history", async (req, res) => {
    try {
        const hours = parseInt(req.query.hours) || 24;
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);

        const locations = await Location.find({ time: { $gte: since } }).sort({ time: 1 });
        res.json({ success: true, data: locations });
    } catch (error) {
        console.error("Error fetching location history:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
});

module.exports = router;
