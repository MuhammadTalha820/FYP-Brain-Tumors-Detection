// Load environment variables from .env file
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const predictRoutes = require("./routes/Prediction");

const app = express();

app.use(express.json());
app.use(cors());
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/predict", predictRoutes);

// Connect to MongoDB using the connection string from the environment variable
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// Start server
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
