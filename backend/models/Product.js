const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    originalPrice: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
    image: { type: String, required: false }, // legacy - single image
    imageFront: { type: String, required: false }, // front view image path
    imageSide: { type: String, required: false }, // side view image path (optional)
    imageBack: { type: String, required: false }, // back view image path
    imageTop: { type: String, required: false }, // top view image path (optional)
    imageBottom: { type: String, required: false }, // bottom view image path (optional)
    model3D: { type: String, required: false }, // uploaded 3D model path (optional)
    shape: { 
      type: String, 
      enum: ['box', 'cylinder', 'pillow'], 
      default: 'box' 
    }, // 3D shape type
    category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category", 
      required: true 
    },
    quantity: { type: Number, required: true, min: 10 },

    // ✅ Newly added fields
    manufacturingDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    batchNumber: { type: String, required: true },
    rackNumber: { type: String, required: true },

    // ✅ Status flags
    isExpired: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// 🔹 Auto-update isExpired before saving
productSchema.pre("save", function (next) {
  this.isExpired = this.expiryDate < new Date();
  next();
});

module.exports = mongoose.model("Product", productSchema);
