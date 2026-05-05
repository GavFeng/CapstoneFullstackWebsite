const Location = require("../models/Location");
const TimeSlot = require("../models/TimeSlot");

// Get a Location
exports.getLocations = async (req, res) => {
  try {
    // Find Location
    const locations = await Location.find({ isActive: true }).sort({ name: 1 });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a Location
exports.createLocation = async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json(location);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a Location
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

// Check if a location name already exists
exports.checkLocationName = async (req, res) => {
  try {
    const { name } = req.query;
    // Attempt to find Location by Name
    const existing = await Location.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    res.json({ 
      exists: !!existing, 
      id: existing ? existing._id : null 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a location
exports.deleteLocation = async (req, res) => {
  try {
    const locationId = req.params.id;

    const location = await Location.findByIdAndDelete(locationId);
    
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    await TimeSlot.deleteMany({ location: locationId });

    res.json({ 
      message: "Location and all associated time slots deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};