const express = require("express");

const {
  createWeight,
  getWeights,
  checkWeightLabel,
  getWeightById,
  deleteWeight,
  updateWeight

} = require("../controllers/weightController");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/", authMiddleware, adminMiddleware, createWeight);

router.get("/", getWeights);

router.get("/check-label", checkWeightLabel);

router.get("/:id", getWeightById);

router.delete("/:id", authMiddleware, adminMiddleware, deleteWeight);

router.put("/:id", authMiddleware, adminMiddleware, updateWeight);


module.exports = router;

