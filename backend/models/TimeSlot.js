const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  location: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Location", 
    required: true,
    index: true // Speeds up queries by location
  },
  startTime: {
    type: Date,
    required: true,
    index: true // Speeds up filtering for future slots
  },
  endTime: {
    type: Date,
    required: true
  },
  capacity: { 
    type: Number, 
    required: true, 
    default: 5,
    min: 1 
  },
  currentBookings: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true 
  }
}, { timestamps: true });

timeSlotSchema.path('endTime').validate(function(value) {
  return value > this.startTime;
}, 'End time ({VALUE}) must be after start time.');

module.exports = mongoose.model("TimeSlot", timeSlotSchema);