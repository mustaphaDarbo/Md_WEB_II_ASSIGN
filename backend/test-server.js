const express = require("express");

const app = express();

app.get("/test", (req, res) => {
  console.log("Test route hit!");
  res.json({ message: "Server is working!" });
});

app.listen(5000, () => {
  console.log("Simple server running on http://localhost:5000");
});
