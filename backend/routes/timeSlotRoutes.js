const express = require("express");
const {
  createTimeSlots,
  getAvailableSlots,
  deleteTimeSlot
} = require("../controllers/timeSlotController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", getAvailableSlots);
router.post("/", protect, admin, createTimeSlots);
router.delete("/:id", protect, admin, deleteTimeSlot);

module.exports = router;