const router = require("express").Router();
const userController = require("../controllers/user.controller");
const { authenticateToken, requirePermission, requireSuperAdmin } = require("../middleware/auth.middleware");

// User creation route - requires manageUsers permission
router.post("/", authenticateToken, requirePermission("manageUsers"), userController.createUser);

// Get all users - requires manageUsers permission
router.get("/", authenticateToken, requirePermission("manageUsers"), userController.getAllUsers);

// Other user routes - requires manageUsers permission
router.get("/:id", authenticateToken, requirePermission("manageUsers"), userController.getUserById);
router.put("/:id", authenticateToken, requirePermission("manageUsers"), userController.updateUser);
router.delete("/:id", authenticateToken, requirePermission("manageUsers"), userController.deleteUser);

module.exports = router;
