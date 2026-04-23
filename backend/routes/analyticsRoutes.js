const express = require("express");
const router = express.Router();
const { getGlobalAnalytics } = require("../controllers/analyticsController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

router.get("/global-stats", protect, admin, getGlobalAnalytics);

module.exports = router;