const Product = require("../models/Product");
const Category = require("../models/Category");
const Weight = require("../models/Weight");

exports.createProducts = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({message: err.message});
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .populate("weight");
    res.json(products);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};
