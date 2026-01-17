require("dotenv").config();
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");

const PORT = process.env.PORT || 4000;

const SERVER_URL_UPLOAD = `http://localhost:${PORT}/api/uploadImage`;

const imageName = "pink_14.jpg"; 
const imagePath = path.join(__dirname, "test_images", imageName);

const form = new FormData();
form.append("image", fs.createReadStream(imagePath)); 

axios
  .post(SERVER_URL_UPLOAD, form, { headers: form.getHeaders() })
  .then(response => {
    const relativePath = response.data.image_url || response.data.path || "";
    const fullURL = `http://localhost:${PORT}${relativePath}`;
    console.log(`Uploaded ${imageName}`);
    console.log(`URL: ${fullURL}`);
  })
  .catch(err => {
    if (err.response) {
      console.error(`Error uploading ${imageName}:`, err.response.data);
    } else {
      console.error(`Error uploading ${imageName}:`, err.message);
    }
  });