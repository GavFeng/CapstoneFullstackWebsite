const express = require("express");

const {
  getCart,
  addOrUpdateCartItem,
  clearCart,
  removeCartItem,
  removePurchasedItems,
  updateCart,
  mergeCart,
} = require("../controllers/cartController");


const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getCart);

router.post("/item", authMiddleware, addOrUpdateCartItem);

router.delete("/", authMiddleware, clearCart);

router.delete("/item", authMiddleware, removeCartItem);

router.post("/remove-purchased", authMiddleware, removePurchasedItems);

router.put("/", authMiddleware, updateCart);

router.get("/merge", authMiddleware, mergeCart);

module.exports = router;
