require("dotenv").config();
const axios = require("axios");

const PORT = process.env.PORT || 4000;
const JIG_ID = "697040e9f0f370a1df432b2c";

const SERVER_URL_VIEW = `http://localhost:${PORT}/api/jigs/${JIG_ID}`;

(async () => {
  try {
    const res = await axios.get(SERVER_URL_VIEW);
    const product = res.data;

    console.log("Single Jig Fetched:");
    console.log(`Name: ${product.name}`);
    console.log(`Price: $${product.price}`);
    console.log(`Category: ${product.category?.name || product.category}`);
    console.log(`Weight: ${product.weight?.label || product.weight}`);
    console.log("Colors:");

    if (product.colors && product.colors.length > 0) {
      product.colors.forEach((c) => {
        console.log(`  - ${c.color?.name || c.color}`);
        console.log(`    Stock: ${c.stock}`);
        console.log("    Images:");
        c.image.forEach((img) => console.log(`      ${img}`));
      });
    } else {
      console.log("  No colors available");
    }

  } catch (err) {
    if (err.response) {
      console.error("Error fetching jig:", err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
})();