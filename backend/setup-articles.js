const mongoose = require("mongoose");
const Article = require("./models/Article");
require("dotenv").config();

const setupArticles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Create a test article to verify the collection works
    const testArticle = await Article.create({
      title: "Test Article",
      body: "This is a test article content",
      published: false,
      author: null
    });

    console.log("Test article created:", testArticle);
    
    // Clean up the test article
    await Article.findByIdAndDelete(testArticle._id);
    console.log("Test article cleaned up");

    console.log("Article collection is working!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

setupArticles();
