const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require("../models/Product");
const Category = require("../models/Category");

const router = express.Router();

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
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) cb(null, true);
  else cb(new Error("Only image files are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// ✅ Add Product
router.post("/addproduct", upload.single("image"), async (req, res) => {
  try {
    const { name, description, originalPrice, discountPrice, category, quantity } = req.body;

    // ---- VALIDATION ----
    if (!name || !description || !originalPrice || !discountPrice || !category || quantity === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Name validation (4–15 chars, only letters/numbers/spaces)
    const nameRegex = /^[A-Za-z0-9 ]{4,15}$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        message: "Product name must be 4–15 characters long and contain only letters, numbers, and spaces"
      });
    }

    // Description validation (4–20 chars, only letters/numbers/spaces)
    const descRegex = /^[A-Za-z0-9 ]{4,20}$/;
    if (!descRegex.test(description)) {
      return res.status(400).json({
        message: "Description must be 4–20 characters long and contain only letters, numbers, and spaces"
      });
    }

    // Price validation
    const original = Number(originalPrice);
    const discount = Number(discountPrice);

    if (
      isNaN(original) || isNaN(discount) ||
      original < 1 || original > 1000 ||
      discount < 1 || discount > 1000
    ) {
      return res.status(400).json({
        message: "Prices must be numbers between 1 and 1000"
      });
    }

    // ✅ Discount should not be greater than original
    if (discount > original) {
      return res.status(400).json({
        message: "Discount price cannot be greater than original price"
      });
    }

    // Quantity validation
    const qty = Number(quantity);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({
        message: "Quantity must be a valid number (0 or greater)"
      });
    }

    // Category validation
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid category selected" });
    }

    // Image validation
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // ✅ Check if same product with same name + originalPrice already exists
    const existingProduct = await Product.findOne({
      name: name.trim(),
      originalPrice: original
    });

    if (existingProduct) {
      return res.status(400).json({
        message: `Product "${name}" with price ${original} already exists`
      });
    }

    // ✅ Create new product
    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      originalPrice: original,
      discountPrice: discount,
      image: `/uploads/${req.file.filename}`,
      category,
      quantity: qty
    });

    await product.save();
    res.status(201).json({ success: true, message: "Product added successfully", product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ✅ Get All Products (with category details)
router.get("/getproduct", async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name") // ✅ show category name instead of ID
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get Single Product by ID
router.get("/getproduct/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Delete Product by ID
router.delete("/deleteproduct/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete image file
    if (product.image) {
      const imagePath = path.join(__dirname, "..", product.image.replace(/^\/+/, ""));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// ✅ Update Product by ID
router.put("/updateproduct/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, description, originalPrice, discountPrice, category, quantity } = req.body;

    // Find product
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Update fields (only if provided)
    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (originalPrice) product.originalPrice = Number(originalPrice);
    if (discountPrice) product.discountPrice = Number(discountPrice);
    if (category) product.category = category;
    if (quantity !== undefined) product.quantity = Number(quantity);

    // ✅ If new image uploaded, replace old one
    if (req.file) {
      // delete old image
      if (product.image) {
        const oldImagePath = path.join(__dirname, "..", product.image.replace(/^\/+/, ""));
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();
    res.status(200).json({ success: true, message: "Product updated successfully", product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
