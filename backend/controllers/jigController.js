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

exports.getJigById = async (req, res) => {
  try {
    const { id } = req.params;
    const jig = await Jig.findById(id)
      .populate("category")
      .populate("weight")
      .populate("colors.color", "name slug");
    
    if (!jig) return res.status(404).json({message: "Product Not Found"});
    res.status(200).json(jig);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

exports.deleteJig = async (req, res) => {
  try {
    const { id } = req.params;
    const jig = await Jig.findByIdAndDelete(id);

    if (!jig) return res.status(404).json({message: "Product Not Found"});

    res.status(200).json({
      message: "Successfully deleted Product",
      id: jig._id,
    });
    
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

exports.deleteColor = async (req, res) => {
  try {
    const { id, colorId } = req.params;

    const jig = await Jig.findById(id);
    if (!jig) return res.status(404).json({ message: "Jig not found" });

    const initialLength = jig.colors.length;

    jig.colors = jig.colors.filter(c => c.color.toString() !== colorId);

    if (jig.colors.length === initialLength) {
      return res.status(404).json({ message: "Color not found" });
    }

    const updatedJig = await jig.save();

    const populatedJig = await Jig.findById(updatedJig._id)
      .populate("category")
      .populate("weight")
      .populate("colors.color", "name slug");

    res.status(200).json(populatedJig);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.patchJig = async (req, res) => {
  try {
    const { id } = req.params;
    const { colors, ...rest } = req.body;

    const allowedFields = ['name', 'description', 'price', 'category', 'weight'];
    const updatedFields = {};

    allowedFields.forEach(field => {
      if (rest[field] !== undefined) updatedFields[field] = rest[field];
    });

    updatedFields.updateAt = Date.now();

    const jig = await Jig.findById(id);
    if (!jig) return res.status(404).json({ message: "Jig not found" });

    Object.assign(jig, updatedFields);

    if (colors && Array.isArray(colors) && colors.length > 0) {
      colors.forEach(newColor => {
        if (!newColor.color) return;

        const existingColor = jig.colors.find(c => c.color.toString() === newColor.color);
        if (existingColor) {
          if (newColor.stock !== undefined) existingColor.stock = newColor.stock;
          if (newColor.image !== undefined) existingColor.image = newColor.image;
        } else {
          jig.colors.push(newColor);
        }
      });
    }

    const updatedJig = await jig.save();

    const populatedJig = await Jig.findById(updatedJig._id)
      .populate("category")
      .populate("weight")
      .populate("colors.color", "name slug");

    res.status(200).json(populatedJig);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
