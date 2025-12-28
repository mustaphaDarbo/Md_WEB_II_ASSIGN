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

// Test route
app.get("/test", (req, res) => {
  console.log("Test route hit!");
  res.json({ message: "Server is working!" });
});

// Register routes immediately (before database connection)
try {
  app.use("/api/auth", require("./routes/auth.routes"));
  console.log("Auth routes loaded successfully");
} catch (err) {
  console.error("Failed to load auth routes:", err);
}

try {
  app.use("/api/roles", require("./routes/role.routes"));
  console.log("Role routes loaded successfully");
} catch (err) {
  console.error("Failed to load role routes:", err);
}

try {
  app.use("/api/articles", require("./routes/article.routes"));
  console.log("Article routes loaded successfully");
} catch (err) {
  console.error("Failed to load article routes:", err);
}

try {
  app.use("/api/users", require("./routes/user.routes"));
  console.log("User routes loaded successfully");
} catch (err) {
  console.error("Failed to load user routes:", err);
}

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch(err => console.log("Database connection failed:", err));

app.listen(5001, () => {
  console.log("Server running on http://localhost:5001");
});
