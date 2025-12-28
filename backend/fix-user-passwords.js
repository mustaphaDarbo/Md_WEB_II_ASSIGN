const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to database and fix existing user passwords
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cms')
  .then(async () => {
    console.log('Connected to database');
    
    // Find and update the admin@gmail.com user with hashed password
    const adminUser = await User.findOne({ email: 'admin@gmail.com' });
    if (adminUser) {
      console.log('Found admin@gmail.com user');
      console.log('Current password starts with bcrypt:', adminUser.password.startsWith('$2'));
      
      // Hash the password and update
      const hashedPassword = await bcrypt.hash('123456', 10);
      adminUser.password = hashedPassword;
      await adminUser.save();
      
      console.log('Updated admin@gmail.com with hashed password');
    }
    
    // Check the admin@test.com user (the one that actually works)
    const testAdmin = await User.findOne({ email: 'admin@test.com' });
    if (testAdmin) {
      console.log('Found admin@test.com user');
      console.log('Password starts with bcrypt:', testAdmin.password.startsWith('$2'));
    }
    
    // List all users
    const users = await User.find({});
    console.log(`\nTotal users: ${users.length}`);
    users.forEach(user => {
      console.log(`- ${user.email}: ${user.password.startsWith('$2') ? 'Hashed' : 'Plain text'}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
