const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads";

if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
     cb(null, Date.now() + "-" + Math.floor(Math.random() * 1000) + path.extname(file.originalname));
  }
});


const upload = multer({ storage });

module.exports = upload;