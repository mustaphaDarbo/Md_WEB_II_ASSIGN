const router = require("express").Router();
const userController = require("../controllers/user.controller");
const { authenticateToken, requirePermission, requireSuperAdmin } = require("../middleware/auth.middleware");

// User creation route - no auth for testing
router.post("/", userController.createUser);

// Get all users - no auth for dashboard viewing
router.get("/", userController.getAllUsers);

// Other user routes - no auth for testing
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
