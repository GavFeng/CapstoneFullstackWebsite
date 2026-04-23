const mongoose = require("mongoose");
const Jig = require("../models/Jig");
const User = require("../models/User");
const Order = require("../models/Order");
const TimeSlot = require("../models/TimeSlot");
const Location = require("../models/Location");


// Helper: Formats the Date and Time for the snapshot
const formatSlotString = (slot) => {
  const dateOptions = { weekday: "long", month: "short", day: "numeric" };
  const datePart = slot.startTime.toLocaleDateString("en-US", dateOptions);
  const startPart = slot.startTime.getHours().toString().padStart(2, "0") + ":00";
  const endPart = slot.endTime.getHours().toString().padStart(2, "0") + ":00";
  return `${datePart} between ${startPart} - ${endPart}`;
};

// Create new order with Stock and TimeSlot validation
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, deliveryMethod, shippingAddress, pickupDetails } = req.body;

    if (!items || items.length === 0) throw new Error("No order items provided");

    let calculatedTotal = 0;
    const validatedItems = [];

    // VALIDATE JIG STOCK & UPDATE (In Transaction)
    for (const item of items) {
      const jig = await Jig.findById(item.jig).session(session);
      if (!jig) throw new Error(`Product not found`);

      const updateResult = await Jig.updateOne(
        {
          _id: item.jig,
          colors: {
            $elemMatch: { color: item.color, stock: { $gte: item.quantity } },
          },
        },
        { $inc: { "colors.$.stock": -item.quantity, "colors.$.sold": item.quantity } },
        { session }
      );

      if (updateResult.modifiedCount === 0) {
        const err = new Error(`Not enough stock for ${jig.name}`);
        err.code = "OUT_OF_STOCK";
        throw err;
      }

      calculatedTotal += jig.price * item.quantity;
      validatedItems.push({
        jig: item.jig,
        color: item.color,
        quantity: item.quantity,
        price: jig.price,
      });
    }

    // VALIDATE TIMESLOT & LOCATION (If Pickup)
    let finalPickupDetails = undefined;

    if (deliveryMethod === "pickup") {
      if (!pickupDetails?.timeSlot || !pickupDetails?.location) {
        throw new Error("Pickup location and time slot are required for pickup orders.");
      }
      
      // Check capacity and increment bookings in one go
      const updatedSlot = await TimeSlot.findOneAndUpdate(
        {
          _id: pickupDetails.timeSlot,
          location: pickupDetails.location,
          isActive: true,
          $expr: { $lt: ["$currentBookings", "$capacity"] },
        },
        { $inc: { currentBookings: 1 } },
        { session, new: true }
      ).populate("location");

      if (!updatedSlot) {
        throw new Error("Time slot is full, invalid, or belongs to another store.");
      }

      finalPickupDetails = {
        location: updatedSlot.location._id,
        timeSlot: updatedSlot._id,
        locationNameSnapshot: updatedSlot.location.name,
        timeSlotSnapshot: formatSlotString(updatedSlot),
        addressSnapshot: updatedSlot.location.address,
        citySnapshot: updatedSlot.location.city,
        stateSnapshot: updatedSlot.location.state,
        zipSnapshot: updatedSlot.location.zip,
        phoneSnapshot: updatedSlot.location.phone,
        pickupCode: Math.random().toString(36).substring(7).toUpperCase(),
      };
    }

    // CREATE ORDER
    const order = await Order.create(
      [
        {
          user: req.user._id,
          items: validatedItems,
          totalAmount: calculatedTotal,
          deliveryMethod,
          shippingAddress: deliveryMethod === "shipping" ? shippingAddress : undefined,
          pickupDetails: finalPickupDetails,
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
    res.status(400).json({ message: error.message, code: error.code || "ORDER_FAILED" });
  }
};

// Update order status + TimeSlot
exports.updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    if (status === 'completed') {
      order.paymentStatus = 'paid';
    }

    if (status === "cancelled" && order.status !== "cancelled") {
      
      for (const item of order.items) {
        await Jig.updateOne(
          {
            _id: item.jig,
            "colors.color": item.color, // Find the specific color
          },
          { 
            $inc: { 
              "colors.$.stock": item.quantity,   // Put stock back
              "colors.$.sold": -item.quantity    // Reduce sold count
            } 
          },
          { session }
        );
      }

      if (order.deliveryMethod === "pickup" && order.pickupDetails?.timeSlot) {
        await TimeSlot.findByIdAndUpdate(
          order.pickupDetails.timeSlot, 
          { $inc: { currentBookings: -1 } },
          { session }
        );
      }
    }

    order.status = status || order.status;
    const updated = await order.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.json(updated);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("items.jig")
      .populate("items.color")
      .populate({
        path: 'pickupDetails.timeSlot',
        model: 'TimeSlot'
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// Get My Orders (User)
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

//Get Single Order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.jig")
      .populate("items.color")
      .populate("user", "name email phone");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Authorization Check
    if (order.user._id.toString() !== req.user._id.toString() && req.user.accountType !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Payment Status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString() && req.user.accountType !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.paymentStatus = paymentStatus || order.paymentStatus;
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "cancelled" && order.deliveryMethod === "pickup" && order.pickupDetails?.timeSlot) {
      await TimeSlot.findByIdAndUpdate(order.pickupDetails.timeSlot, {
        $inc: { currentBookings: -1 },
      });
    }

    await order.deleteOne();
    res.json({ message: "Order removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};