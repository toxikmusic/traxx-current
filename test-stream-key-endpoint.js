/**
 * Test script for secure stream key generation and validation endpoints
 */

import http from 'http';
import crypto from 'crypto';

// Basic HTTP request helper
async function makeRequest(options, requestBody = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, headers: res.headers, body: parsedData });
        } catch (error) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (requestBody) {
      req.write(JSON.stringify(requestBody));
    }

    req.end();
  });
}

// Helper function to mimic our stream key generation function for comparison
function generateStreamKey(userId) {
  // Create a key with format: {userId}:{timestamp}:{signature}
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  // Use a test secret key - this should match what's in the server
  const secret = 'traxx-development-secret-key';
  
  // Create a signature using HMAC with base64url encoding
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${userId}:${timestamp}`)
    .digest('base64url');
  
  // Combine into a stream key
  return `${userId}:${timestamp}:${signature}`;
}

// Test stream key generation endpoint
async function testStreamKeyGeneration() {
  console.log('\n=== Testing Secure Stream Key Generation ===');
  
  try {
    // Create a login session first
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      username: 'testuser',
      password: 'password123'
    });
    
    if (loginResponse.statusCode !== 200) {
      console.log('Authentication failed:', loginResponse.body);
      console.log('Using mock authentication for testing...');
      
      // For testing without authentication, we'll modify our approach
      // Our simple server doesn't require authentication for testing
      const response = await makeRequest({
        hostname: 'localhost',
        port: 5002,
        path: '/api/streams/key?test_user_id=1',  // Pass test user ID as query param
        method: 'GET'
      });
      
      console.log(`Response Status: ${response.statusCode}`);
      console.log(`Response Body:`, response.body);
      
      // Generate our own key for comparison
      const ourKey = generateStreamKey(1);
      console.log(`\nOur generated key: ${ourKey}`);
      
      // Return the stream key for use in validation test
      return response.body?.streamKey || ourKey;
    }
    
    // If login succeeded, get the cookies for the session
    const cookies = loginResponse.headers['set-cookie'];
    
    // Now request a stream key
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/streams/key',
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });
    
    console.log(`Response Status: ${response.statusCode}`);
    console.log(`Response Body:`, response.body);
    
    return response.body?.streamKey;
  } catch (error) {
    console.error('Error testing stream key generation:', error);
    // Return a self-generated key for fallback
    return generateStreamKey(1);
  }
}

// Test stream key validation endpoint
async function testStreamKeyValidation(streamKey) {
  console.log('\n=== Testing Stream Key Validation ===');
  
  try {
    // Create a test stream first
    console.log('Creating a test stream...');
    const createStreamResponse = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/streams',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      title: "Test Stream",
      description: "Stream for testing key validation",
      userId: 1,
      streamKey: streamKey
    });
    
    if (createStreamResponse.statusCode !== 201) {
      console.log('Failed to create test stream:', createStreamResponse.body);
      console.log('Testing with mock stream ID...');
      
      // Test validate key with our generated key
      const response = await makeRequest({
        hostname: 'localhost',
        port: 5002,
        path: '/api/streams/validate-key',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, {
        streamId: 1,
        streamKey: streamKey
      });
      
      console.log(`Response Status: ${response.statusCode}`);
      console.log(`Response Body:`, response.body);
      
      return;
    }
    
    // If stream creation succeeded, test key validation
    const streamId = createStreamResponse.body.id;
    
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/streams/validate-key',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      streamId: streamId,
      streamKey: streamKey
    });
    
    console.log(`Response Status: ${response.statusCode}`);
    console.log(`Response Body:`, response.body);
    
    // Test with invalid key
    const invalidKey = streamKey.substring(0, streamKey.length - 5) + 'XXXXX';
    const invalidResponse = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/streams/validate-key',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      streamId: streamId,
      streamKey: invalidKey
    });
    
    console.log(`\nInvalid Key Test`);
    console.log(`Response Status: ${invalidResponse.statusCode}`);
    console.log(`Response Body:`, invalidResponse.body);
  } catch (error) {
    console.error('Error testing stream key validation:', error);
  }
}

// Run all tests
async function runTests() {
  try {
    const streamKey = await testStreamKeyGeneration();
    
    if (streamKey) {
      await testStreamKeyValidation(streamKey);
    } else {
      console.error('Failed to get a stream key for validation test');
    }
    
    console.log('\n=== All Tests Complete ===');
  } catch (error) {
    console.error('Test suite failed:', error);
  }
}

// Start the tests
runTests();