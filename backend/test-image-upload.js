const fs = require('fs');
const FormData = require('form-data');
const http = require('http');

// Create a simple test image file
const testImagePath = 'test-image.jpg';
const testImageContent = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A');

// Write test image
fs.writeFileSync(testImagePath, testImageContent);

// Create form data
const form = new FormData();
form.append('title', 'Test Article with Image');
form.append('body', 'This is a test article with an image upload.');
form.append('published', 'true');
form.append('image', fs.createReadStream(testImagePath), {
  filename: 'test-image.jpg',
  contentType: 'image/jpeg'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/articles',
  method: 'POST',
  headers: {
    ...form.getHeaders(),
    'Content-Length': form.getLengthSync()
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
    // Clean up test file
    fs.unlinkSync(testImagePath);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
  fs.unlinkSync(testImagePath);
});

form.pipe(req);
