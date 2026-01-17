require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const uploadImageRoutes = require("./routes/uploadImageRoutes");
const productRoutes = require("./routes/productRoutes");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;


app.use(express.json());
app.use(cors());

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) =>{
  res.send("Sever is Running")
});

app.use("/images", express.static(path.join(__dirname, "uploads")));
app.use("/api/uploadImage", uploadImageRoutes);
app.use("/api/products", productRoutes);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
