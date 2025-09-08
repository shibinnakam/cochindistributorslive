const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    originalPrice: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
    image: { type: String, required: true }, // uploaded file name/path
    category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category", 
      required: true 
    },
    quantity: { type: Number, required: true, min: 0 } // ✅ added quantity
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
