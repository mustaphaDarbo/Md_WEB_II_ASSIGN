const mongoose = require("mongoose");
const Role = require("./models/Role");
const User = require("./models/User");
require("dotenv").config();

const setupSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Create SuperAdmin role with all permissions
    const superAdminPermissions = {
      create: true,
      view: true,
      edit: true,
      delete: true,
      publish: true,
      manageUsers: true,
      manageRoles: true
    };

    let superAdminRole = await Role.findOne({ name: "SuperAdmin" });
    if (!superAdminRole) {
      superAdminRole = new Role({
        name: "SuperAdmin",
        permissions: superAdminPermissions
      });
      await superAdminRole.save();
      console.log("SuperAdmin role created");
    } else {
      superAdminRole.permissions = superAdminPermissions;
      await superAdminRole.save();
      console.log("SuperAdmin role updated with permissions");
    }

    // Update existing admin user to have SuperAdmin role
    const adminUser = await User.findOne({ email: "admin@gmail.com" });
    if (adminUser) {
      adminUser.role = superAdminRole._id;
      await adminUser.save();
      console.log("Admin user updated with SuperAdmin role");
    }

    console.log("SuperAdmin setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

setupSuperAdmin();
