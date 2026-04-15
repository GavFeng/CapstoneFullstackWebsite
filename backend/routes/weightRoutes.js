const express = require("express");

const {
  createWeight,
  getWeights,
  getWeightByLabel,
  checkWeightLabel,
  getWeightById,
  deleteWeight,
  updateWeight

} = require("../controllers/weightController");

const router = express.Router();

router.post("/", createWeight);

router.get("/", getWeights);

router.get("/label/:label", getWeightByLabel);

router.get("/check-label", checkWeightLabel);

router.get("/:id", getWeightById);

router.delete("/:id", deleteWeight);

router.put("/:id", updateWeight);


module.exports = router;

