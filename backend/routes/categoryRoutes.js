const express = require("express");

const {
  createCategory,
  getCategories,
  getCategoryByName,
  checkCategoryName,
  getCategoryById,
  deleteCategory,
  updateCategory
} = require("../controllers/categoryController");

const router = express.Router();

router.post("/", createCategory);

router.get("/", getCategories);

router.get("/name/:name", getCategoryByName);

router.get("/check-name", checkCategoryName);

router.get("/:id", getCategoryById);

router.delete("/:id", deleteCategory);

router.put("/:id", updateCategory);

module.exports = router;

