const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      id: user._id, 
      role: user.role.name,
      permissions: user.role.permissions
    },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "15m" }
  );
  
  const refreshToken = crypto.randomBytes(64).toString('hex');
  
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const normalizedFullName = (fullName || '').trim();
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedFullName || !normalizedEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const userRole = await Role.findOne({ name: role || "Viewer" });
    if (!userRole) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullName: normalizedFullName,
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole._id
    });

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;

    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedPassword = (password || '').toString();

    if (!normalizedEmail || !normalizedPassword) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('Looking for user:', normalizedEmail);
    
    // Check if database is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, using fallback authentication');
      
      // Fallback to mock user for development
      if (normalizedEmail === 'admin@gmail.com' && normalizedPassword === '123456') {
        const { accessToken, refreshToken } = generateTokens({
          _id: '1',
          role: { name: 'SuperAdmin', permissions: { create: true, edit: true, delete: true, publish: true, view: true, manageUsers: true, manageRoles: true } }
        });
        
        return res.json({ 
          accessToken,
          refreshToken,
          user: {
            id: '1',
            fullName: 'Super Admin',
            email: 'admin@gmail.com',
            role: 'SuperAdmin',
            permissions: { create: true, edit: true, delete: true, publish: true, view: true, manageUsers: true, manageRoles: true }
          }
        });
      } else {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    }
    
    const user = await User.findOne({ email: normalizedEmail }).populate("role");
    console.log('Found user:', user ? 'Yes' : 'No');
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(normalizedPassword, user.password);
    console.log('Password comparison details:');
    console.log('- Input password:', normalizedPassword);
    console.log('- Stored password hash:', user.password);
    console.log('- Hash type:', user.password.startsWith('$2') ? 'bcrypt' : 'plain text');
    console.log('- Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ 
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions,
        profilePhoto: user.profilePhoto
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const user = await User.findOne({ refreshToken }).populate("role");
    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await User.findOneAndUpdate(
        { refreshToken },
        { refreshToken: null }
      );
    }

    res.json({ message: "Logged out successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfilePhoto = async (req, res) => {
  try {
    const { profilePhoto } = req.body;

    if (!profilePhoto || typeof profilePhoto !== 'string') {
      return res.status(400).json({ message: 'profilePhoto is required' });
    }

    if (!profilePhoto.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image format' });
    }

    const maxLen = 5 * 1024 * 1024;
    if (profilePhoto.length > maxLen) {
      return res.status(400).json({ message: 'Image is too large' });
    }

    const user = req.user;
    user.profilePhoto = profilePhoto;
    await user.save();

    res.json({
      message: 'Profile photo updated',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role?.name || user.role,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
