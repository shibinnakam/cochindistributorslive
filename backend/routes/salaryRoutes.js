const express = require("express");
const router = express.Router();
const Staff = require("../models/Staff");
const Attendance = require("../models/Attendance");
const SalaryPayment = require("../models/SalaryPayment");
const Leave = require("../models/Leave");

// Helper to get number of days in a month
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

// Helper to count Sundays in a given month
function countSundays(year, month) {
  let count = 0;
  const daysInMonth = getDaysInMonth(year, month);
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month - 1, i);
    if (d.getDay() === 0) {
      count++;
    }
  }
  return count;
}

// GET /api/salary/calculate/:staffId?month=YYYY-MM
router.get("/calculate/:staffId", async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    if (!month) {
      return res.status(400).json({ success: false, message: "Month (YYYY-MM) is required" });
    }

    const yearNum = parseInt(month.split("-")[0]);
    const monthNum = parseInt(month.split("-")[1]);

    // 1. Check if already paid
    const existingPayment = await SalaryPayment.findOne({
      staffId: req.params.staffId,
      monthAndYear: month
    });

    if (existingPayment) {
      return res.json({ success: true, isPaid: true, data: existingPayment });
    }

    // 2. Fetch staff details for base salary
    const staff = await Staff.findById(req.params.staffId);
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    const baseSalary = staff.salary || 0;

    // Total days and Sundays
    const totalDaysInMonth = getDaysInMonth(yearNum, monthNum);
    const sundays = countSundays(yearNum, monthNum);
    const workingDays = totalDaysInMonth - sundays;

    // We don't define dailyRate here since we'll use totalDaysInMonth
    // 8:30 AM to 6:00 PM is 9.5 hours.

    // 3. Fetch attendance records for the month
    // Date format in DB is "YYYY-MM-DD"
    const regex = new RegExp(`^${month}`);
    const attendances = await Attendance.find({
      staffId: req.params.staffId,
      date: regex
    });

    // 4. Calculate actual present time and overtime
    let presentDaysCount = 0;
    let totalPresentMinutes = 0;
    let totalOvertimeMinutes = 0;

    // A simple set to track dates present
    const presentDates = new Set();
    const expectedMinutesPerDay = 9.5 * 60; // 8:30 AM to 6:00 PM = 9.5 hours
    const dailyRate = baseSalary / totalDaysInMonth; // Salary divided by total days in month
    const hourlyRate = dailyRate / 9.5;
    const minuteRate = hourlyRate / 60;

    attendances.forEach(att => {
      if (att.inTime && att.outTime) {
        presentDates.add(att.date);
        const ms = new Date(att.outTime) - new Date(att.inTime);
        let minutesWorked = ms / (1000 * 60);

        // Cap reasonable hours if forgot to checkout until next day
        if (minutesWorked > 24 * 60) minutesWorked = 24 * 60;

        totalPresentMinutes += minutesWorked;

        if (minutesWorked > expectedMinutesPerDay) {
          totalOvertimeMinutes += (minutesWorked - expectedMinutesPerDay);
        }
      }
    });

    presentDaysCount = presentDates.size;

    // Deductions logic
    // We will base deductions heavily on the daily rate vs present days
    // But since the user wants it to be based exactly on hours and minutes present:
    // If they were completely absent on a working day (and no leave), deduct the full day

    // Check approved leaves for the month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 1);

    const leaves = await Leave.find({
      email: staff.email,
      status: "Approved",
      date: { $gte: startDate, $lt: endDate }
    });

    // Here we assume leaves are PAID leaves (meaning they reduce absent days)
    const leaveDates = new Set(leaves.map(l => {
      const d = new Date(l.date);
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
    }));

    // We count missing days
    let absentDays = 0;
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const dStr = `${month}-${i.toString().padStart(2, "0")}`;
      const d = new Date(yearNum, monthNum - 1, i);
      if (d.getDay() !== 0) { // Not Sunday
        if (!presentDates.has(dStr)) { // No attendance
          if (!leaveDates.has(dStr)) { // No approved leave
            absentDays++;
          }
        }
      }
    }

    // Leave deductions are simply based on fully absent days without leave
    const leaveDeductions = absentDays * dailyRate;

    // Total standard pay is based on total minutes worked (capped at standard limits) + paid leave days + sundays
    // BUT the simplest approach requested: calculate base salary correctly.
    // Base Calculation: baseSalary - leaveDeductions + Overtime
    const overtimePay = totalOvertimeMinutes * minuteRate;
    let finalSalary = baseSalary - leaveDeductions + overtimePay;

    // Sanitize values
    if (finalSalary < 0) finalSalary = 0;

    const salaryData = {
      staffId: staff._id,
      monthAndYear: month,
      baseSalary: parseFloat(baseSalary.toFixed(2)),
      totalWorkingDays: workingDays,
      presentDays: presentDaysCount,
      leaveDeductions: parseFloat(leaveDeductions.toFixed(2)),
      overtimeHours: parseFloat((totalOvertimeMinutes / 60).toFixed(2)),
      overtimePay: parseFloat(overtimePay.toFixed(2)),
      finalSalary: Math.round(finalSalary),
    };

    res.json({ success: true, isPaid: false, data: salaryData });
  } catch (err) {
    console.error("Salary calculation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/salary/pay
router.post("/pay", async (req, res) => {
  try {
    const {
      staffId,
      monthAndYear,
      baseSalary,
      totalWorkingDays,
      presentDays,
      leaveDeductions,
      overtimeHours,
      overtimePay,
      finalSalary
    } = req.body;

    // Check if already paid
    const existing = await SalaryPayment.findOne({ staffId, monthAndYear });
    if (existing) {
      return res.status(400).json({ success: false, message: "Salary already paid for this month." });
    }

    const payment = new SalaryPayment({
      staffId,
      monthAndYear,
      baseSalary,
      totalWorkingDays,
      presentDays,
      leaveDeductions,
      overtimeHours,
      overtimePay,
      finalSalary,
      status: "Paid"
    });

    await payment.save();

    res.json({ success: true, message: "Salary marked as paid successfully.", payment });
  } catch (err) {
    console.error("Salary payment error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
