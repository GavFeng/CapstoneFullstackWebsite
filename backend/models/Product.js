const mongoose = require("mongoose");

// Different Colors for Each Jig (Quantity + Image)
const colorSchema = new mongoose.Schema({
  image: [{
    type: String,
    required: true,
  }],
  stock:{
    type: Number,
    required: true,
  }
});

// Schema for Jigs
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
  },
  description: { 
    type: String,
    required: true,
    trim: true,
    maxLength: 250,
  },
  price: {
    type: Number,
    required: true,
    min: 0.01,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  weight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Weight",
    required: true,
  },
  colors: {
    type: Map,
    of: colorSchema,
  },
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Product", productSchema);