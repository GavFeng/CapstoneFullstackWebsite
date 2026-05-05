const express = require("express");
const {
  createTimeSlots,
  getAvailableSlots,
  getAllUpcomingSlots,
  deleteTimeSlot
} = require("../controllers/timeSlotController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createTimeSlots);
router.get("/", getAvailableSlots);
router.get("/all-upcoming", authMiddleware, adminMiddleware, getAllUpcomingSlots);
router.delete("/:id", authMiddleware, adminMiddleware, deleteTimeSlot);

module.exports = router;