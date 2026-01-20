const Jig = require("../models/Jig");
const Category = require("../models/Category");
const Weight = require("../models/Weight");
const Color = require("../models/Color");
//Adding Jig
exports.createJigs = async (req, res) => {
  try {
    const jig = await Jig.create(req.body);
    res.status(201).json(jig);
  } catch (err) {
    res.status(400).json({message: err.message});
  }
};

//Viewing All Jigs to DB
exports.getJigs = async (req, res) => {
  try {
    const jigs = await Jig.find()
      .populate("category")
      .populate("weight")
      .populate("colors.color", "name slug");
    res.json(jigs);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};
