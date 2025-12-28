const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");

/**
 * CREATE USER (SuperAdmin only)
 * Permission: manageUsers
 */
exports.createUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const normalizedFullName = (fullName || '').trim();
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedFullName || !normalizedEmail || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const userRole = await Role.findOne({ name: role });
    if (!userRole) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('User creation - original password:', password);
    console.log('User creation - hashed password:', hashedPassword);

    const newUser = await User.create({
      fullName: normalizedFullName,
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole._id
    });

    console.log('User created - stored password:', newUser.password);

    const createdUser = await User.findById(newUser._id)
      .select("-password -refreshToken")
      .populate("role", "name permissions");

    res.status(201).json({
      message: "User created successfully",
      user: createdUser
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET ALL USERS
 * Permission: view
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -refreshToken")
      .populate("role", "name permissions");

    console.log('Users found:', users.length);
    res.json(users);
  } catch (err) {
    console.error('Error getting users:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET USER BY ID
 * Permission: view
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -refreshToken")
      .populate("role", "name permissions");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * UPDATE USER
 * Permission: edit
 */
exports.updateUser = async (req, res) => {
  try {
    const { fullName, email, role } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (role) {
      const userRole = await Role.findOne({ name: role });
      if (!userRole) {
        return res.status(400).json({ message: "Invalid role" });
      }
      user.role = userRole._id;
    }

    await user.save();

    // Return updated user without sensitive data
    const updatedUser = await User.findById(userId)
      .select("-password -refreshToken")
      .populate("role", "name permissions");

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE USER
 * Permission: delete
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
