const express = require("express");

const {
  createCategory,
  getCategories,
  checkCategoryName,
  getCategoryById,
  deleteCategory,


} = require("../controllers/categoryController");

const router = express.Router();

router.post("/", createCategory);

router.get("/", getCategories);

router.get("/check-name", checkCategoryName);

router.get("/:id", getCategoryById);

router.delete("/:id", deleteCategory);


module.exports = router;

