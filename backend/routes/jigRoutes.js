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

router.post("/", createJig);

router.get("/", getJigs);

router.get("/check-name", checkJigName);

router.get("/popular", getPopularJigs);

router.get("/newest", getNewestJigs);

router.get("/:idOrSlug", getJigById);

router.delete("/:id", deleteJig);

router.patch("/:id", patchJig);

router.get('/related/:id', getRelatedJigs);

router.delete("/:id/colors/:colorId", deleteColor);

router.patch("/:id/colors/:colorId/stock", updateInventory);

router.patch("/:id/colors/sold", updateSold);

module.exports = router;

