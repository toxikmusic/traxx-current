/**
 * Test script to verify our stream key verification and public ID access endpoints
 */

import fetch from 'node-fetch';
import crypto from 'crypto';

// Helper function to make HTTP requests
async function makeRequest(options, requestBody = null) {
  const { method = 'GET', path, headers = {} } = options;
  
  const url = `http://localhost:5002${path}`;
  
  const requestOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
  
  if (requestBody) {
    requestOptions.body = JSON.stringify(requestBody);
  }
  
  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`Error making request to ${url}:`, error);
    return { status: 500, error: error.message };
  }
}

// Main test function
async function testStreamKeyVerification() {
  console.log('===== Testing Stream Key Verification =====');
  
  // Step 1: Generate a stream key
  console.log('\n1. Requesting a new stream key...');
  const keyResponse = await makeRequest({ path: '/api/streams/key' });
  
  if (keyResponse.status !== 200 || !keyResponse.data.streamKey) {
    console.error('Failed to get stream key:', keyResponse);
    return;
  }
  
  const streamKey = keyResponse.data.streamKey;
  console.log('Received stream key:', streamKey);
  
  // Step 2: Validate the stream key
  console.log('\n2. Validating the stream key...');
  const validationResponse = await makeRequest(
    { method: 'POST', path: '/api/streams/validate-key' },
    { streamKey }
  );
  
  if (validationResponse.status !== 200) {
    console.error('Stream key validation request failed:', validationResponse);
    return;
  }
  
  console.log('Validation response:', validationResponse.data);
  
  if (validationResponse.data.isValid) {
    console.log('✅ Stream key validated successfully');
  } else {
    console.error('❌ Stream key validation failed');
    return;
  }
  
  // Step 3: Try a tampered stream key
  console.log('\n3. Testing with a tampered stream key...');
  const [userId, timestamp, signature] = streamKey.split(':');
  const tamperedKey = `${userId}:${timestamp}:${signature.substring(0, signature.length - 2)}aa`;
  
  const tamperedResponse = await makeRequest(
    { method: 'POST', path: '/api/streams/validate-key' },
    { streamKey: tamperedKey }
  );
  
  console.log('Tampered key validation response:', tamperedResponse.data);
  
  if (!tamperedResponse.data.isValid) {
    console.log('✅ Tampered key was correctly rejected');
  } else {
    console.error('❌ Security issue: Tampered key was accepted!');
  }
  
  // Step 4: Try the server info endpoint (should include a test stream key)
  console.log('\n4. Testing server info endpoint...');
  const infoResponse = await makeRequest({ path: '/api/server-info' });
  
  if (infoResponse.status !== 200) {
    console.error('Server info request failed:', infoResponse);
    return;
  }
  
  console.log('Server info:', infoResponse.data);
  
  if (infoResponse.data.testStreamKey) {
    console.log('✅ Server returned a test stream key');
  } else {
    console.error('❌ Server did not return a test stream key');
  }
  
  console.log('\n===== Stream Key Verification Tests Complete =====');
}

// Execute tests
async function main() {
  try {
    await testStreamKeyVerification();
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

main();