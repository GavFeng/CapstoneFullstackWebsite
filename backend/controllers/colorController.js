const Color = require("../models/Color");

// Adding Color
exports.createColor = async (req, res) => {
  try {
    const color = await Color.create(req.body);
    res.status(201).json(color);
  } catch (err) {
    res.status(400).json({message: err.message});
  }
};

// Viewing All Color in DB
exports.getColors = async (req, res) => {
  try {
    const colors = await Color.find();
    res.json(colors);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

// Viewing a Color in DB
exports.getColorById = async (req, res) => {
  try {
    const { id } = req.params;
    const color = await Color.findById(id);
    if (!color) return res.status(404).json({message: "Color Not Found"});
    res.status(200).json(color);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

// Deleting a Color in DB
exports.deleteColor = async (req, res) => {
  try {
    const { id } = req.params;
    const color = await Color.findByIdAndDelete(id);

    if (!color) return res.status(404).json({message: "Color Not Found"});

    res.status(200).json({
      message: "Successfully deleted Color",
      id: color._id,
    });
    
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};