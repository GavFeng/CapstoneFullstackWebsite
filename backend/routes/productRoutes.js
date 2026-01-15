const express = require("express");

const {
  createProducts,
  getProducts,
} = require("../controllers/productController");

const router = express.Router();

router.post("/", createProducts);

router.get("/", getProducts);

module.exports = router;

