const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Simple test route for GET articles
app.get("/api/articles", (req, res) => {
  console.log("GET /api/articles hit");
  res.json([
    { 
      _id: "1", 
      title: "Test Article", 
      body: "This is a test article", 
      published: false 
    }
  ]);
});

// Simple test route for POST articles
app.post("/api/articles", (req, res) => {
  console.log("Simple server received request:", req.body);
  res.json({ 
    message: "Article created successfully!", 
    received: req.body 
  });
});

app.listen(5001, () => {
  console.log("Simple test server running on http://localhost:5001");
});
