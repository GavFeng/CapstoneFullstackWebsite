const express = require("express");

const {
  getCart,
  addOrUpdateCartItem,
  removeCartItem,
  updateCart,
  mergeCart,
} = require("../controllers/cartController");


const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getCart);

router.post("/item", authMiddleware, addOrUpdateCartItem);

router.delete("/item", authMiddleware, removeCartItem);

router.put("/", authMiddleware, updateCart);

router.get("/merge", authMiddleware, mergeCart);

module.exports = router;
