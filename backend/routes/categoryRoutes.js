const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png/;
  const extname = path.extname(file.originalname).toLowerCase();
  const isExtValid = allowedImageTypes.test(extname);
  const isMimeValid = file.mimetype.startsWith('image/');

  if (isExtValid && isMimeValid) {
    return cb(null, true);
  } else {
    return cb(new Error("Only image files (jpeg, jpg, png) are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Validation function
function validateCategoryName(name) {
  // Allow only alphabets (A-Z, a-z) and spaces
  const regex = /^[A-Za-z\s]+$/;

  if (!name || !name.trim()) {
    return "Category name is required";
  }
  if (name.trim().length < 4) {
    return "Category name must be at least 4 characters long";
  }
  if (!regex.test(name.trim())) {
    return "Category name can only contain letters and spaces";
  }

  return null; // ✅ No validation errors
}

// ➕ Add new category
router.post("/", upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;

    // Run validation
    const errorMsg = validateCategoryName(name);
    if (errorMsg) {
      return res.status(400).json({ error: errorMsg });
    }

    // Check for duplicates (case-insensitive)
    const existing = await Category.findOne({
      name: new RegExp("^" + name.trim() + "$", "i"),
    });
    if (existing) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const category = new Category({ name: name.trim(), image });
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    console.error("Error adding category:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📋 Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ updatedAt: -1 });
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✏️ Update category
router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body;

    // Run validation
    const errorMsg = validateCategoryName(name);
    if (errorMsg) {
      return res.status(400).json({ error: errorMsg });
    }

    // Check if another category with same name exists
    const existing = await Category.findOne({
      name: new RegExp("^" + name.trim() + "$", "i"),
      _id: { $ne: req.params.id }, // Exclude current category
    });
    if (existing) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Category not found" });

    res.json(updated);
  } catch (err) {
    console.error("Error updating category:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 🗑️ Delete category
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
