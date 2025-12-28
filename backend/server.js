// Server configuration and startup
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 10000
    });
    console.log("Connected to MongoDB Atlas");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    return false;
  }
};

// Start server and connect to database
connectDB().then(async (connected) => {
  if (connected) {
    console.log("Database connected");
  } else {
    console.log("Running without database - using mock data");
  }
  
  // Register routes after database connection
  app.use("/api/auth", require("./routes/auth.routes"));
  app.use("/api/roles", require("./routes/role.routes"));
  app.use("/api/articles", require("./routes/article.routes"));
  app.use("/api/users", require("./routes/user.routes"));

  // Test route
  app.get("/test", (req, res) => {
    console.log("Test route hit!");
    res.json({ message: "Server is working!" });
  });

  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to start server:", err);
});
