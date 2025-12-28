const mongoose = require("mongoose");
const Role = require("./models/Role");
require("dotenv").config();

const setupRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Define all roles with their permissions
    const roles = [
      {
        name: "SuperAdmin",
        permissions: {
          create: true,
          view: true,
          edit: true,
          delete: true,
          publish: true,
          manageUsers: true,
          manageRoles: true
        }
      },
      {
        name: "Manager",
        permissions: {
          create: true,
          view: true,
          edit: true,
          delete: true,
          publish: true,
          manageUsers: false,
          manageRoles: false
        }
      },
      {
        name: "Contributor",
        permissions: {
          create: true,
          view: true,
          edit: true,
          delete: false,
          publish: false,
          manageUsers: false,
          manageRoles: false
        }
      },
      {
        name: "Viewer",
        permissions: {
          create: false,
          view: true,
          edit: false,
          delete: false,
          publish: false,
          manageUsers: false,
          manageRoles: false
        }
      }
    ];

    for (const roleData of roles) {
      let role = await Role.findOne({ name: roleData.name });
      if (!role) {
        role = new Role(roleData);
        await role.save();
        console.log(`${roleData.name} role created`);
      } else {
        role.permissions = roleData.permissions;
        await role.save();
        console.log(`${roleData.name} role updated`);
      }
    }

    console.log("All roles setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

setupRoles();
