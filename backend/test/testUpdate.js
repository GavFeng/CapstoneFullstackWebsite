require("dotenv").config();
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");

const PORT = process.env.PORT || 4000;
const JIG_ID = "6970660e056ecf30b240fab9";

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

const Colors = {
  blue: "696ff0d4a27ae04f7dee6245",
  green: "696ff0eda27ae04f7dee6247",
  orange: "696ff101a27ae04f7dee6249",
  pink: "696ff10fa27ae04f7dee624b",
};

const CategoryID = Category.dragon;
const WeightID = Weights.w34;

const imagesToUpload = {
  blue: "blue_14.jpg",
  green: "green_14.jpg",
};
const SERVER_UPLOAD = `http://localhost:${PORT}/api/uploadImage`;
const SERVER_URL_UPDATE = `http://localhost:${PORT}/api/jigs/${JIG_ID}`;

async function uploadImage(imageName) {
  const imagePath = path.join(__dirname, "test_images", imageName);
  const form = new FormData();
  form.append("image", fs.createReadStream(imagePath));

  const res = await axios.post(SERVER_UPLOAD, form, {
    headers: form.getHeaders(),
  });

  // Return full URL for jig update
  return `http://localhost:${PORT}${res.data.image_url}`;
}

(async () => {
  try {
    // 1️⃣ Upload all images first
    const uploadedImages = {};
    for (const [color, filename] of Object.entries(imagesToUpload)) {
      uploadedImages[color] = await uploadImage(filename);
      console.log(`Uploaded ${color}: ${uploadedImages[color]}`);
    }

    // 2️⃣ Build the updated jig object
    const updateJigBody = {
      name: "Updated Squid Jig",
      description: "This is a updated description",
      price: 7,
      category: CategoryID,
      weight: WeightID,
      colors: [
        { color: Colors.blue, image: [uploadedImages.blue], stock: 25 },
        { color: Colors.green, image: [uploadedImages.green], stock: 15 },
      ],
    };

    // 3️⃣ Send PUT request to fully update the jig
    const res = await axios.put(SERVER_URL_UPDATE, updateJigBody);
    console.log("Jig updated:");
    console.log(res.data);

  } catch (err) {
    if (err.response) {
      console.error("Error:", err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
})();