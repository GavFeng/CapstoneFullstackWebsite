const Weight = require("../models/Weight");

// Adding Weight
exports.createWeight = async (req, res) => {
  try {
    const weight = await Weight.create(req.body);
    res.status(201).json(weight);
  } catch (err) {
    res.status(400).json({message: err.message});
  }
};

// Viewing All Weight in DB
exports.getWeights = async (req, res) => {
  try {
    const weights = await Weight.find();
    res.json(weights);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

// Viewing a Weight in DB
exports.getWeightById = async (req, res) => {
  try {
    const { id } = req.params;
    const weight = await Weight.findById(id);
    if (!weight) return res.status(404).json({message: "Weight Not Found"});
    res.status(200).json(weight);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

// Deleting a Weight in DB
exports.deleteWeight = async (req, res) => {
  try {
    const { id } = req.params;
    const weight = await Weight.findByIdAndDelete(id);

    if (!weight) return res.status(404).json({message: "Weight Not Found"});

    res.status(200).json({
      message: "Successfully deleted Weight",
      id: weight._id,
    });
    
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

// Check if Weight Exists
exports.checkWeightLabel = async (req, res) => {
  try {
    const { label, value } = req.query;
    if (!label && !value) return res.status(400).json({ exists: false });

    const exists = await Weight.findOne({
      $or: [
        { label: new RegExp(`^${label.trim()}$`, 'i') },
        { value: value ? Number(value) : undefined }
      ].filter(Boolean)
    });

    res.json({ exists: !!exists });
  } catch (err) {
    console.error(err);
    res.status(500).json({ exists: false });
  }
};