const express = require("express");

const {
  getCart,
  addOrUpdateCartItem,
  clearCart,
  removeCartItem,
  removePurchasedItems,
  updateCart,
  mergeCart,
  saveForLater,
  moveToCart,
  removeSavedItem
} = require("../controllers/cartController");


const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


router.get("/", authMiddleware, getCart);

router.post("/item", authMiddleware, addOrUpdateCartItem);

router.delete("/", authMiddleware, clearCart);

router.delete("/item", authMiddleware, removeCartItem);

router.post("/remove-purchased", authMiddleware, removePurchasedItems);

router.put("/", authMiddleware, updateCart);

router.post("/merge", authMiddleware, mergeCart);

router.post('/save-for-later', authMiddleware, saveForLater);

router.post('/move-to-cart', authMiddleware, moveToCart);

router.delete('/saved-item', authMiddleware, removeSavedItem);

module.exports = router;
