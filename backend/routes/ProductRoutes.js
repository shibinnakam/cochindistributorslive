const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Jimp = require("jimp");
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
  const allowedImageTypes = /jpeg|jpg|png|gif/;
  const allowedModelTypes = /glb|gltf/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  
  if (['image', 'imageFront', 'imageSide', 'imageBack', 'imageTop', 'imageBottom'].includes(file.fieldname)) {
    const isExtValid = allowedImageTypes.test(extname);
    const isMimeValid = file.mimetype.startsWith('image/');
    
    if (isExtValid && isMimeValid) {
      return cb(null, true);
    } else {
      return cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed for product images"));
    }
  } else if (file.fieldname === 'model3D') {
    const isExtValid = allowedModelTypes.test(extname);
    const isModel = file.originalname.match(/\.(glb|gltf)$/i);
    
    if (isExtValid || isModel) {
      return cb(null, true);
    } else {
      return cb(new Error("Only 3D model files (glb, gltf) are allowed for the 3D model field"));
    }
  }
  
  cb(new Error("Unexpected field"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Increased limit to 10MB for 3D models
});

// ✅ Add Product
router.post("/addproduct", upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'imageFront', maxCount: 1 },
  { name: 'imageSide', maxCount: 1 },
  { name: 'imageBack', maxCount: 1 },
  { name: 'imageTop', maxCount: 1 },
  { name: 'imageBottom', maxCount: 1 },
  { name: 'model3D', maxCount: 1 }
]), async (req, res) => {
  try {
    const { 
      name, 
      description, 
      originalPrice, 
      discountPrice, 
      category, 
      quantity,
      manufacturingDate,
      expiryDate,
      batchNumber,
      rackNumber,
      shape
    } = req.body;

    // ---- BASIC VALIDATION ----
    if (
      !name || !description || !originalPrice || !discountPrice ||
      !category || quantity === undefined || !manufacturingDate ||
      !expiryDate || !batchNumber || !rackNumber
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Name validation (4–15 chars, only letters/numbers/spaces)
    const nameRegex = /^[A-Za-z0-9 ]{4,15}$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        message: "Product name must be 4–15 characters long and contain only letters, numbers, and spaces"
      });
    }

    // ✅ Description validation (4–20 chars, only letters/numbers/spaces)
    const descRegex = /^[A-Za-z0-9 ]{4,20}$/;
    if (!descRegex.test(description)) {
      return res.status(400).json({
        message: "Description must be 4–20 characters long and contain only letters, numbers, and spaces"
      });
    }

    // ✅ Price validation
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

    if (discount > original) {
      return res.status(400).json({
        message: "Discount price cannot be greater than original price"
      });
    }

    // ✅ Quantity validation
    const qty = Number(quantity);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({
        message: "Quantity must be a valid number (0 or greater)"
      });
    }

    // ✅ Rack number validation (1–155)
    const rack = Number(rackNumber);
    if (isNaN(rack) || rack < 1 || rack > 155) {
      return res.status(400).json({
        message: "Rack number must be a number between 1 and 155"
      });
    }

    // ✅ Dates validation
    const mfgDate = new Date(manufacturingDate);
    const expDate = new Date(expiryDate);

    if (isNaN(mfgDate.getTime()) || isNaN(expDate.getTime())) {
      return res.status(400).json({ message: "Invalid manufacturing or expiry date" });
    }

    if (mfgDate.getTime() === expDate.getTime()) {
      return res.status(400).json({ message: "Manufacturing date and expiry date cannot be the same" });
    }

    // Expiry must be at least 10 days after manufacturing
    const diffDays = (expDate - mfgDate) / (1000 * 60 * 60 * 24);
    if (diffDays < 10) {
      return res.status(400).json({ message: "Expiry date must be at least 10 days after manufacturing date" });
    }

    // ✅ Batch Number validation (India formats)
    const batchRegex = /^([0-9]{3,10}|[0-9]{6}[A-Z]?|[A-Z]{1,2}[0-9]{4,6}[A-Z0-9]?|L[0-9]{2}[A-Z][0-9]{2})$/;
    if (!batchRegex.test(batchNumber)) {
      return res.status(400).json({
        message: "Invalid batch number format"
      });
    }

    // ✅ Category validation
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid category ID format" });
    }
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid category selected" });
    }

    // ✅ Image validation - require front & back (side optional) OR single image for backward compatibility
    const hasFrontImage = req.files && req.files.imageFront;
    const hasSideImage = req.files && req.files.imageSide;
    const hasBackImage = req.files && req.files.imageBack;
    const hasSingleImage = req.files && req.files.image;

    // If new format (front+back), both front and back must be provided (side is optional)
    if ((hasFrontImage || hasBackImage) && (!hasFrontImage || !hasBackImage)) {
      return res.status(400).json({ message: "Front and Back images are required for 3D visualization" });
    }

    // At least one format must be provided
    if (!hasFrontImage && !hasBackImage && !hasSingleImage) {
      return res.status(400).json({ message: "Image is required (either single image or front+back images for 3D)" });
    }

    // ✅ Duplicate check: same name, price, mfg date, expiry date, batch number
    const existingProduct = await Product.findOne({
      name: name.trim(),
      originalPrice: original,
      manufacturingDate: mfgDate,
      expiryDate: expDate,
      batchNumber: batchNumber.trim()
    });

    if (existingProduct) {
      return res.status(400).json({
        message: "Product already uploaded. You can edit it instead."
      });
    }

    // ✅ Create new product
    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      originalPrice: original,
      discountPrice: discount,
      image: hasSingleImage ? `/uploads/${req.files.image[0].filename}` : undefined,
      imageFront: hasFrontImage ? `/uploads/${req.files.imageFront[0].filename}` : undefined,
      imageSide: hasSideImage ? `/uploads/${req.files.imageSide[0].filename}` : undefined,
      imageBack: hasBackImage ? `/uploads/${req.files.imageBack[0].filename}` : undefined,
      imageTop: req.files.imageTop ? `/uploads/${req.files.imageTop[0].filename}` : undefined,
      imageBottom: req.files.imageBottom ? `/uploads/${req.files.imageBottom[0].filename}` : undefined,
      model3D: req.files.model3D ? `/uploads/${req.files.model3D[0].filename}` : undefined,
      category,
      quantity: qty,
      manufacturingDate: mfgDate,
      expiryDate: expDate,
      batchNumber: batchNumber.trim(),
      rackNumber: rack,
      shape: shape || 'box',
      isDeleted: false // default
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

    // Delete image files (both legacy and new format)
    if (product.image) {
      const imagePath = path.join(__dirname, "..", product.image.replace(/^\/+/, ""));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    if (product.imageFront) {
      const imagePath = path.join(__dirname, "..", product.imageFront.replace(/^\/+/, ""));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    if (product.imageSide) {
      const imagePath = path.join(__dirname, "..", product.imageSide.replace(/^\/+/, ""));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    if (product.imageBack) {
      const imagePath = path.join(__dirname, "..", product.imageBack.replace(/^\/+/, ""));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    if (product.imageTop) {
      const imagePath = path.join(__dirname, "..", product.imageTop.replace(/^\/+/, ""));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    if (product.imageBottom) {
      const imagePath = path.join(__dirname, "..", product.imageBottom.replace(/^\/+/, ""));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    // Delete 3D model file
    if (product.model3D) {
      const modelPath = path.join(__dirname, "..", product.model3D.replace(/^\/+/, ""));
      if (fs.existsSync(modelPath)) fs.unlinkSync(modelPath);
    }

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// ✅ Update Product by ID
router.put("/updateproduct/:id", upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'imageFront', maxCount: 1 },
  { name: 'imageSide', maxCount: 1 },
  { name: 'imageBack', maxCount: 1 },
  { name: 'imageTop', maxCount: 1 },
  { name: 'imageBottom', maxCount: 1 },
  { name: 'model3D', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, description, originalPrice, discountPrice, category, quantity, shape } = req.body;

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
    if (shape) product.shape = shape;

    // ✅ If new single image uploaded, replace old one
    if (req.files && req.files.image) {
      if (product.image) {
        const oldImagePath = path.join(__dirname, "..", product.image.replace(/^\/+/, ""));
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      product.image = `/uploads/${req.files.image[0].filename}`;
    }

    // ✅ If new 3-image set uploaded, replace old ones
    if (req.files && req.files.imageFront) {
      if (product.imageFront) {
        const oldPath = path.join(__dirname, "..", product.imageFront.replace(/^\/+/, ""));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      product.imageFront = `/uploads/${req.files.imageFront[0].filename}`;
    }

    if (req.files && req.files.imageSide) {
      if (product.imageSide) {
        const oldPath = path.join(__dirname, "..", product.imageSide.replace(/^\/+/, ""));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      product.imageSide = `/uploads/${req.files.imageSide[0].filename}`;
    }

    if (req.files && req.files.imageBack) {
      if (product.imageBack) {
        const oldPath = path.join(__dirname, "..", product.imageBack.replace(/^\/+/, ""));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      product.imageBack = `/uploads/${req.files.imageBack[0].filename}`;
    }

    if (req.files && req.files.imageTop) {
      if (product.imageTop) {
        const oldPath = path.join(__dirname, "..", product.imageTop.replace(/^\/+/, ""));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      product.imageTop = `/uploads/${req.files.imageTop[0].filename}`;
    }

    if (req.files && req.files.imageBottom) {
      if (product.imageBottom) {
        const oldPath = path.join(__dirname, "..", product.imageBottom.replace(/^\/+/, ""));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      product.imageBottom = `/uploads/${req.files.imageBottom[0].filename}`;
    }

    // ✅ If new 3D model uploaded, replace old one
    if (req.files && req.files.model3D) {
      if (product.model3D) {
        const oldModelPath = path.join(__dirname, "..", product.model3D.replace(/^\/+/, ""));
        if (fs.existsSync(oldModelPath)) fs.unlinkSync(oldModelPath);
      }
      product.model3D = `/uploads/${req.files.model3D[0].filename}`;
    }

    await product.save();
    res.status(200).json({ success: true, message: "Product updated successfully", product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Search Products by Image
router.post("/search-image", upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    const uploadedImagePath = req.file.path;
    let uploadedImage;
    try {
        // Check if file is webp, if so, reject or handle differently (Jimp doesn't support webp by default)
        if (req.file.mimetype === 'image/webp') {
             if (fs.existsSync(uploadedImagePath)) fs.unlinkSync(uploadedImagePath);
             return res.status(400).json({ message: "WebP images are not supported for search. Please use JPG, JPEG, or PNG." });
        }

        uploadedImage = await Jimp.read(uploadedImagePath);
    } catch (error) {
        console.error("Error reading uploaded image:", error);
        if (fs.existsSync(uploadedImagePath)) fs.unlinkSync(uploadedImagePath);
        return res.status(400).json({ message: "Invalid image file or unsupported format" });
    }
    
    uploadedImage.resize({ w: 64, h: 64 });
    uploadedImage.greyscale();

    const products = await Product.find();
    const results = [];

    for (const product of products) {
      const productImageUrl = product.image || product.imageFront;
      if (!productImageUrl) continue;

      // Handle both absolute and relative paths correctly
      let productImagePath;
      if (path.isAbsolute(productImageUrl)) {
          productImagePath = productImageUrl;
      } else {
          productImagePath = path.join(__dirname, "..", productImageUrl.replace(/^\//, ''));
      }

      if (fs.existsSync(productImagePath)) {
        try {
          const productImage = await Jimp.read(productImagePath);
          productImage.resize({ w: 64, h: 64 });
          productImage.greyscale();

          const dist = Jimp.distance(uploadedImage, productImage);
          const diffResult = Jimp.diff(uploadedImage, productImage);

          const score = dist + diffResult.percent;

          // If score is very low, it's likely the same product
          if (score < 0.5) {
             results.push({ product, score });
          }
        } catch (e) {
          console.error(`Error comparing image for product ${product._id}:`, e);
        }
      }
    }

    results.sort((a, b) => a.score - b.score);

    fs.unlinkSync(uploadedImagePath);

    // Logic: If exact match found (score < 0.15), return only that. Otherwise return similar products.
    const exactMatchThreshold = 0.15;
    const exactMatches = results.filter(r => r.score < exactMatchThreshold);

    let finalProducts;
    if (exactMatches.length > 0) {
        finalProducts = exactMatches.map(r => r.product);
    } else {
        finalProducts = results.map(r => r.product);
    }

    res.status(200).json({ success: true, products: finalProducts });

  } catch (err) {
    console.error("Search image error:", err);
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
