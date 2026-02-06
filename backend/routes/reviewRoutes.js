const express = require("express");
const Review = require("../models/Review");
const Product = require("../models/Product");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Helper to update product rating
const updateProductRating = async (productId) => {
  const reviews = await Review.find({
    product: productId,
    isApproved: true,
    isDeleted: false,
  });

  const ratingCount = reviews.length;
  const averageRating =
    ratingCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
      : 0;

  await Product.findByIdAndUpdate(productId, {
    averageRating: parseFloat(averageRating.toFixed(1)),
    ratingCount,
  });
};

// Get all reviews for admin
router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const reviews = await Review.find({ isDeleted: false })
      .populate("user", "name email")
      .populate("product", "name _id imageFront")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get pending reviews for admin
router.get("/admin/pending", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const reviews = await Review.find({ isApproved: false, isDeleted: false })
      .populate("user", "name email")
      .populate("product", "name _id imageFront")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Approve review
router.put("/admin/approve/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ msg: "Review not found" });
    }

    review.isApproved = true;
    await review.save();

    // Recalculate product rating stats
    await updateProductRating(review.product);

    res.json({ success: true, msg: "Review approved and ratings updated", review });
  } catch (error) {
    console.error("Error approving review:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Delete review
router.delete("/admin/delete/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ msg: "Review not found" });
    }

    res.json({ success: true, msg: "Review deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get approved reviews for a product (public)
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      isApproved: true,
      isDeleted: false,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Create review (for users)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ msg: "Rating must be between 1 and 5" });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user.id,
      product: productId,
      isDeleted: false,
    });

    if (existingReview) {
      return res.status(400).json({ msg: "You have already reviewed this product" });
    }

    const review = new Review({
      user: req.user.id,
      product: productId,
      rating,
      comment,
      isApproved: true, // Automatically approved
    });

    await review.save();

    // Recalculate product rating stats
    await updateProductRating(productId);

    res.json({ success: true, msg: "Review submitted successfully", review });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get user's reviews
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find({
      user: req.user.id,
      isDeleted: false,
    })
      .populate("product", "name imageFront")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
