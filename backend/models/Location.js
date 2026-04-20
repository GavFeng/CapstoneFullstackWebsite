const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  city: {
    type: String, 
    required: true 
  },
  state: {
    type: String, 
    required: true 
  },
  zip: {
    type: String, 
    required: true 
  },
  phone: {
    type: String, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model("Location", locationSchema);