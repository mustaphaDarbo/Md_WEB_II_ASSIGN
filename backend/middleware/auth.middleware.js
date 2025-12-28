const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    const user = await User.findById(decoded.id).populate("role");
    
    if (!user) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied" });
    }

    const userPermissions = req.user.role.permissions;
    
    if (!userPermissions[permission]) {
      return res.status(403).json({ message: `Permission '${permission}' required` });
    }

    next();
  };
};

const requireRole = (roleName) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.user.role.name !== roleName) {
      return res.status(403).json({ message: `Role '${roleName}' required` });
    }

    next();
  };
};

const requireAnyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!roles.includes(req.user.role.name)) {
      return res.status(403).json({ message: `One of these roles required: ${roles.join(', ')}` });
    }

    next();
  };
};

const requireSuperAdmin = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (req.user.role.name !== "SuperAdmin") {
    return res.status(403).json({ message: "SuperAdmin role required" });
  }

  next();
};

module.exports = {
  authenticateToken,
  requirePermission,
  requireRole,
  requireAnyRole,
  requireSuperAdmin
};
