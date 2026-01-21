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
      message: "Sucessfully deleted Product",
      id: jig._id,
    });
    
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

exports.updateJig = async(req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category,
      weight,
      colors
    } = req.body;

    const allowedFields = ['name', 'description', 'price', 'category', 'weight', 'colors'];
    const updatedFields = {};

    allowedFields.forEach(field =>{
      if (req.body[field] !== undefined) updatedFields[field] = req.body[field]
    });

    updatedFields.updateAt = Date.now();

    const updateJig = await Jig.findByIdAndUpdate(
      id,
      updatedFields,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("category")
      .populate("weight")
      .populate("colors.color", "name slug");
    
      if (!updateJig) return res.status(404).json({message: "Product Not Found"});
      res.status(200).json(updateJig);

  } catch (err) {
    res.status(500).json({message: err.message});
  }
};
