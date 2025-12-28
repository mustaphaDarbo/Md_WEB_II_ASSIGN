const http = require('http');

const postData = JSON.stringify({
  name: "SuperAdmin",
  permissions: {
    create: true,
    edit: true,
    delete: true,
    publish: true,
    view: true,
    manageUsers: true,
    manageRoles: true
  }
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/roles',
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
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
