const User = require("../models/User");
const jwt = require("jsonwebtoken");


const generateToken = (id, accountType) => {
  return jwt.sign(
    { id, accountType },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Resgister as a User
exports.registerUser = async (req, res) => {
  try {

    const { name, username, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email
          ? "Email already in use"
          : "Username already taken"
      });
    }

    const user = await User.create({
      name,
      username,
      email,
      password
    });

    res.status(201).json({
      token: generateToken(user._id, user.accountType),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountType: user.accountType
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create an Admin Account (Admin only)
exports.registerAdmin = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const admin = await User.create({
      name,
      username,
      email,
      password,
      accountType: "admin"
    });

    res.status(201).json({
      message: "Admin account created successfully",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        accountType: admin.accountType
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login as a User
exports.loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    res.json({
      token: generateToken(user._id, user.accountType),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountType: user.accountType
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a User
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

// Getting the Accounts
exports.getAllAccounts = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, username } = req.body;
    

    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (username) user.username = username;

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      phone: updatedUser.phone,
      accountType: updatedUser.accountType
    });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: err.message });
  }
};