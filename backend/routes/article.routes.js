const router = require("express").Router();
const articleController = require("../controllers/article.controller");
const upload = require("../controllers/article.controller").upload;

// Simple test route that bypasses everything - MUST come before /:id
router.get("/test", (req, res) => {
  console.log('GET /api/articles/test hit');
  res.json([
    { _id: "1", title: "Test Article 1", body: "Test content 1", published: false },
    { _id: "2", title: "Test Article 2", body: "Test content 2", published: true }
  ]);
});

// Read articles - no auth with debugging
router.get("/", (req, res, next) => {
  console.log('GET /api/articles route hit');
  console.log('Request headers:', req.headers);
  next();
}, articleController.getArticles);

// Create article - no auth with image upload
router.post("/", upload.single("image"), articleController.createArticle);

// Update article - no auth with image upload
router.put("/:id", upload.single("image"), articleController.updateArticle);

// Delete article - no auth
router.delete("/:id", articleController.deleteArticle);

// Publish/Unpublish article - no auth
router.put("/:id/publish", articleController.publishArticle);
router.put("/:id/unpublish", articleController.unpublishArticle);

// Get article by ID - MUST come last
router.get("/:id", articleController.getArticleById);

module.exports = router;
