const express = require("express");

const {
  createWeight,
  getWeights,
  checkWeightLabel,
  getWeightById,
  deleteWeight,


} = require("../controllers/weightController");

const router = express.Router();

router.post("/", createWeight);

router.get("/", getWeights);

router.get("/check-label", checkWeightLabel);

router.get("/:id", getWeightById);

router.delete("/:id", deleteWeight);


module.exports = router;

