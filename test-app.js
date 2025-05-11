// Simple test to check if the application is accessible
import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health-check',
  method: 'GET'
};

console.log('Sending request to:', `http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('BODY:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('Parsed response:', parsed);
      console.log('Health check successful!');
    } catch (e) {
      console.error('Failed to parse response:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();