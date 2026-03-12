const mongoose = require("mongoose");

const salaryPaymentSchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    monthAndYear: { type: String, required: true }, // e.g. "2026-03"
    baseSalary: { type: Number, required: true },
    totalWorkingDays: { type: Number, required: true },
    presentDays: { type: Number, required: true },
    leaveDeductions: { type: Number, required: true },
    overtimeHours: { type: Number, required: true },
    overtimePay: { type: Number, required: true },
    finalSalary: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Paid"], default: "Paid" },
    paidAt: { type: Date, default: Date.now },
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
  },
  { timestamps: true }
);

// Prevent duplicate salary payments for the same staff and month
salaryPaymentSchema.index({ staffId: 1, monthAndYear: 1 }, { unique: true });

module.exports = mongoose.model("SalaryPayment", salaryPaymentSchema);
