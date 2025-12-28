const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/users-real',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.setEncoding('utf8');
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const users = JSON.parse(data);
    console.log('Users found:');
    users.forEach(user => {
      console.log(`- Email: ${user.email}, Name: ${user.fullName}, Role: ${user.role?.name}`);
    });
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
