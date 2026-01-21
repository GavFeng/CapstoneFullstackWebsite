const express = require("express");

const {
  createJigs,
  getJigs,
  getJigById,
  deleteJig,
  updateJig,

} = require("../controllers/jigController");

const router = express.Router();

router.post("/", createJigs);

router.get("/", getJigs);

router.get("/:id", getJigById);

router.delete("/:id", deleteJig);

router.put("/:id", updateJig);

module.exports = router;

