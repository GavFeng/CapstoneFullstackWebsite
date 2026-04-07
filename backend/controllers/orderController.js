const mongoose = require("mongoose");
const Jig = require("../models/Jig");
const User = require("../models/User");
const Category = require("../models/Category");
const Weight = require("../models/Weight");
const Color = require("../models/Color");
const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      items,
      deliveryMethod,
      shippingAddress,
      pickupDetails,
    } = req.body;

    if (!items || items.length === 0) {
      throw new Error("No order items");
    }

    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {

      const updateResult = await Jig.updateOne(
        {
          _id: item.jig,
          colors: {
            $elemMatch: {
              color: item.color,
              stock: { $gte: item.quantity },
            },
          },
        },
        {
          $inc: {
            "colors.$.stock": -item.quantity,
            "colors.$.sold": item.quantity,
          },
        },
        { session }
      );

      if (updateResult.modifiedCount === 0) {
        const err = new Error(`Not enough stock for ${jig.name}`);
        err.code = "OUT_OF_STOCK";
        throw err;
      }

      // ONLY fetch after success (optional)
      const jig = await Jig.findById(item.jig).session(session);

      const price = jig.price;

      calculatedTotal += price * item.quantity;

      validatedItems.push({
        jig: item.jig,
        color: item.color,
        quantity: item.quantity,
        price,
      });
    }

    const order = await Order.create(
      [
        {
          user: req.user._id,
          items: validatedItems,
          totalAmount: calculatedTotal,
          deliveryMethod,
          shippingAddress:
            deliveryMethod === "shipping" ? shippingAddress : undefined,
          pickupDetails:
            deliveryMethod === "pickup" ? pickupDetails : undefined,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(order[0]);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({ 
      message: error.message,
      code: error.code || "GENERAL_ERROR"
    });
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
