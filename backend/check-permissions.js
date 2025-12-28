const http = require('http');

const postData = JSON.stringify({
  email: 'admin@test.com',
  password: '123456'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.setEncoding('utf8');
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const response = JSON.parse(data);
    console.log('User permissions:', response.user.permissions);
    console.log('Has manageUsers:', response.user.permissions?.manageUsers);
    console.log('Has manageRoles:', response.user.permissions?.manageRoles);
    console.log('Full user object:', JSON.stringify(response.user, null, 2));
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
