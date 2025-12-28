const http = require('http');

// First, create a test user
const userData = JSON.stringify({
  fullName: 'New Test User',
  email: 'newtestuser@example.com',
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
    
    // Now try to login with the created user
    testLogin();
  });
});

createReq.on('error', (e) => {
  console.error(`Create User Problem: ${e.message}`);
});

createReq.write(userData);
createReq.end();

function testLogin() {
  const loginData = JSON.stringify({
    email: 'newtestuser@example.com',
    password: 'test123'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const loginReq = http.request(loginOptions, (res) => {
    console.log(`Login Status: ${res.statusCode}`);
    res.setEncoding('utf8');
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Login Response:', data);
    });
  });

  loginReq.on('error', (e) => {
    console.error(`Login Problem: ${e.message}`);
  });

  loginReq.write(loginData);
  loginReq.end();
}
