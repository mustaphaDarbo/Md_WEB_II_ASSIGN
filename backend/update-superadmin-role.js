const http = require('http');

let superAdminRoleId = null;

// First, get all roles to find SuperAdmin ID
const getOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/roles',
  method: 'GET'
};

const getReq = http.request(getOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const roles = JSON.parse(data);
    const superAdminRole = roles.find(role => role.name === 'SuperAdmin');
    
    if (superAdminRole) {
      superAdminRoleId = superAdminRole._id;
      console.log('Found SuperAdmin role ID:', superAdminRoleId);
      
      // Now update the role
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

      const updateOptions = {
        hostname: 'localhost',
        port: 5000,
        path: `/api/roles/${superAdminRoleId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const updateReq = http.request(updateOptions, (res) => {
        console.log(`Update Status: ${res.statusCode}`);
        res.setEncoding('utf8');
        let updateData = '';
        res.on('data', (chunk) => {
          updateData += chunk;
        });
        res.on('end', () => {
          console.log('Update Response:', updateData);
        });
      });

      updateReq.on('error', (e) => {
        console.error(`Update Problem: ${e.message}`);
      });

      updateReq.write(postData);
      updateReq.end();
    } else {
      console.log('SuperAdmin role not found');
    }
  });
});

getReq.on('error', (e) => {
  console.error(`Get Problem: ${e.message}`);
});

getReq.end();
