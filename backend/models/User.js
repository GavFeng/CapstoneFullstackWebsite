const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

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
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
  },
  phone: {
    type: String,
    trim: true,
    default: "",
    validate: {
      validator: function(v) {
        return v === "" || /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  accountType: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  }
}, { 
  timestamps: true 
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
});
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};


module.exports = mongoose.model("User", UserSchema);