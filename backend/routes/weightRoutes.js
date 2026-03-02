const express = require("express");

const {
  createWeight,
  getWeights,
  getWeightByLabel,
  checkWeightLabel,
  getWeightById,
  deleteWeight,


} = require("../controllers/weightController");

const router = express.Router();

router.post("/", createWeight);

router.get("/", getWeights);

router.get("/label/:label", getWeightByLabel);

router.get("/check-label", checkWeightLabel);

router.get("/:id", getWeightById);

router.delete("/:id", deleteWeight);


module.exports = router;

