const jwt = require("jsonwebtoken");

module.exports = (permission) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json("No token provided");
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded.permissions || !decoded.permissions[permission]) {
        return res.status(403).json("Access denied");
      }

      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json("Invalid token");
    }
  };
};
