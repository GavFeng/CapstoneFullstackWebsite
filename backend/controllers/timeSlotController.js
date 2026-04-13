const TimeSlot = require("../models/TimeSlot");

const checkOverlap = async (location, start, end) => {
  return await TimeSlot.findOne({
    location,
    isActive: true,
    $or: [
      { startTime: { $lt: end, $gte: start } },
      { endTime: { $gt: start, $lte: end } },  
      { startTime: { $lte: start }, endTime: { $gte: end } } 
    ]
  });
};

exports.createTimeSlots = async (req, res) => {
  try {
    const { location, slots } = req.body;

    for (const slot of slots) {
      const start = new Date(slot.startTime);
      const end = new Date(slot.endTime);

      const overlap = await checkOverlap(location, start, end);
      if (overlap) {
        return res.status(400).json({
          message: `Overlap detected for slot ${start.toLocaleString()}.`,
          conflictingSlot: overlap
        });
      }
    }

    const formattedSlots = slots.map(slot => ({
      location,
      startTime: new Date(slot.startTime),
      endTime: new Date(slot.endTime),
      capacity: slot.capacity || 5,
      currentBookings: 0
    }));

    const newSlots = await TimeSlot.insertMany(formattedSlots);
    res.status(201).json(newSlots);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { locationId } = req.query;

    if (!locationId) {
      return res.status(400).json({ message: "locationId is required" });
    }

    const slots = await TimeSlot.find({
      location: locationId,
      isActive: true,
      startTime: { $gt: new Date() } 
    }).sort({ startTime: 1 });

    const availableSlots = slots.filter(slot => {
      const capacity = slot.capacity || 5; 
      return (slot.currentBookings || 0) < capacity;
    });

    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.deleteTimeSlot = async (req, res) => {
  try {
    await TimeSlot.findByIdAndDelete(req.params.id);
    res.json({ message: "Slot removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
