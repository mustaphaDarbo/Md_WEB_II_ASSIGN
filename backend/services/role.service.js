const Role = require('../models/Role');

class RoleService {
  async createRole(roleData) {
    try {
      const role = new Role({
        name: roleData.name,
        permissions: roleData.permissions
      });

      await role.save();
      return role;
    } catch (error) {
      throw error;
    }
  }

  async getAllRoles() {
    try {
      const roles = await Role.find().sort({ name: 1 });
      return roles;
    } catch (error) {
      throw error;
    }
  }

  async getRoleById(roleId) {
    try {
      const role = await Role.findById(roleId);
      if (!role) {
        throw new Error('Role not found');
      }
      return role;
    } catch (error) {
      throw error;
    }
  }

  async getRoleByName(roleName) {
    try {
      const role = await Role.findOne({ name: roleName });
      if (!role) {
        throw new Error('Role not found');
      }
      return role;
    } catch (error) {
      throw error;
    }
  }

  async updateRole(roleId, updateData) {
    try {
      const role = await Role.findByIdAndUpdate(
        roleId, 
        updateData, 
        { new: true, runValidators: true }
      );
      
      if (!role) {
        throw new Error('Role not found');
      }
      
      return role;
    } catch (error) {
      throw error;
    }
  }

  async deleteRole(roleId) {
    try {
      const role = await Role.findByIdAndDelete(roleId);
      if (!role) {
        throw new Error('Role not found');
      }
      return role;
    } catch (error) {
      throw error;
    }
  }

  async initializeDefaultRoles() {
    try {
      const defaultRoles = [
        {
          name: 'SuperAdmin',
          permissions: {
            create: true,
            edit: true,
            delete: true,
            publish: true,
            view: true,
            manageUsers: true,
            manageRoles: true
          }
        },
        {
          name: 'Manager',
          permissions: {
            create: true,
            edit: true,
            delete: true,
            publish: true,
            view: true,
            manageUsers: false,
            manageRoles: false
          }
        },
        {
          name: 'Contributor',
          permissions: {
            create: true,
            edit: true,
            delete: false,
            publish: false,
            view: true,
            manageUsers: false,
            manageRoles: false
          }
        },
        {
          name: 'Viewer',
          permissions: {
            create: false,
            edit: false,
            delete: false,
            publish: false,
            view: true,
            manageUsers: false,
            manageRoles: false
          }
        }
      ];

      for (const roleData of defaultRoles) {
        const existingRole = await Role.findOne({ name: roleData.name });
        if (!existingRole) {
          await Role.create(roleData);
          console.log(`Created default role: ${roleData.name}`);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async getAccessMatrix() {
    try {
      const roles = await this.getAllRoles();
      
      const permissions = ['create', 'edit', 'delete', 'publish', 'view', 'manageUsers', 'manageRoles'];
      
      const matrix = roles.map(role => ({
        role: role.name,
        permissions: permissions.reduce((acc, perm) => {
          acc[perm] = role.permissions[perm] || false;
          return acc;
        }, {})
      }));

      return matrix;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RoleService();
