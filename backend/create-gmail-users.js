const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb+srv://mdarboe0708_db_user:mdarboe123@mdarboe.k6ypmim.mongodb.net/cmsDB')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const UserSchema = new mongoose.Schema({
      fullName: String,
      email: String,
      password: String,
      role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" }
    });
    
    const RoleSchema = new mongoose.Schema({
      name: String,
      permissions: Object
    });
    
    const User = mongoose.model('User', UserSchema);
    const Role = mongoose.model('Role', RoleSchema);
    
    // Delete old users
    const oldEmails = ['manager@yahoo.com', 'contributor@hotmail.com', 'viewer@outlook.com'];
    for (const email of oldEmails) {
      const result = await User.deleteOne({ email: email });
      if (result.deletedCount > 0) {
        console.log(`Deleted old user: ${email}`);
      }
    }
    
    // Create all roles if they don't exist
    const roles = [
      { name: 'SuperAdmin', permissions: { create: true, edit: true, delete: true, publish: true, view: true, manageUsers: true, manageRoles: true } },
      { name: 'Manager', permissions: { create: true, edit: true, delete: true, publish: true, view: true, manageUsers: false, manageRoles: false } },
      { name: 'Contributor', permissions: { create: true, edit: true, delete: false, publish: false, view: true, manageUsers: false, manageRoles: false } },
      { name: 'Viewer', permissions: { create: false, edit: false, delete: false, publish: false, view: true, manageUsers: false, manageRoles: false } }
    ];

    for (const roleData of roles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`Created role: ${roleData.name}`);
      }
    }

    // Create new test users with @gmail.com domain
    const testUsers = [
      { fullName: 'Super Admin', email: 'admin@gmail.com', roleName: 'SuperAdmin' },
      { fullName: 'Manager User', email: 'manager@gmail.com', roleName: 'Manager' },
      { fullName: 'Contributor User', email: 'contributor@gmail.com', roleName: 'Contributor' },
      { fullName: 'Viewer User', email: 'viewer@gmail.com', roleName: 'Viewer' }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const role = await Role.findOne({ name: userData.roleName });
        const hashedPassword = await bcrypt.hash('123456', 10);
        await User.create({
          fullName: userData.fullName,
          email: userData.email,
          password: hashedPassword,
          role: role._id
        });
        console.log(`Created user: ${userData.email} (${userData.roleName})`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }
    
    console.log('Setup complete! Use these credentials:');
    console.log('admin@gmail.com / 123456 (SuperAdmin)');
    console.log('manager@gmail.com / 123456 (Manager)');
    console.log('contributor@gmail.com / 123456 (Contributor)');
    console.log('viewer@gmail.com / 123456 (Viewer)');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
