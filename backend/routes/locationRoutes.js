const express = require("express");
const { 
  getLocations, 
  createLocation, 
  updateLocation 
} = require("../controllers/locationController");


const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const router = express.Router();

router.get("/", getLocations);
router.post("/", protect, admin, createLocation);
router.put("/:id", protect, admin, updateLocation);

module.exports = router;