require("dotenv").config();
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");

const PORT = process.env.PORT || 4000;
const SERVER_UPLOAD = `http://localhost:${PORT}/api/uploadImage`;
const SERVER_ADD = `http://localhost:${PORT}/api/jigs`;


const Category = {
  dragon: "6968258a381988a99d57c675",
  cyber: "69682594381988a99d57c677"

}

const Weights = {
  w116: "696825dd381988a99d57c67a",
  w18: "69682603381988a99d57c67c",
  w14: "69682610381988a99d57c67e",
  w38: "69682651381988a99d57c680",
  w12: "69682666381988a99d57c682",
  w34: "69682671381988a99d57c684",
  w1: "6968267d381988a99d57c686"
};


const CategoryID = Category.dragon;
const WeightID = Weights.w38;

const Colors = {
  blue: "696ff0d4a27ae04f7dee6245",
  green: "696ff0eda27ae04f7dee6247",
  pink: "696ff10fa27ae04f7dee624b",
};

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
      price: 5,
      category: CategoryID,
      weight: WeightID,
      colors: [
        { color: Colors.blue, image: [uploadedImages.blue], stock: 5 },
        { color: Colors.green, image: [uploadedImages.green], stock: 5 },
        { color: Colors.pink, image: [uploadedImages.pink], stock: 5 },
      ],
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