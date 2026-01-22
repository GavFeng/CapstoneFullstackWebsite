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


const jigTestCase1 = {
  name: "Updated Squid Jig",
  description: "Dragon, weight 14, basic colors + Jig Test Case 1",
  price: 10,
  category: Category.dragon,
  weight: Weights.w14,
  colors: [
    { color: Colors.blue, image: ["blue_14.jpg"], stock: 25 },
    { color: Colors.green, image: ["green_14.jpg"], stock: 5 },
    { color: Colors.pink, image: ["pink_14.jpg"], stock: 10 },
  ],
};

const jigTestCase2 = {
  name: "New Updated Squid Jig",
  description: "Cyber, weight 14, basic colors + Jig Test Case 2",
  price: 5,
  category: Category.cyber,
  weight: Weights.w14,
};


const jigTestCase3 = {
  description: "Cyber, weight 14, basic colors + Jig Test Case 3",
  colors: [
    { color: Colors.blue, stock: 250 },
    { color: Colors.green, stock: 500 },
    { color: Colors.pink, stock: 100 },
  ],
};

const jigTestCase4 = {
  description: "Cyber, weight 34, basic colors + Jig Test Case 4",
  weight: Weights.w34,
  colors: [
    { color: Colors.blue, image: ["blue_34.jpg"]},
    { color: Colors.green, image: ["green_34.jpg"]},
    { color: Colors.pink, image: ["pink_34.jpg"]},
  ],
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
  return `http://localhost:${PORT}${res.data.image_url}`;
}

async function patchJig(jigBody) {
  for (const colorObj of jigBody.colors || []) {
    if (colorObj.image && colorObj.image.length) {
      const uploadedImages = [];
      for (const img of colorObj.image) {
        const url = await uploadImage(img);
        uploadedImages.push(url);
      }
      colorObj.image = uploadedImages;
    }
  }

  // Send PATCH request
  const res = await axios.patch(SERVER_URL_UPDATE, jigBody);
  console.log(`Jig "${jigBody.name}" updated:`);
  console.log(res.data);
}


(async () => {
  try {
    await patchJig(jigTestCase4);
  } catch (err) {
    if (err.response) {
      console.error("Error:", err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
})();