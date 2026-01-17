const express = require("express");

const {
  createJigs,
  getJigs,
} = require("../controllers/jigController");

const router = express.Router();

router.post("/", createJigs);

router.get("/", getJigs);

module.exports = router;

