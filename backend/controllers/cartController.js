const Jig = require("../models/Jig");
const User = require("../models/User");
const Color = require("../models/Color");
const Cart = require("../models/Cart");

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate([
      { path: "items.jig", select: "name price" },
      { path: "items.color", select: "name" }
    ]);

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.addOrUpdateCartItem = async (req, res) => {
  const { jig, color, quantity } = req.body;

  if (!jig || !color || quantity == null) {
    return res.status(400).json({ message: "Missing jig, color or quantity" });
  }

  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (i) => i.jig.toString() === jig && i.color.toString() === color
    );

    if (existingIndex !== -1) {
      if (quantity <= 0) {
        cart.items.splice(existingIndex, 1);
      } else {
        cart.items[existingIndex].quantity = quantity;
      }
    } else if (quantity > 0) {
      cart.items.push({ jig, color, quantity });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    await cart.populate([
      { path: "items.jig", select: "name price" },
      { path: "items.color", select: "name" },
    ]);

    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeCartItem = async (req, res) => {
  const { jig, color } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.json({ items: [] });

    cart.items = cart.items.filter(
      (i) => !(i.jig.toString() === jig && i.color.toString() === color)
    );

    cart.updatedAt = Date.now();
    await cart.save();

    await cart.populate([
      { path: "items.jig", select: "name price" },
      { path: "items.color", select: "name" },
    ]);

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateCart = async (req, res) => {
  const { items } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id });
    }

    cart.items = items;
    cart.updatedAt = Date.now();
    await cart.save();

    await cart.populate([
      { path: "items.jig", select: "name price" },
      { path: "items.color", select: "name" }
    ]);

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.mergeCart = async (req, res) => {
  const { localItems } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id });

    const itemMap = new Map();

    cart.items.forEach(item => {
      const key = `${item.jig}-${item.color}`;
      itemMap.set(key, { ...item.toObject(), _id: item._id });
    });

    localItems.forEach(li => {
      const key = `${li.jig}-${li.color}`;
      if (itemMap.has(key)) {
        itemMap.get(key).quantity += li.quantity;
      } else {
        itemMap.set(key, li);
      }
    });

    cart.items = Array.from(itemMap.values());
    await cart.save();

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Merge failed" });
  }
};