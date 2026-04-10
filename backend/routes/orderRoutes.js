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
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

router.post("/", protect, createOrder);

router.get("/all-orders", protect, admin, getAllOrders);

router.get("/my-orders", protect, getUserOrders);

router.get("/:id", protect, getOrderById);

router.put("/:id/status", protect, admin, updateOrderStatus);

router.put("/:id/payment", protect, updatePaymentStatus);

router.delete("/:id", protect, admin, deleteOrder);

module.exports = router;