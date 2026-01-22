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

exports.patchJig = async(req, res) => {
  try {
    const { id } = req.params;
    const { colors, ...rest } = req.body;

    const allowedFields = ['name', 'description', 'price', 'category', 'weight'];
    const updatedFields = {};

    allowedFields.forEach(field =>{
      if (rest[field] !== undefined) updatedFields[field] = rest[field];
    });

    updatedFields.updateAt = Date.now();

    let updateQuery = { $set: updatedFields };

    if (colors !== undefined && Array.isArray(colors) && colors.length > 0) {
      const partialColors = colors.filter(c => c.color && (c.stock !== undefined || c.image !== undefined));

      if (partialColors.length > 0){
        const arrayFilters = partialColors.map((c, idx) => ({
          [`c${idx}.color`]: c.color
        }));

        partialColors.forEach((c, idx) => {
          if (c.stock !== undefined) updateQuery.$set[`colors.$[c${idx}].stock`] = c.stock;
          if (c.image !== undefined) updateQuery.$set[`colors.$[c${idx}].image`] = c.image;
        });

        const updatedJig = await Jig.findByIdAndUpdate(
          id,
          updateQuery,
          {
            new: true,
            runValidators: true,
            arrayFilters
          }
        )
          .populate("category")
          .populate("weight")
          .populate("colors.color", "name slug");

        if (!updatedJig) return res.status(404).json({ message: "Jig not found" });
        return res.status(200).json(updatedJig);

      } else {
        updateQuery.$set.colors = colors;
      }
    }
    const updateJig = await Jig.findByIdAndUpdate(
      id,
      updateQuery,
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
