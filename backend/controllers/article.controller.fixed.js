const Article = require("../models/Article");
const User = require("../models/User");

/**
 * CREATE ARTICLE
 * Permission: create
 */
exports.createArticle = async (req, res) => {
  try {
    const article = await Article.create({
      title: req.body.title,
      body: req.body.body,
      image: req.body.image || null,
      published: req.body.published || false,
      author: req.user.id
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
 * GET ALL ARTICLES
 * Permission: view
 * Viewers see only published articles, others see all
 */
exports.getArticles = async (req, res) => {
  try {
    let filter = {};
    
    // If user is Viewer, only show published articles
    if (req.user.role.name === 'Viewer') {
      filter.published = true;
    }

    const articles = await Article.find(filter)
      .populate("author", "fullName email role")
      .sort({ createdAt: -1 });

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
    if (req.user.role.name === 'Viewer' && !article.published) {
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
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Check if user can edit (author or has edit permission)
    const isAuthor = article.author.toString() === req.user.id;
    const canEdit = req.user.role.permissions.edit || req.user.role.name === 'SuperAdmin';

    if (!isAuthor && !canEdit) {
      return res.status(403).json({ message: "Not allowed to edit this article" });
    }

    article.title = req.body.title ?? article.title;
    article.body = req.body.body ?? article.body;
    article.image = req.body.image ?? article.image;
    
    // Only allow users with publish permission to change published status
    if (req.user.role.permissions.publish || req.user.role.name === 'SuperAdmin') {
      article.published = req.body.published ?? article.published;
    }

    await article.save();
    
    const updatedArticle = await Article.findById(article._id)
      .populate("author", "fullName email");

    res.json(updatedArticle);

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE ARTICLE
 * Permission: delete
 */
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Check if user can delete (author or has delete permission)
    const isAuthor = article.author.toString() === req.user.id;
    const canDelete = req.user.role.permissions.delete || req.user.role.name === 'SuperAdmin';

    if (!isAuthor && !canDelete) {
      return res.status(403).json({ message: "Not allowed to delete this article" });
    }

    await article.deleteOne();
    res.json({ message: "Article deleted successfully" });

  } catch (err) {
    console.error(err);
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
