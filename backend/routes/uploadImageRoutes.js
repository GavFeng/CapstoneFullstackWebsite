const express = require("express");
const upload = require("../config/multer");
const { uploadImage } = require("../controllers/uploadImageController");

const router = express.Router();

router.post("/", upload.single("product"), uploadImage);

module.exports = router;