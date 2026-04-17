const express = require("express");
const {
  createTimeSlots,
  getAvailableSlots,
  getAllUpcomingSlots,
  deleteTimeSlot
} = require("../controllers/timeSlotController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/", protect, admin, createTimeSlots);
router.get("/", getAvailableSlots);
router.get("/all-upcoming", protect, admin, getAllUpcomingSlots);
router.delete("/:id", protect, admin, deleteTimeSlot);

module.exports = router;