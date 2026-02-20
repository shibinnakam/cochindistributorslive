const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
        rfidUid: { type: String, required: true },
        staffName: { type: String, default: "" },
        position: { type: String, default: "" },
        date: { type: String, required: true }, // "YYYY-MM-DD"
        inTime: { type: Date, default: null },
        outTime: { type: Date, default: null },
        workingHours: { type: String, default: null }, // e.g. "7h 30m"
    },
    { timestamps: true }
);

// One record per staff per day
attendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
