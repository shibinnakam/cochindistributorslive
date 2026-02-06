const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        costPrice: {
          type: Number,
          required: true,
          default: 0,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          default: null,
        },
        suggestion: {
          type: String,
          default: "",
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: String,
      required: false,
    },
    razorpayOrderId: {
      type: String,
      required: false,
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "wallet"],
      default: "razorpay",
    },
    status: {
      type: String,
      default: "ordered",
      enum: ["ordered", "accepted", "shipped", "delivered", "cancelled"],
    },
    scratchCardOffer: {
      type: Number,
      default: null,
    },
    scratchCardRevealed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
