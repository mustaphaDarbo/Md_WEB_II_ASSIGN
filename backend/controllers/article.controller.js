const Article = require("../models/Article");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

// Export upload middleware
module.exports.upload = upload;

/**
 * CREATE ARTICLE
 * Permission: create
 */
exports.createArticle = async (req, res) => {
  try {
    console.log('Received article data:', req.body);
    console.log('Title:', req.body.title);
    console.log('Body:', req.body.body);
    console.log('File:', req.file);
    
    // Handle both JSON and FormData
    let title, body, published;
    
    if (req.body.title) {
      // JSON request
      title = req.body.title;
      body = req.body.body;
      published = req.body.published;
    } else {
      // FormData request - fields might be in different format
      title = req.body.title || req.body.get?.('title');
      body = req.body.body || req.body.get?.('body');
      published = req.body.published || req.body.get?.('published');
    }
    
    // Validate required fields
    if (!title || !body) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        error: 'Title and body are required',
        received: { title, body }
      });
    }
    
    // Handle image
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      console.log('Image uploaded:', imageUrl);
    }
    
    const article = await Article.create({
      title: title,
      body: body,
      image: imageUrl,
      published: published === 'true' || published === true,
      author: req.user?.id || null // Use null if no user is authenticated
    });

    const populatedArticle = await Article.findById(article._id)
      .populate("author", "fullName email");

    res.status(201).json(populatedArticle);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET PUBLISHED ARTICLES (PUBLIC)
 * No authentication required
 * Returns only published articles
 */
exports.getPublishedArticles = async (req, res) => {
  try {
    console.log('getPublishedArticles called');
    
    const articles = await Article.find({ published: true })
      .populate("author", "fullName email")
      .sort({ createdAt: -1 });
    
    console.log('Published articles found:', articles.length);
    
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET ALL ARTICLES
 * Permission: view
 * Viewers see only published articles, others see all
 */
exports.getArticles = async (req, res) => {
  try {
    console.log('getArticles called');
    console.log('req.user:', req.user);
    
    let filter = {};
    
    // If user is Viewer, only show published articles
    if (req.user && req.user.role && req.user.role.name === 'Viewer') {
      filter.published = true;
    }

    console.log('Filter:', filter);
    
    // Simple query without populate first to test
    const articles = await Article.find(filter).sort({ createdAt: -1 });
    console.log('Articles found:', articles.length);
    
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET ARTICLE BY ID
 * Permission: view
 * Viewers can only see published articles
 */
exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate("author", "fullName email role");

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Viewers can only see published articles
    if (req.user && req.user.role && req.user.role.name === 'Viewer' && !article.published) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * UPDATE ARTICLE
 * Permission: edit
 * Author OR users with edit permission
 */
exports.updateArticle = async (req, res) => {
  try {
    console.log('updateArticle called with id:', req.params.id);
    console.log('Update data:', req.body);
    console.log('File:', req.file);
    
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Handle both JSON and FormData
    let title, body, published;
    
    if (req.body.title) {
      // JSON request
      title = req.body.title;
      body = req.body.body;
      published = req.body.published;
    } else {
      // FormData request
      title = req.body.title || req.body.get?.('title');
      body = req.body.body || req.body.get?.('body');
      published = req.body.published || req.body.get?.('published');
    }

    // Update fields
    article.title = title ?? article.title;
    article.body = body ?? article.body;
    article.published = published === 'true' || published === true;

    // Handle image upload
    if (req.file) {
      article.image = `/uploads/${req.file.filename}`;
      console.log('Image updated:', article.image);
    }

    await article.save();
    
    // Return the article without population to avoid null reference issues
    res.json(article);

  } catch (err) {
    console.error('Update error:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE ARTICLE
 * Permission: delete
 */
exports.deleteArticle = async (req, res) => {
  try {
    console.log('deleteArticle called with id:', req.params.id);
    
    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format');
      return res.status(400).json({ error: 'Invalid article ID format' });
    }
    
    // Find and delete article
    const article = await Article.findByIdAndDelete(req.params.id);
    
    if (!article) {
      console.log('Article not found');
      return res.status(404).json({ message: "Article not found" });
    }
    
    console.log('Article deleted successfully:', article._id);
    res.json({ message: "Article deleted successfully", articleId: article._id });
    
  } catch (err) {
    console.error('Delete error:', err);
    console.error('Error stack:', err.stack);
    res.status(400).json({ error: err.message });
  }
};

/**
 * PUBLISH ARTICLE
 * Permission: publish
 */
exports.publishArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    article.published = true;
    await article.save();
    
    const updatedArticle = await Article.findById(article._id)
      .populate("author", "fullName email");

    res.json({ message: "Article published successfully", article: updatedArticle });

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * UNPUBLISH ARTICLE
 * Permission: publish
 */
exports.unpublishArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    article.published = false;
    await article.save();
    
    const updatedArticle = await Article.findById(article._id)
      .populate("author", "fullName email");

    res.json({ message: "Article unpublished successfully", article: updatedArticle });

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
