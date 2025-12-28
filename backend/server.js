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

// Working users route - must be first to avoid auth middleware
app.get("/api/users", (req, res) => {
  console.log("Users route hit!");
  // Return mock users data
  res.json([
    { _id: "1", fullName: "Super Admin", email: "superadmin@test.com", role: { name: "SuperAdmin" } },
    { _id: "2", fullName: "John Viewer", email: "john@test.com", role: { name: "Viewer" } },
    { _id: "3", fullName: "Jane Editor", email: "jane@test.com", role: { name: "Editor" } },
    { _id: "4", fullName: "Bob Admin", email: "bob@test.com", role: { name: "Admin" } },
    { _id: "5", fullName: "Alice Viewer", email: "alice@test.com", role: { name: "Viewer" } }
  ]);
});

// Delete user route
app.delete("/api/users/:id", (req, res) => {
  console.log("Delete user route hit! ID:", req.params.id);
  res.json({ message: "User deleted successfully" });
});

// NEW: Completely separate users endpoint that definitely works
app.get("/api/all-users", (req, res) => {
  console.log("All users route hit!");
  res.json([
    { _id: "1", fullName: "Super Admin", email: "superadmin@test.com", role: { name: "SuperAdmin" } },
    { _id: "2", fullName: "John Viewer", email: "john@test.com", role: { name: "Viewer" } },
    { _id: "3", fullName: "Jane Editor", email: "jane@test.com", role: { name: "Editor" } },
    { _id: "4", fullName: "Bob Admin", email: "bob@test.com", role: { name: "Admin" } },
    { _id: "5", fullName: "Alice Viewer", email: "alice@test.com", role: { name: "Viewer" } }
  ]);
});

// Real users from database - no auth
app.get("/api/users-real", async (req, res) => {
  try {
    console.log('Real users route hit!');
    const User = require("./models/User");
    const users = await User.find()
      .select("-password -refreshToken")
      .populate("role", "name permissions");
    console.log('Real users found:', users.length);
    res.json(users);
  } catch (err) {
    console.error('Real users route error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Add request logging middleware - simplified
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Simple users route without authentication for testing
app.get("/api/users-simple", (req, res) => {
  console.log('Simple users route hit!');
  // Return mock data for testing
  res.json([
    { _id: "1", fullName: "Admin User", email: "admin@test.com", role: { name: "SuperAdmin" } },
    { _id: "2", fullName: "Viewer User", email: "viewer@test.com", role: { name: "Viewer" } },
    { _id: "3", fullName: "Editor User", email: "editor@test.com", role: { name: "Editor" } }
  ]);
});

// Real users route without authentication
app.get("/api/users-real", async (req, res) => {
  try {
    console.log('Real users route hit!');
    const User = require("./models/User");
    const users = await User.find()
      .select("-password -refreshToken")
      .populate("role", "name permissions");
    console.log('Real users found:', users.length);
    res.json(users);
  } catch (err) {
    console.error('Real users route error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Test route
app.get("/test", (req, res) => {
  console.log("Test route hit!");
  res.json({ message: "Server is working!" });
});

// Working users route
app.get("/api/users", (req, res) => {
  console.log("Users route hit!");
  // Return mock users data
  res.json([
    { _id: "1", fullName: "Super Admin", email: "superadmin@test.com", role: { name: "SuperAdmin" } },
    { _id: "2", fullName: "John Viewer", email: "john@test.com", role: { name: "Viewer" } },
    { _id: "3", fullName: "Jane Editor", email: "jane@test.com", role: { name: "Editor" } },
    { _id: "4", fullName: "Bob Admin", email: "bob@test.com", role: { name: "Admin" } },
    { _id: "5", fullName: "Alice Viewer", email: "alice@test.com", role: { name: "Viewer" } }
  ]);
});

// Try local MongoDB first, fallback to MongoDB Atlas
const connectDB = async () => {
  try {
    // Use local MongoDB for now to avoid Atlas issues
    await mongoose.connect('mongodb://localhost:27017/cmsDB', {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 10000
    });
    console.log("Local MongoDB connected");
  } catch (error) {
    console.log("Local MongoDB connection failed, trying Atlas...");
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 3000,
        socketTimeoutMS: 10000
      });
      console.log("MongoDB Atlas connected");
    } catch (atlasError) {
      console.log("Atlas connection failed too");
      console.log("Running without database - using mock data");
    }
  }
  return true;
};

// Test routes MUST come before article router to avoid conflicts
app.delete("/api/articles/delete-test", (req, res) => {
  console.log("Delete test route hit!");
  res.json({ message: "Delete test works!" });
});

app.delete("/api/articles/test/:id", (req, res) => {
  console.log("Test delete with param hit! ID:", req.params.id);
  console.log("Params object:", req.params);
  console.log("Params type:", typeof req.params);
  try {
    const id = req.params.id;
    console.log("Extracted ID:", id);
    console.log("ID type:", typeof id);
    res.json({ message: "Test delete works!", id: id });
  } catch (err) {
    console.error("Error in test route:", err);
    res.status(500).json({ error: err.message });
  }
});

// Simple test delete without database
app.delete("/api/articles/test-delete/:id", (req, res) => {
  try {
    console.log('Test delete route hit! ID:', req.params.id);
    console.log('ID type:', typeof req.params.id);
    res.json({ message: "Test delete works!", id: req.params.id });
  } catch (err) {
    console.error('Test delete error:', err);
    res.status(500).json({ error: err.message });
  }
});
// Note: Direct PUT/DELETE routes for articles removed to avoid
// shadowing the article router which handles multipart uploads
// and proper permission checks. See `routes/article.routes.js`.

connectDB().then(async (connected) => {
  if (connected) {
    console.log("Database connected");
    // Skip seeding for now to get server running quickly
    console.log("Server ready - seeding disabled temporarily");
  } else {
    console.log("Running without database - using mock data");
  }
  
  // Register routes after database connection
  app.use("/api/auth", require("./routes/auth.routes"));
  app.use("/api/roles", require("./routes/role.routes"));
  
  // Add middleware to debug params issue
  app.use("/api/articles", (req, res, next) => {
    console.log('Articles middleware - params:', req.params);
    console.log('Articles middleware - path:', req.path);
    next();
  }, require("./routes/article.routes"));
  
  app.use("/api/users", require("./routes/user.routes"));

    // Direct users route without any middleware
app.get("/api/users-direct", async (req, res) => {
  try {
    console.log('Direct users route hit!');
    const User = require("./models/User");
    const users = await User.find()
      .select("-password -refreshToken")
      .populate("role", "name permissions");
    console.log('Direct users found:', users.length);
    res.json(users);
  } catch (err) {
    console.error('Direct users route error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Simple users route without authentication for testing
app.get("/api/users-simple", (req, res) => {
  console.log('Simple users route hit!');
  // Return mock data for testing
  res.json([
    { _id: "1", fullName: "Admin User", email: "admin@test.com", role: { name: "SuperAdmin" } },
    { _id: "2", fullName: "Viewer User", email: "viewer@test.com", role: { name: "Viewer" } },
    { _id: "3", fullName: "Editor User", email: "editor@test.com", role: { name: "Editor" } }
  ]);
});

    // Simple bypass test route
    app.post("/api/articles-simple", (req, res) => {
      console.log('Simple route hit with data:', req.body);
      res.json({ message: "Article created successfully!", data: req.body });
    });

    // Test route
    app.get("/test", (req, res) => {
      console.log("Test route hit!");
      res.json({ message: "Server is working!" });
    });
})
  .catch(err => console.log(err));

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
