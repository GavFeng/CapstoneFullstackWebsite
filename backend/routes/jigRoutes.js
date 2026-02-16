const express = require("express");

const {
  createJig,
  getJigs,
  checkJigName,
  getJigById,
  deleteJig,
  deleteColor,
  patchJig,
  updateStock,
} = require("../controllers/jigController");

const router = express.Router();

router.post("/", createJig);

router.get("/", getJigs);

router.get("/check-name", checkJigName);

router.get("/:id", getJigById);

router.delete("/:id", deleteJig);

router.patch("/:id", patchJig);

router.delete("/:id/colors/:colorId", deleteColor);

router.patch("/:id/colors/:colorId/stock", updateStock);



module.exports = router;

