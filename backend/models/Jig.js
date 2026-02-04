const mongoose = require("mongoose");

// Different Colors for Each Jig (Quantity + Image)
const jigColorSchema = new mongoose.Schema({
  color: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Color",
    required: true,
  },
  images: [{
    url: { type: String, required: true },
    key: { type: String, required: true }
  }],
  stock:{
    type: Number,
    required: true,
    min: 0,
  }
});

// Schema for Jigs
const jigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
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
    type: [jigColorSchema],
    required: true,
    validate: {
      validator: v => v.length > 0,
      message: "At least one color required"
    }
  },
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Jig", jigSchema);