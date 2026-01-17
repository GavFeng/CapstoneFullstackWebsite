require("dotenv").config();
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");

const PORT = process.env.PORT || 4000;
const SERVER_UPLOAD = `http://localhost:${PORT}/api/uploadImage`;
const SERVER_ADD = `http://localhost:${PORT}/api/jigs`;

const dragon = "6968258a381988a99d57c675";
const cyber = "69682594381988a99d57c677";

const w116 = "696825dd381988a99d57c67a";
const w18 = "69682603381988a99d57c67c";
const w14 = "69682610381988a99d57c67e";
const w38 = "69682651381988a99d57c680";
const w12 = "69682666381988a99d57c682";
const w34 = "69682671381988a99d57c684";
const w1 = "6968267d381988a99d57c686";

const CategoryID = cyber;
const WeightID = w38;

const imagesToUpload = {
  blue: "blue_38.jpg",
  green: "green_38.jpg",
  pink: "pink_38.jpg",
};

async function uploadImage(imageName) {
  const imagePath = path.join(__dirname, "test_images", imageName);
  const form = new FormData();
  form.append("image", fs.createReadStream(imagePath));

  const res = await axios.post(SERVER_UPLOAD, form, {
    headers: form.getHeaders(),
  });

  return `http://localhost:${PORT}${res.data.image_url}`;
}

(async () => {
  try {
    const uploadedImages = {};

    for (const [color, filename] of Object.entries(imagesToUpload)) {
      uploadedImages[color] = await uploadImage(filename);
      console.log(`Uploaded ${color}: ${uploadedImages[color]}`);
    }

    const testJig = {
      name: "Test Squid Jig 6",
      description: "A Test Description giving information about the Jig",
      price: 6,
      category: CategoryID,
      weight: WeightID,
      colors: {
        blue: { image: [uploadedImages.blue], stock: 5 },
        green: { image: [uploadedImages.green], stock: 5 },
        pink: { image: [uploadedImages.pink], stock: 5 },
      },
    };

    const jigRes = await axios.post(SERVER_ADD, testJig);
    console.log("Jig created:");
    console.log(jigRes.data);
  } catch (err) {
    if (err.response) {
      console.error("Error:", err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
})();