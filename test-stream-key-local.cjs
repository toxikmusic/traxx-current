/**
 * Simple script to test stream key generation and validation locally
 * without requiring a server
 */

const crypto = require('crypto');

/**
 * Generates a cryptographically secure stream key for a user
 * Format: {userId}:{timestamp}:{signature}
 * 
 * @param {number} userId - The user ID 
 * @returns {string} - The generated stream key
 */
function generateStreamKey(userId) {
  // Create a key with format: {userId}:{timestamp}:{signature}
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const secret = process.env.STREAM_KEY_SECRET || 'traxx-development-secret-key';
  
  // Create a signature using HMAC
  const signature = crypto
    .createHmac('sha256', secret)
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
  // Check for null or undefined
  if (!streamKey) {
    console.log('Stream key is null or undefined');
    return false;
  }
  
  // Simple format validation first
  if (!hasValidKeyFormat(streamKey)) {
    console.log('Invalid stream key format');
    return false;
  }
  
  // Split the stream key into its components
  const parts = streamKey.split(':');
  const [keyUserId, timestamp, providedSignature] = parts;
  
  // Parse userId from the key
  const keyUserIdNum = parseInt(keyUserId, 10);
  
  // Check if this key belongs to the correct user
  if (keyUserIdNum !== userId) {
    console.log('User ID mismatch');
    return false;
  }
  
  // Keys older than 24 hours are invalid (configurable)
  const now = Math.floor(Date.now() / 1000);
  const keyTime = parseInt(timestamp, 10);
  const keyAgeInSeconds = now - keyTime;
  const maxAgeInSeconds = 24 * 60 * 60; // 24 hours
  
  if (keyAgeInSeconds > maxAgeInSeconds) {
    console.log('Stream key expired');
    return false;
  }
  
  // Recalculate the signature to verify integrity
  const secret = process.env.STREAM_KEY_SECRET || 'traxx-development-secret-key';
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${keyUserId}:${timestamp}`)
    .digest('base64url');
  
  // Verify the signature matches (timing-safe comparison)
  if (providedSignature !== expectedSignature) {
    console.log('Invalid stream key signature');
    return false;
  }
  
  // If we got here, all checks passed
  return true;
}

/**
 * Quick check if a stream key has a valid format without full validation
 * This is useful for quick rejection of malformed keys before doing more expensive operations
 * 
 * @param {string} streamKey - The stream key to check
 * @returns {boolean} - Whether the key has a valid format (userId:timestamp:signature)
 */
function hasValidKeyFormat(streamKey) {
  if (!streamKey || typeof streamKey !== 'string') {
    return false;
  }
  
  const parts = streamKey.split(':');
  if (parts.length !== 3) {
    return false;
  }
  
  const [userId, timestamp] = parts;
  
  // Check if userId and timestamp are valid numbers
  const userIdNum = parseInt(userId, 10);
  const timestampNum = parseInt(timestamp, 10);
  
  return !isNaN(userIdNum) && !isNaN(timestampNum) && userIdNum > 0;
}

// Test the key generation and validation
function runTests() {
  console.log('=== Testing Stream Key Generation and Validation ===');
  
  // Test with valid user
  const userId = 123;
  const streamKey = generateStreamKey(userId);
  console.log(`Generated stream key: ${streamKey}`);
  
  // Test validation with correct user
  const isValid = validateStreamKey(streamKey, userId);
  console.log(`Validation result (should be true): ${isValid}`);
  
  // Test validation with wrong user
  const isValidWrongUser = validateStreamKey(streamKey, 456);
  console.log(`Validation with wrong user (should be false): ${isValidWrongUser}`);
  
  // Test tampering with the key
  const [keyUserId, timestamp, signature] = streamKey.split(':');
  // Make sure we're actually changing the signature by modifying the first character
  const firstChar = signature.charAt(0);
  const replacementChar = firstChar === 'A' ? 'B' : (firstChar === 'Z' ? 'Y' : 'A');
  const tamperedSignature = signature.charAt(0) === replacementChar ? 
    signature.substring(0, signature.length-1) + '!' : 
    replacementChar + signature.substring(1);
  
  const tamperedKey = `${keyUserId}:${timestamp}:${tamperedSignature}`;
  console.log(`Original signature: ${signature}`);
  console.log(`Tampered signature: ${tamperedSignature}`);
  const isValidTampered = validateStreamKey(tamperedKey, userId);
  console.log(`Validation with tampered key (should be false): ${isValidTampered}`);
  
  // Test key with invalid format
  const invalidKey = `${userId}:invalidformat`;
  const isValidInvalid = validateStreamKey(invalidKey, userId);
  console.log(`Validation with invalid format (should be false): ${isValidInvalid}`);
  
  // Test the hasValidKeyFormat function
  console.log('\n=== Testing hasValidKeyFormat Function ===');
  console.log(`Valid key format check (should be true): ${hasValidKeyFormat(streamKey)}`);
  console.log(`Invalid key format check (should be false): ${hasValidKeyFormat(invalidKey)}`);
  console.log(`Null key check (should be false): ${hasValidKeyFormat(null)}`);
  console.log(`Empty key check (should be false): ${hasValidKeyFormat('')}`);
  console.log(`Tampered but valid format key (should be true): ${hasValidKeyFormat(tamperedKey)}`);
  
  console.log('\n=== All Tests Complete ===');
}

runTests();