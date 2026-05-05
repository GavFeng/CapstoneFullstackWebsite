const express = require("express");

const {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} = require("../controllers/orderController");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/", authMiddleware, createOrder);

router.get("/all-orders", authMiddleware, adminMiddleware, getAllOrders);

router.get("/my-orders", authMiddleware, getUserOrders);

router.get("/:id", authMiddleware, getOrderById);

router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);

router.put("/:id/payment", authMiddleware, updatePaymentStatus);

router.delete("/:id", authMiddleware, adminMiddleware, deleteOrder);

module.exports = router;