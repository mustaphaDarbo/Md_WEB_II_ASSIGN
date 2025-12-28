const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');

class UserService {
  async createUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Get role
      const role = await Role.findOne({ name: userData.roleName || 'Viewer' });
      if (!role) {
        throw new Error('Role not found');
      }

      // Create user
      const user = new User({
        fullName: userData.fullName,
        email: userData.email,
        password: hashedPassword,
        role: role._id,
        profilePhoto: userData.profilePhoto || null
      });

      await user.save();
      
      // Populate role for response
      await user.populate('role');
      
      return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions,
        profilePhoto: user.profilePhoto
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId).populate('role');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const users = await User.find().populate('role').select('-password -refreshToken');
      return users;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      Object.assign(user, updateData);
      await user.save();
      
      await user.populate('role');
      return user;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateRefreshToken(userId, refreshToken) {
    try {
      await User.findByIdAndUpdate(userId, { refreshToken });
    } catch (error) {
      throw error;
    }
  }

  async updateProfilePhoto(userId, photoUrl) {
    try {
      const user = await User.findByIdAndUpdate(
        userId, 
        { profilePhoto: photoUrl }, 
        { new: true }
      ).populate('role');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
