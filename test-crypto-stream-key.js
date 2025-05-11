/**
 * Test script to verify our cryptographic stream key generation and validation
 */

import crypto from 'crypto';

// Configuration for testing
const SECRET_KEY = 'traxx-development-secret-key';
const TEST_USER_ID = 123;
const DIFFERENT_USER_ID = 456;

/**
 * Generates a cryptographically secure stream key for a user
 * Format: {userId}:{timestamp}:{signature}
 * 
 * @param {number} userId - The user ID
 * @returns {string} - The generated stream key
 */
function generateStreamKey(userId) {
  // Create a key with format: {userId}:{timestamp}:{signature}
  const timestamp = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
  
  // Create a signature using HMAC with base64url encoding for URL safety
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${userId}:${timestamp}`)
    .digest('base64url');
  
  // Combine into a stream key
  return `${userId}:${timestamp}:${signature}`;
}

/**
 * Validates a stream key
 * 
 * @param {string} streamKey - The stream key to validate
 * @param {number} userId - The user ID to validate against
 * @returns {boolean} - Whether the key is valid for this user
 */
function validateStreamKey(streamKey, userId) {
  try {
    // Split the stream key into its components
    const parts = streamKey.split(':');
    if (parts.length !== 3) {
      console.log('Invalid stream key format');
      return false;
    }
    
    const [keyUserId, timestamp, signature] = parts;
    
    // Check if this key belongs to the correct user
    if (parseInt(keyUserId, 10) !== userId) {
      console.log(`User ID mismatch: key belongs to user ${keyUserId}, not user ${userId}`);
      return false;
    }
    
    // Calculate expected signature for verification
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(`${keyUserId}:${timestamp}`)
      .digest('base64url');
    
    // Verify the signature matches
    if (signature !== expectedSignature) {
      console.log('Invalid stream key signature');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating stream key:', error);
    return false;
  }
}

// Run tests
console.log('===== Crypto Stream Key Test Suite =====\n');

// Test 1: Generate and verify a valid key
console.log('Test 1: Generate and validate a stream key');
const streamKey = generateStreamKey(TEST_USER_ID);
console.log(`Generated key: ${streamKey}`);
console.log(`Valid: ${validateStreamKey(streamKey, TEST_USER_ID) ? '✅ Yes' : '❌ No'}`);

// Test 2: Verify the key isn't valid for a different user
console.log('\nTest 2: Validate key for wrong user');
console.log(`Valid for user ${DIFFERENT_USER_ID}: ${validateStreamKey(streamKey, DIFFERENT_USER_ID) ? '❌ Yes (Security Issue!)' : '✅ No (Correctly rejected)'}`);

// Test 3: Generate a malformed key
console.log('\nTest 3: Test with malformed key');
const malformedKey = streamKey.substring(0, streamKey.length - 10);
console.log(`Malformed key: ${malformedKey}`);
console.log(`Valid: ${validateStreamKey(malformedKey, TEST_USER_ID) ? '❌ Yes (Security Issue!)' : '✅ No (Correctly rejected)'}`);

// Test 4: Tamper with key signature
console.log('\nTest 4: Test with tampered signature');
const [userId, timestamp, signature] = streamKey.split(':');
const tamperedKey = `${userId}:${timestamp}:${signature.replace('A', 'B')}`;
console.log(`Tampered key: ${tamperedKey}`);
console.log(`Valid: ${validateStreamKey(tamperedKey, TEST_USER_ID) ? '❌ Yes (Security Issue!)' : '✅ No (Correctly rejected)'}`);

// Test 5: Tamper with user ID
console.log('\nTest 5: Test with tampered user ID');
const tamperedUserKey = `${DIFFERENT_USER_ID}:${timestamp}:${signature}`;
console.log(`Tampered user key: ${tamperedUserKey}`);
console.log(`Valid for original user: ${validateStreamKey(tamperedUserKey, TEST_USER_ID) ? '❌ Yes (Security Issue!)' : '✅ No (Correctly rejected)'}`);
console.log(`Valid for tampered user: ${validateStreamKey(tamperedUserKey, DIFFERENT_USER_ID) ? '❌ Yes (Security Issue!)' : '✅ No (Correctly rejected)'}`);

// Test 6: Multiple keys for same user
console.log('\nTest 6: Generate multiple keys for same user');
const key1 = generateStreamKey(TEST_USER_ID);
const key2 = generateStreamKey(TEST_USER_ID);
console.log(`Key 1: ${key1}`);
console.log(`Key 2: ${key2}`);
console.log(`Different keys: ${key1 !== key2 ? '✅ Yes' : '❌ No'}`);
console.log(`Key 1 valid: ${validateStreamKey(key1, TEST_USER_ID) ? '✅ Yes' : '❌ No'}`);
console.log(`Key 2 valid: ${validateStreamKey(key2, TEST_USER_ID) ? '✅ Yes' : '❌ No'}`);

console.log('\n===== Test Suite Complete =====');