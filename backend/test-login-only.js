const http = require('http');

// Test login with the existing user
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
