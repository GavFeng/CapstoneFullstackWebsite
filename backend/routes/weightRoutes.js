const express = require("express");

const {
  createWeight,
  getWeights,
  getWeightById,
  deleteWeight,


} = require("../controllers/weightController");

const router = express.Router();

router.post("/", createWeight);

router.get("/", getWeights);

router.get("/:id", getWeightById);

router.delete("/:id", deleteWeight);


module.exports = router;

