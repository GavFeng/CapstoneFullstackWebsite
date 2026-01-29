const Jig = require("../models/Jig");
const Category = require("../models/Category");
const Weight = require("../models/Weight");
const Color = require("../models/Color");

// Adding Jig
exports.createJig = async (req, res) => {
  try {
    const name = req.body.name.trim().toLowerCase();
    const existingJig = await Jig.findOne({ name });

    if (existingJig) {
      return res.status(400).json({
        message: "Name already exists",
      });
    }
    
    // Get Color Order
    const allColors = await Color.find().sort({ name: 1 }); 
    const colorOrder = allColors.map(c => c._id.toString());

    // Sort in color order
    let sortedColors = req.body.colors || [];
    sortedColors = sortedColors.sort(
      (a, b) => colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color)
    );

    const jig = await Jig.create({
      ...req.body,
      name,
      colors: sortedColors,
    });

    res.status(201).json(jig);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// Viewing All Jigs in DB
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

// Viewing a Jig in DB
exports.getJigById = async (req, res) => {
  try {
    const { id } = req.params;
    const jig = await Jig.findById(id)
      .populate("category")
      .populate("weight")
      .populate("colors.color", "name slug");
    
    if (!jig) return res.status(404).json({message: "Jig Not Found"});
    res.status(200).json(jig);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

// Deleting a Jig in DB
exports.deleteJig = async (req, res) => {
  try {
    const { id } = req.params;
    const jig = await Jig.findByIdAndDelete(id);

    if (!jig) return res.status(404).json({message: "Jig Not Found"});

    res.status(200).json({
      message: "Successfully deleted Jig",
      id: jig._id,
    });
    
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

// Deleting a color of a Jig in DB
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

// Patching a Jig in DB
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

    // Update simple fields
    Object.assign(jig, updatedFields);

    // Handle colors
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

      // Fetch all colors from DB to get canonical order
      const allColors = await Color.find().sort({ name: 1 });
      const colorOrder = allColors.map(c => c._id.toString());

      // Sort jig colors according to canonical order
      jig.colors = jig.colors.sort(
        (a, b) => colorOrder.indexOf(a.color.toString()) - colorOrder.indexOf(b.color.toString())
      );
    }

    const updatedJig = await jig.save();

    const populatedJig = await Jig.findById(updatedJig._id)
      .populate("category")
      .populate("weight")
      .populate("colors.color", "name slug");

    res.status(200).json(populatedJig);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


exports.checkJigName = async (req, res) => {
  try {
    const name = req.query.name?.trim().toLowerCase();
    if (!name) return res.json({ exists: false });

    const existingJig = await Jig.findOne({ name });
    res.json({ exists: !!existingJig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ exists: false, message: err.message });
  }
};