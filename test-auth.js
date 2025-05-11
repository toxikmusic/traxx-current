// Test authentication in the application
import http from 'http';

// Helper function to make HTTP requests
function makeRequest(options, requestBody = null) {
  return new Promise((resolve, reject) => {
    console.log(`Sending ${options.method} request to: http://${options.hostname}:${options.port}${options.path}`);
    
    const req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (data) {
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
          reject(e);
        }
      });
    });
    
    req.on('error', (e) => {
      console.error(`Problem with request: ${e.message}`);
      reject(e);
    });
    
    if (requestBody) {
      req.write(JSON.stringify(requestBody));
    }
    
    req.end();
  });
}

// Tests to run
async function runTests() {
  try {
    // 1. Health check
    console.log("\n==== Test 1: Health Check ====");
    const healthCheck = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health-check',
      method: 'GET'
    });
    
    if (healthCheck.statusCode !== 200) {
      throw new Error(`Health check failed with status ${healthCheck.statusCode}`);
    }
    
    // 2. Try to log in with admin credentials
    console.log("\n==== Test 2: Login with test credentials ====");
    const loginResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      username: 'admin',
      password: 'admin1234'
    });
    
    console.log("Login result:", loginResult);
    
    // 3. Get current user profile (should be authenticated now)
    console.log("\n==== Test 3: Get current user profile ====");
    // We need to handle cookies for this to work
    console.log("Note: This test won't work without proper cookie handling");
    
    console.log("\nTests completed successfully!");
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

// Run the tests
runTests();