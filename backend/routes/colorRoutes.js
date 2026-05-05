const express = require("express");

const {
  createColor,
  getColors,
  checkColorName,
  getColorById,
  deleteColor,
  updateColor

} = require("../controllers/colorController");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
 
router.post("/", authMiddleware, adminMiddleware, createColor);

router.get("/", getColors);

router.get("/check-name", checkColorName);

router.get("/:id", getColorById);

router.delete("/:id", authMiddleware, adminMiddleware, deleteColor);

router.put("/:id", authMiddleware, adminMiddleware, updateColor);


module.exports = router;

