const User = require("../models/User");
const jwt = require("jsonwebtoken");


const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
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
        message: "User already exists"
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
        role: user.accountType
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

    const user = await User.findOne({ email });

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
        role: user.accountType
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a User
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

// Get the Users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};