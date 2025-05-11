/**
 * Test script for health check endpoints
 */

import fetch from 'node-fetch';

// Configuration
const BASE_URL = 'http://localhost:5002';

// Basic health check endpoint
async function testBasicHealthCheck() {
  console.log('Testing basic health check endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/health-check`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response data:', data);
    
    if (response.status === 200 && data.status === 'ok') {
      console.log('✅ Basic health check passed');
      return true;
    } else {
      console.error('❌ Basic health check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error accessing health check endpoint:', error);
    return false;
  }
}

// Standard health endpoint (with more details)
async function testStandardHealth() {
  console.log('\nTesting standard health endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response data:', data);
    
    if (response.status === 200 && data.services) {
      console.log('✅ Standard health check passed');
      return true;
    } else {
      console.log('⚠️ Standard health check endpoint may not be implemented yet');
      return false;
    }
  } catch (error) {
    console.log('⚠️ Standard health endpoint not implemented');
    return false;
  }
}

// Detailed health status
async function testDetailedHealth() {
  console.log('\nTesting detailed health status endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/health/detailed`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response data:', data);
    
    if (response.status === 200) {
      console.log('✅ Detailed health check passed');
      return true;
    } else {
      console.log('⚠️ Detailed health check endpoint may not be implemented yet');
      return false;
    }
  } catch (error) {
    console.log('⚠️ Detailed health endpoint not implemented');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('===== Testing Health Check Endpoints =====\n');
  
  try {
    const basicResult = await testBasicHealthCheck();
    const standardResult = await testStandardHealth();
    const detailedResult = await testDetailedHealth();
    
    console.log('\n===== Health Check Test Results =====');
    console.log(`Basic Health Check: ${basicResult ? 'PASSED ✅' : 'FAILED ❌'}`);
    console.log(`Standard Health Check: ${standardResult ? 'PASSED ✅' : 'NOT IMPLEMENTED ⚠️'}`);
    console.log(`Detailed Health Check: ${detailedResult ? 'PASSED ✅' : 'NOT IMPLEMENTED ⚠️'}`);
    
    if (basicResult) {
      console.log('\n✅ Basic API connectivity verified');
    } else {
      console.error('\n❌ API connectivity test failed');
    }
  } catch (error) {
    console.error('\n❌ Error running tests:', error);
  }
}

// Execute tests
runTests();