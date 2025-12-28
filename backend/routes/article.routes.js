const router = require("express").Router();
const articleController = require("../controllers/article.controller");
const upload = require("../controllers/article.controller").upload;
const { authenticateToken, requirePermission } = require("../middleware/auth.middleware");

// Simple test route that bypasses everything - MUST come before /:id
router.get("/test", (req, res) => {
  console.log('GET /api/articles/test hit');
  res.json([
    { _id: "1", title: "Test Article 1", body: "Test content 1", published: false },
    { _id: "2", title: "Test Article 2", body: "Test content 2", published: true }
  ]);
});

// Public route for published articles - no authentication required
router.get("/published", articleController.getPublishedArticles);

// Read articles - requires view permission
router.get("/", authenticateToken, requirePermission("view"), articleController.getArticles);

// Create article - requires create permission with image upload
router.post("/", authenticateToken, requirePermission("create"), upload.single("image"), articleController.createArticle);

// Update article - requires edit permission with image upload
router.put("/:id", authenticateToken, requirePermission("edit"), upload.single("image"), articleController.updateArticle);

// Delete article - requires delete permission
router.delete("/:id", authenticateToken, requirePermission("delete"), articleController.deleteArticle);

// Publish/Unpublish article - requires publish permission
router.put("/:id/publish", authenticateToken, requirePermission("publish"), articleController.publishArticle);
router.put("/:id/unpublish", authenticateToken, requirePermission("publish"), articleController.unpublishArticle);

// Get article by ID - requires view permission
router.get("/:id", authenticateToken, requirePermission("view"), articleController.getArticleById);

module.exports = router;
