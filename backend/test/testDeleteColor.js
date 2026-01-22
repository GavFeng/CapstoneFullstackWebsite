require("dotenv").config();
const axios = require("axios");

const PORT = process.env.PORT || 4000;
const JIG_ID = "6970660e056ecf30b240fab9";

const Colors = {
  blue: "696ff0d4a27ae04f7dee6245",
  green: "696ff0eda27ae04f7dee6247",
  orange: "696ff101a27ae04f7dee6249",
  pink: "696ff10fa27ae04f7dee624b",
};

const COLOR_ID = Colors.orange;


const SERVER_URL_DELETE_COLOR = `http://localhost:${PORT}/api/jigs/${JIG_ID}/colors/${COLOR_ID}`;

(async () => {
  try {
    const res = await axios.delete(SERVER_URL_DELETE_COLOR);
    console.log("Updated Jig after color deletion:");
    console.log(res.data);
  } catch (err) {
    if (err.response) {
      console.error("Error:", err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
})();