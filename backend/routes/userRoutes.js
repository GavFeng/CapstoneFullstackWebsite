const express = require("express");

const {
  registerUser,
  loginUser,
  getCurrentUser,
  getUsers,
  updateProfile
} = require("../controllers/userController");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getCurrentUser);
router.get("/users", authMiddleware, adminMiddleware, getUsers);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;