const Jig = require("../models/Jig");
const User = require("../models/User");
const Color = require("../models/Color");
const Cart = require("../models/Cart");

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate([
      { path: "items.jig", select: "name price" },
      { path: "items.color", select: "name" },
      { path: "savedItems.jig", select: "name price" },
      { path: "savedItems.color", select: "name" },
    ]);

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        savedItems: [],
      });
    }

    res.json(cart);
  } catch (err) {
    console.error(err);
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

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.json({ items: [] });
    }

    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({ items: [] });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear cart" });
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

exports.removePurchasedItems = async (req, res) => {
  const { items } = req.body; // [{ jig, color }]

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.json({ items: [] });

    cart.items = cart.items.filter((cartItem) => {
      return !items.some(
        (i) =>
          i.jig === cartItem.jig.toString() &&
          i.color === cartItem.color.toString()
      );
    });

    cart.updatedAt = Date.now();
    await cart.save();

    await cart.populate([
      { path: "items.jig", select: "name price" },
      { path: "items.color", select: "name" },
    ]);

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to remove purchased items" });
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

exports.saveForLater = async (req, res) => {
  const { jig, color } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Find in cart
    const itemIndex = cart.items.findIndex(
      i => i.jig.toString() === jig && i.color.toString() === color
    );

    if (itemIndex === -1) return res.status(404).json({ message: "Item not in cart" });

    const itemToSave = cart.items[itemIndex];

    // Remove from cart
    cart.items.splice(itemIndex, 1);

    // Add to savedItems (avoid duplicates)
    const alreadySaved = cart.savedItems.some(
      i => i.jig.toString() === jig && i.color.toString() === color
    );

    if (!alreadySaved) {
      cart.savedItems.push(itemToSave);
    }

    cart.updatedAt = Date.now();
    await cart.save();

    await cart.populate([
      { path: "items.jig", select: "name price" },
      { path: "items.color", select: "name" },
      { path: "savedItems.jig", select: "name price" },
      { path: "savedItems.color", select: "name" },
    ]);

    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.moveToCart = async (req, res) => {
  const { jig, color, quantity = 1 } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const savedIndex = cart.savedItems.findIndex(
      i => i.jig.toString() === jig && i.color.toString() === color
    );

    if (savedIndex === -1) return res.status(404).json({ message: "Item not saved" });

    const savedItem = cart.savedItems[savedIndex];
    const finalQty = quantity || savedItem.quantity;

    // Remove from saved
    cart.savedItems.splice(savedIndex, 1);

    // Add to active cart (or update quantity)
    const existingIndex = cart.items.findIndex(
      i => i.jig.toString() === jig && i.color.toString() === color
    );

    if (existingIndex !== -1) {
      cart.items[existingIndex].quantity += finalQty;
    } else {
      cart.items.push({ jig, color, quantity: finalQty });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    await cart.populate([
      { path: "items.jig", select: "name price" },
      { path: "items.color", select: "name" },
      { path: "savedItems.jig", select: "name price" },
      { path: "savedItems.color", select: "name" },
    ]);

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeSavedItem = async (req, res) => {
  const { jig, color } = req.body;

  if (!jig || !color) {
    return res.status(400).json({ message: "Missing jig or color" });
  }

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const initialLength = cart.savedItems.length;

    cart.savedItems = cart.savedItems.filter(
      (item) =>
        item.jig.toString() !== jig.toString() ||
        item.color.toString() !== color.toString()
    );

    if (cart.savedItems.length === initialLength) {
      return res.status(404).json({ message: "Saved item not found" });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    await cart.populate([
      { path: "items.jig", select: "name price" },
      { path: "items.color", select: "name" },
      { path: "savedItems.jig", select: "name price" },
      { path: "savedItems.color", select: "name" },
    ]);

    res.json(cart);
  } catch (err) {
    console.error("Remove saved item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};