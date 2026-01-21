require("dotenv").config();
const axios = require("axios");

const PORT = process.env.PORT || 4000;
const SERVER_URL_DELETE = `http://localhost:${PORT}/api/jigs`;

const PRODUCT_ID = "69704497f0f370a1df432b45";

(async () => {
  try {
    const res = await axios.delete(`${SERVER_URL_DELETE}/${PRODUCT_ID}`);
    console.log("Deleted:", res.data);
  } catch (err) {
    if (err.response) {
      console.error("Error:", err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
})();