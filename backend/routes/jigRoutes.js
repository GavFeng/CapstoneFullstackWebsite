const express = require("express");

const {
  createJig,
  getJigs,
  checkJigName,
  getPopularJigs,
  getNewestJigs,
  getJigById,
  deleteJig,
  deleteColor,
  patchJig,
  getRelatedJigs,
  updateInventory,
  updateSold,
} = require("../controllers/jigController");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/", authMiddleware, adminMiddleware, createJig);

router.get("/", getJigs);

router.get("/check-name", checkJigName);

router.get("/popular", getPopularJigs);

router.get("/newest", getNewestJigs);

router.get("/:idOrSlug", getJigById);

router.delete("/:id", authMiddleware, adminMiddleware, deleteJig);

router.patch("/:id", authMiddleware, adminMiddleware, patchJig);

router.get('/related/:id', getRelatedJigs);

router.delete("/:id/colors/:colorId", authMiddleware, adminMiddleware, deleteColor);

router.patch("/:id/colors/:colorId/stock", authMiddleware, adminMiddleware, updateInventory);

router.patch("/:id/colors/sold", authMiddleware, adminMiddleware, updateSold);

module.exports = router;

