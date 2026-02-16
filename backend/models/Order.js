const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  jig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Jig",
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  weight: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Weight", required: true 
  },
  color: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Color",
    required: true,
  },
  
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },

  price: {
    type: Number,
    required: true,
  }

});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  items: {
    type: [orderItemSchema],
    required: true,
  },

  totalAmount: {
    type: Number,
    required: true,
  },

  deliveryMethod: {
    type: String,
    enum: ["shipping", "pickup"],
    required: true,
  },

  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },

  pickupDetails: {
    location: String,
    pickupDate: Date,
    pickupCode: String,
  },

  status: {
    type: String,
    enum: ["pending", "paid", "ready", "shipped", "delivered", "completed", "cancelled"],
    default: "pending",
  },

  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "refunded"],
    default: "unpaid",
  }

}, { timestamps: true });


module.exports = mongoose.model("Order", orderSchema);
