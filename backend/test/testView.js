require("dotenv").config();
const axios = require("axios");

const PORT = process.env.PORT || 4000;
const SERVER_URL_ViEW = `http://localhost:${PORT}/api/jigs`;

(async () => {
  try {
    const res = await axios.get(SERVER_URL_ViEW);

    console.log("Products fetched:", res.data.length);
    res.data.forEach((product, i) => {
      console.log(`\nProduct ${i + 1}:`);
      console.log(`Name: ${product.name}`);
      console.log(`Price: $${product.price}`);
      console.log(`Category: ${product.category?.name || product.category}`);
      console.log(`Weight: ${product.weight?.label || product.weight}`);
      console.log("Colors:");
      if (product.colors && product.colors.length > 0) {
        product.colors.forEach((c) => {
          const colorName = c.color?.name || c.color;
          console.log(`  - ${colorName}`);
          console.log(`    Stock: ${c.stock}`);
          console.log("    Images:");
          c.image.forEach((img) => console.log(`      ${img}`));
        });
      } else {
        console.log("  No colors available");
      }
    });
  } catch (err) {
    if (err.response) {
      console.error("Error fetching products:", err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
})();