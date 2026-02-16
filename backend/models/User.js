const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("User", UserSchema);