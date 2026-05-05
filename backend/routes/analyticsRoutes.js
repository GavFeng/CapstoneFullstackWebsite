const express = require("express");
const { getGlobalAnalytics } = require("../controllers/analyticsController");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/global-stats", authMiddleware, adminMiddleware, getGlobalAnalytics);

module.exports = router;