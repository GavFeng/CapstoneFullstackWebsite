const express = require("express");

const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  getAllAccounts,
  registerAdmin
} = require("../controllers/userController");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getCurrentUser);
router.put("/profile", authMiddleware, updateProfile);

router.get("/all", authMiddleware, adminMiddleware, getAllAccounts);
router.post("/create-admin", authMiddleware, adminMiddleware, registerAdmin);

module.exports = router;