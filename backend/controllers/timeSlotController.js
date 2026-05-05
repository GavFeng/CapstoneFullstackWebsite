const TimeSlot = require("../models/TimeSlot");

// Helper: Check if there are Overlaping Timeslots
  // Check if Existing slot: 
  // Starts after 'start' but before 'end'
  // Ends after 'start' but before/at 'end'
  // Slot is between an existing slot
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

// Create a Timeslot + Recurring time Slot
exports.createTimeSlots = async (req, res) => {
  try {
    const { location, slots } = req.body;

    // Check requested slots for conflicts
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
    // Bulk insert
    const newSlots = await TimeSlot.insertMany(formattedSlots);
    res.status(201).json(newSlots);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All TimeSlots that are not Full from a Location
exports.getAvailableSlots = async (req, res) => {
  try {
    const { locationId } = req.query;

    if (!locationId) {
      return res.status(400).json({ message: "locationId is required" });
    }

    // Find all active slots in the future for this location
    const slots = await TimeSlot.find({
      location: locationId,
      isActive: true,
      startTime: { $gt: new Date() } 
    }).sort({ startTime: 1 });

    // Filter full slots
    const availableSlots = slots.filter(slot => {
      const capacity = slot.capacity || 5; 
      return (slot.currentBookings || 0) < capacity;
    });

    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All TimeSlots
exports.getAllUpcomingSlots = async (req, res) => {
  try {
    const slots = await TimeSlot.find({
      isActive: true,
      startTime: { $gt: new Date() }
    })
    .populate('location', 'name') 
    .sort({ startTime: 1 })
    .limit(10);
    
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a Time Slot
exports.deleteTimeSlot = async (req, res) => {
  try {
    await TimeSlot.findByIdAndDelete(req.params.id);
    res.json({ message: "Slot removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


