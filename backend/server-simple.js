const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Test route - add this before database connection
app.get("/test", (req, res) => {
  console.log("Test route hit!");
  res.json({ message: "Server is working!" });
});

// Simple database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    
    // Register routes
    try {
      app.use("/api/auth", require("./routes/auth.routes"));
      console.log("Auth routes registered");
      
      app.use("/api/roles", require("./routes/role.routes"));
      console.log("Role routes registered");
      
      app.use("/api/articles", require("./routes/article.routes"));
      console.log("Article routes registered");
      
      app.use("/api/users", require("./routes/user.routes"));
      console.log("User routes registered");
      
      console.log("All routes registered successfully");
    } catch (err) {
      console.error("Error registering routes:", err);
    }
  })
  .catch(err => console.log("Database connection failed:", err));

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
