const express = require("express");

const {
  createCategory,
  getCategories,
  getCategoryById,
  deleteCategory,


} = require("../controllers/categoryController");

const router = express.Router();

router.post("/", createCategory);

router.get("/", getCategories);

router.get("/:id", getCategoryById);

router.delete("/:id", deleteCategory);


module.exports = router;

