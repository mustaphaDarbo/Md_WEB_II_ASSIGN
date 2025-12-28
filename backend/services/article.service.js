const Article = require('../models/Article');
const User = require('../models/User');

class ArticleService {
  async createArticle(articleData, authorId) {
    try {
      const article = new Article({
        title: articleData.title,
        body: articleData.body,
        image: articleData.image || null,
        published: articleData.published || false,
        author: authorId
      });

      await article.save();
      await article.populate('author', 'fullName email');
      return article;
    } catch (error) {
      throw error;
    }
  }

  async getAllArticles(userRole = null) {
    try {
      let query = {};
      
      // Viewers can only see published articles
      if (userRole === 'Viewer') {
        query.published = true;
      }

      const articles = await Article.find(query)
        .populate('author', 'fullName email')
        .sort({ createdAt: -1 });
      
      return articles;
    } catch (error) {
      throw error;
    }
  }

  async getArticleById(articleId, userRole = null) {
    try {
      const article = await Article.findById(articleId)
        .populate('author', 'fullName email');
      
      if (!article) {
        throw new Error('Article not found');
      }

      // Viewers can only see published articles
      if (userRole === 'Viewer' && !article.published) {
        throw new Error('Article not found');
      }

      return article;
    } catch (error) {
      throw error;
    }
  }

  async updateArticle(articleId, updateData, userId, userRole) {
    try {
      const article = await Article.findById(articleId);
      if (!article) {
        throw new Error('Article not found');
      }

      // Check if user can edit this article
      const canEdit = userRole === 'SuperAdmin' || 
                     userRole === 'Manager' || 
                     (userRole === 'Contributor' && article.author.toString() === userId);

      if (!canEdit) {
        throw new Error('Not authorized to edit this article');
      }

      Object.assign(article, updateData);
      await article.save();
      
      await article.populate('author', 'fullName email');
      return article;
    } catch (error) {
      throw error;
    }
  }

  async deleteArticle(articleId, userRole) {
    try {
      const article = await Article.findById(articleId);
      if (!article) {
        throw new Error('Article not found');
      }

      // Only SuperAdmin and Manager can delete articles
      if (userRole !== 'SuperAdmin' && userRole !== 'Manager') {
        throw new Error('Not authorized to delete articles');
      }

      await Article.findByIdAndDelete(articleId);
      return article;
    } catch (error) {
      throw error;
    }
  }

  async publishArticle(articleId, userRole) {
    try {
      const article = await Article.findById(articleId);
      if (!article) {
        throw new Error('Article not found');
      }

      // Only SuperAdmin and Manager can publish articles
      if (userRole !== 'SuperAdmin' && userRole !== 'Manager') {
        throw new Error('Not authorized to publish articles');
      }

      article.published = true;
      await article.save();
      
      await article.populate('author', 'fullName email');
      return article;
    } catch (error) {
      throw error;
    }
  }

  async unpublishArticle(articleId, userRole) {
    try {
      const article = await Article.findById(articleId);
      if (!article) {
        throw new Error('Article not found');
      }

      // Only SuperAdmin and Manager can unpublish articles
      if (userRole !== 'SuperAdmin' && userRole !== 'Manager') {
        throw new Error('Not authorized to unpublish articles');
      }

      article.published = false;
      await article.save();
      
      await article.populate('author', 'fullName email');
      return article;
    } catch (error) {
      throw error;
    }
  }

  async getArticlesByAuthor(authorId) {
    try {
      const articles = await Article.find({ author: authorId })
        .populate('author', 'fullName email')
        .sort({ createdAt: -1 });
      
      return articles;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ArticleService();
