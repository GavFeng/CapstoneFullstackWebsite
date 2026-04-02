const Jig = require("../models/Jig");
const User = require("../models/User");
const Category = require("../models/Category");
const Weight = require("../models/Weight");
const Color = require("../models/Color");
const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      deliveryMethod,
      shippingAddress,
      pickupDetails,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    if (deliveryMethod === "shipping" && !shippingAddress) {
      return res.status(400).json({ message: "Shipping address required" });
    }

    if (deliveryMethod === "pickup" && !pickupDetails) {
      return res.status(400).json({ message: "Pickup details required" });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      deliveryMethod,
      shippingAddress:
        deliveryMethod === "shipping" ? shippingAddress : undefined,
      pickupDetails:
        deliveryMethod === "pickup" ? pickupDetails : undefined,
    });

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json(orders);
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.jig")
      .populate("items.color")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.jig")
      .populate("items.color")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check Ownership
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.accountType !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status || order.status;

    const updated = await order.save();
    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ownership OR admin
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.accountType !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.paymentStatus = paymentStatus || order.paymentStatus;

    const updated = await order.save();
    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.deleteOne();

    res.json({ message: "Order removed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};