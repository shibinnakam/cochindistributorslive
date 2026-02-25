const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const { authMiddleware } = require("../middleware/auth");

// Get User Invoices
router.get("/my-invoices", authMiddleware, async (req, res) => {
    try {
        const invoices = await Invoice.find({ user: req.user._id })
            .populate("items.product")
            .sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        console.error("Get invoices error:", error);
        res.status(500).json({ msg: "Server error" });
    }
});

// Get Single Invoice
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const invoice = await Invoice.findOne({
            _id: req.params.id,
            user: req.user._id,
        }).populate("items.product");

        if (!invoice) return res.status(404).json({ msg: "Invoice not found" });
        res.json(invoice);
    } catch (error) {
        console.error("Get invoice error:", error);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
