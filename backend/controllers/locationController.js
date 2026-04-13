const Location = require("../models/Location");

exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true }).sort({ name: 1 });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json(location);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(location);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};