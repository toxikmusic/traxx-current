// Test stream creation in the application
import http from 'http';
import fs from 'fs';

// Helper function to make HTTP requests
async function makeRequest(options, requestBody = null) {
  return new Promise((resolve, reject) => {
    console.log(`Sending ${options.method} request to: http://${options.hostname}:${options.port}${options.path}`);
    
    const req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      
      // Save cookies for session handling
      if (res.headers['set-cookie']) {
        const cookieStr = res.headers['set-cookie'].toString();
        console.log('Received cookies');
        try {
          fs.writeFileSync('./cookies.txt', cookieStr);
          console.log('Cookies saved to cookies.txt');
        } catch (err) {
          console.error('Failed to save cookies:', err);
        }
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (data && data.trim()) {
            const parsed = JSON.parse(data);
            console.log('Response data:', parsed);
            resolve({ statusCode: res.statusCode, headers: res.headers, data: parsed });
          } else {
            console.log('Empty response body');
            resolve({ statusCode: res.statusCode, headers: res.headers, data: null });
          }
        } catch (e) {
          console.error('Failed to parse response:', e.message);
          console.log('Raw response:', data);
          resolve({ statusCode: res.statusCode, headers: res.headers, data: data });
        }
      });
    });
    
    req.on('error', (e) => {
      console.error(`Problem with request: ${e.message}`);
      reject(e);
    });
    
    // Add cookies to request if available
    try {
      if (fs.existsSync('./cookies.txt')) {
        const cookies = fs.readFileSync('./cookies.txt', 'utf8');
        req.setHeader('Cookie', cookies);
        console.log('Cookies added to request:', cookies);
      }
    } catch (err) {
      console.error('Failed to read cookies:', err);
    }
    
    if (requestBody) {
      const jsonBody = JSON.stringify(requestBody);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(jsonBody));
      req.write(jsonBody);
      console.log('Request body:', jsonBody);
    }
    
    req.end();
  });
}

async function testStreamCreation() {
  try {
    // 1. Log in first
    console.log("\n==== Step 1: Login with test credentials ====");
    const loginResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      username: 'toxik',
      password: 'password1234'
    });
    
    if (loginResult.statusCode !== 200) {
      throw new Error(`Login failed with status ${loginResult.statusCode}`);
    }
    
    // 2. Create a test stream
    console.log("\n==== Step 2: Create a test stream ====");
    const streamData = {
      title: "Test Stream",
      description: "Stream created by automated test",
      category: "Test",
      tags: ["test", "automation"],
      streamType: "audio",
      useCamera: false,
      useMicrophone: true,
      useSystemAudio: false,
      hasVisualElement: false
    };
    
    const createStreamResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/streams',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, streamData);
    
    console.log("Stream creation result:", createStreamResult);
    
    if (createStreamResult.statusCode !== 200 && createStreamResult.statusCode !== 201) {
      throw new Error(`Stream creation failed with status ${createStreamResult.statusCode}`);
    }
    
    // 3. End the stream if created successfully
    if (createStreamResult.data && createStreamResult.data.id) {
      console.log("\n==== Step 3: End the test stream ====");
      const streamId = createStreamResult.data.id;
      
      const endStreamResult = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: `/api/streams/${streamId}/end`,
        method: 'POST'
      });
      
      console.log("Stream end result:", endStreamResult);
    }
    
    console.log("\nStream tests completed successfully!");
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

// Run the tests
testStreamCreation();