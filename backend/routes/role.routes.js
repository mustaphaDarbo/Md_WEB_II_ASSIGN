const router = require("express").Router();
const roleController = require("../controllers/role.controller");
const auth = require("../middleware/auth");

// All routes require authentication and manageRoles permission
router.get("/", auth("manageRoles"), roleController.getRoles);
router.post("/", auth("manageRoles"), roleController.createRole);
router.get("/:id", auth("manageRoles"), roleController.getRoleById);
router.put("/:id", auth("manageRoles"), roleController.updateRole);
router.delete("/:id", auth("manageRoles"), roleController.deleteRole);

module.exports = router;
