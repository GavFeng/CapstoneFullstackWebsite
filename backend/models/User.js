const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const { encrypt, decrypt, createBlindIndex } = require('../utils/crypto');

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
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    set: encrypt, 
    get: decrypt
  },
  emailIndex: {
    type: String,
    unique: true,
    select: false
  },
  phone: {
    type: String,
    trim: true,
    default: "",
    set: encrypt, 
    get: decrypt,
    validate: {
      validator: function(v) {
        if (!v || v === "") return true;

        const valToValidate = v.includes(':') ? decrypt(v) : v;

        return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(valToValidate);
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
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

UserSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // 2. Handle Email Logic
  if (this.isModified('email')) {
    const plainEmail = (this.email && this.email.includes(':')) 
      ? decrypt(this.email) 
      : this.email;

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(plainEmail)) {
      throw new Error("Please use a valid email address");
    }

    this.emailIndex = createBlindIndex(plainEmail);
  }
  
});

UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};


module.exports = mongoose.model("User", UserSchema);