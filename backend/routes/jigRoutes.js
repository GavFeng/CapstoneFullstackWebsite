const express = require("express");

const {
  createJig,
  getJigs,
  checkJigName,
  getJigById,
  deleteJig,
  deleteColor,
  patchJig,


} = require("../controllers/jigController");

const router = express.Router();

router.post("/", createJig);

router.get("/", getJigs);

router.get("/check-name", checkJigName);

router.get("/:id", getJigById);

router.delete("/:id", deleteJig);

router.delete("/:id/colors/:colorId", deleteColor);

router.patch("/:id", patchJig);

module.exports = router;

