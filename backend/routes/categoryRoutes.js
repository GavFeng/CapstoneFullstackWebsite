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

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");


router.post("/", authMiddleware, adminMiddleware,  createCategory);

router.get("/", getCategories);

router.get("/name/:name", getCategoryByName);

router.get("/check-name", checkCategoryName);

router.get("/:id", getCategoryById);

router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

router.put("/:id", authMiddleware, adminMiddleware, updateCategory);

module.exports = router;

