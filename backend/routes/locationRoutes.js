const express = require("express");
const { 
  getLocations, 
  createLocation, 
  updateLocation,
  checkLocationName,
  deleteLocation
} = require("../controllers/locationController");


const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const router = express.Router();

router.get("/", getLocations);
router.get("/check-name", checkLocationName);

router.post("/", protect, admin, createLocation);
router.put("/:id", protect, admin, updateLocation);
router.delete("/:id", protect, admin, deleteLocation);

module.exports = router;