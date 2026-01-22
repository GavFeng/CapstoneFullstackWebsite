const Category = require("../models/Category");

// Adding Category
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({message: err.message});
  }
};

// Viewing All Category in DB
exports.getCategories = async (req, res) => {
  try {
    const categorys = await Category.find();
    res.json(categorys);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

// Viewing a Category in DB
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({message: "Category Not Found"});
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

// Deleting a Category in DB
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) return res.status(404).json({message: "Category Not Found"});

    res.status(200).json({
      message: "Successfully deleted Category",
      id: category._id,
    });
    
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};