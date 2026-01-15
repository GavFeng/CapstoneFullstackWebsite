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
});

module.exports = mongoose.model("Weight", weightSchema);
