require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const uploadImageRoutes = require("./routes/uploadImageRoutes");
const jigRoutes = require("./routes/jigRoutes");
const colorRoutes = require("./routes/colorRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const weightRoutes = require("./routes/weightRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const locationRoutes = require("./routes/locationRoutes");
const timeSlotRoutes = require("./routes/timeSlotRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Check if Server is running
app.get("/", (req, res) =>{
  res.send("Sever is Running")
});

// Routes
app.use("/api/uploadImage", uploadImageRoutes);
app.use("/api/jigs", jigRoutes);
app.use("/api/colors", colorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/weights", weightRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/timeSlots", timeSlotRoutes);
app.use("/api/analytics", analyticsRoutes);

// Connect to DB + Start Server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
