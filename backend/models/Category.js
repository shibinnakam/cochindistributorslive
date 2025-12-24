const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    image: { type: String }, // URL or path to the image
  },
  { timestamps: true } // 👈 this adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("Category", categorySchema);
