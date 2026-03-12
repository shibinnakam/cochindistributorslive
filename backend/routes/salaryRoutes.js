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

    // Daily and Hourly rates based on working days (assuming 10 hour standard day 8:30 to 18:30)
    const dailyRate = workingDays > 0 ? baseSalary / workingDays : 0;
    const hourlyRate = dailyRate / 10;

    // 3. Fetch attendance records for the month
    // Date format in DB is "YYYY-MM-DD"
    const regex = new RegExp(`^${month}`);
    const attendances = await Attendance.find({ 
      staffId: req.params.staffId, 
      date: regex 
    });

    // 4. Calculate actual present days and overtime
    let presentDaysCount = 0;
    let totalOvertimeHours = 0;

    // A simple set to track dates present
    const presentDates = new Set();

    attendances.forEach(att => {
        if(att.inTime && att.outTime) {
            presentDates.add(att.date);
            const ms = new Date(att.outTime) - new Date(att.inTime);
            let hoursWorked = ms / (1000 * 60 * 60);
            
            // Cap reasonable hours if forgot to checkout until next day
            if (hoursWorked > 24) hoursWorked = 24; 

            if (hoursWorked > 10) {
                totalOvertimeHours += (hoursWorked - 10);
            }
        }
    });

    presentDaysCount = presentDates.size;
    
    // Deductions: days missing attendance that are NOT Sundays or approved leave (simplified to just unpaid absences)
    // We will just base the calculation on present days versus expected working days
    // If workingDays = 26, presentDays = 24. They missed 2 days.
    // If they have approved leave for those 2 days, those should not be deducted if paid (or deducted if unpaid).
    // For simplicity, absentDays = workingDays - presentDays. 
    
    // Check approved leaves for the month
    const leaves = await Leave.find({
        email: staff.email,
        status: "Approved",
        date: regex
    });
    
    // Here we assume leaves are PAID leaves (meaning they reduce absent days)
    const leaveDates = new Set(leaves.map(l => l.date));
    
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

    const leaveDeductions = absentDays * dailyRate;
    const overtimePay = totalOvertimeHours * hourlyRate;

    // final salary: base - deductions + overtime
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
        overtimeHours: parseFloat(totalOvertimeHours.toFixed(2)),
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
