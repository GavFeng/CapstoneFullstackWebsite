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
  city: String,
  state: String,
  zip: String,
  phone: String,
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model("Location", locationSchema);