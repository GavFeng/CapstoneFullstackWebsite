const express = require("express");

const {
  createColor,
  getColors,
  getColorById,
  deleteColor,


} = require("../controllers/colorController");

const router = express.Router();

router.post("/", createColor);

router.get("/", getColors);

router.get("/:id", getColorById);

router.delete("/:id", deleteColor);


module.exports = router;

