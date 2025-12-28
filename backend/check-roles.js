const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/roles',
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
    const roles = JSON.parse(data);
    console.log('Roles in database:');
    roles.forEach(role => {
      console.log(`- ${role.name}:`, role.permissions);
    });
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
