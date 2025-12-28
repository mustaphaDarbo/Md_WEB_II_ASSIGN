const http = require('http');

// Create a new test user
const userData = JSON.stringify({
  fullName: 'Debug Test User',
  email: 'debuguser@example.com',
  password: 'test123',
  role: 'Viewer'
});

const createOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/users',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(userData)
  }
};

const createReq = http.request(createOptions, (res) => {
  console.log(`Create User Status: ${res.statusCode}`);
  res.setEncoding('utf8');
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Create User Response:', data);
  });
});

createReq.on('error', (e) => {
  console.error(`Create User Problem: ${e.message}`);
});

createReq.write(userData);
createReq.end();
