const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to database and check user passwords
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cms')
  .then(async () => {
    console.log('Connected to database');
    
    // Get all users and check their passwords
    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    
    for (const user of users) {
      console.log(`\nUser: ${user.email}`);
      console.log(`Password hash: ${user.password.substring(0, 20)}...`);
      console.log(`Password length: ${user.password.length}`);
      console.log(`Role: ${user.role}`);
    }
    
    // Specifically check the test user we just created
    const testUser = await User.findOne({ email: 'testuser@example.com' });
    if (testUser) {
      console.log('\n--- Test User Details ---');
      console.log('Email:', testUser.email);
      console.log('Password hash:', testUser.password);
      console.log('Is bcrypt hash?', testUser.password.startsWith('$2'));
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
