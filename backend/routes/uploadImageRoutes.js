const express = require("express");
const upload = require("../config/multer");
const { uploadImage } = require("../controllers/uploadImageController");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/", authMiddleware, adminMiddleware,  upload.single("image"), uploadImage);

module.exports = router;