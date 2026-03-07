const mongoose = require("mongoose");

const weightSchema = new mongoose.Schema({
  //Text Version of Weight  
  label: {
    type: String,
    required: true,
    unique: true,
  },
  //Numerical Version of Weight  
  value: {
    type: Number,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
});

weightSchema.pre('save', function () {
  if (this.isModified('label') || !this.slug) {
    this.slug = this.label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

module.exports = mongoose.model("Weight", weightSchema);
