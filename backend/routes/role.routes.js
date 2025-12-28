const router = require("express").Router();
const roleController = require("../controllers/role.controller");
const { authenticateToken, requirePermission } = require("../middleware/auth");

// All routes require authentication and manageRoles permission
router.get("/", authenticateToken, requirePermission("manageRoles"), roleController.getRoles);
router.post("/", authenticateToken, requirePermission("manageRoles"), roleController.createRole);
router.get("/:id", authenticateToken, requirePermission("manageRoles"), roleController.getRoleById);
router.put("/:id", authenticateToken, requirePermission("manageRoles"), roleController.updateRole);
router.delete("/:id", authenticateToken, requirePermission("manageRoles"), roleController.deleteRole);

module.exports = router;
