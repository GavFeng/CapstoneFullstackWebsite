require("dotenv").config();
const axios = require("axios");

const PORT = process.env.PORT || 4000;
const SERVER_URL_ViEW = `http://localhost:${PORT}/api/products`;

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
      if (product.colors) {
        for (const [color, details] of Object.entries(product.colors)) {
          console.log(`  - ${color}`);
          console.log(`    Stock: ${details.stock}`);
          console.log(`    Images:`);
          details.image.forEach((img) => console.log(`${img}`));
        }
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