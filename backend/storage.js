// Simple file-based storage for users and roles
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
function initDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      users: [],
      roles: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    console.log('Created data file with initial data');
  }
}

// Load data from file
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  return { users: [], roles: [] };
}

// Save data to file
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Add user
function addUser(userData) {
  const data = loadData();
  data.users.push(userData);
  saveData(data);
  return userData;
}

// Get all users
function getAllUsers() {
  const data = loadData();
  return data.users;
}

// Add role
function addRole(roleData) {
  const data = loadData();
  data.roles.push(roleData);
  saveData(data);
  return roleData;
}

// Get all roles
function getAllRoles() {
  const data = loadData();
  return data.roles;
}

module.exports = {
  initDataFile,
  loadData,
  saveData,
  addUser,
  getAllUsers,
  addRole,
  getAllRoles
};
