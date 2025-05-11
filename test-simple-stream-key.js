/**
 * Simple test script for secure stream key generation and validation
 */

import crypto from 'crypto';

// Configuration for testing
const userId = 123;
const SECRET_KEY = process.env.STREAM_KEY_SECRET || 'traxx-development-secret-key';

/**
 * Generates a cryptographically secure stream key for a user
 * 
 * @param {number} userId - The user ID 
 * @returns {string} - A secure stream key in the format userId:timestamp:signature
 */
function generateStreamKey(userId) {
  // Create a key with format: {userId}:{timestamp}:{signature}
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
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
 * @param {number} [expiryHours=24] - Optional custom expiry time in hours
 * @returns {boolean} - Whether the key is valid for this user
 */
function validateStreamKey(streamKey, userId, expiryHours = 24) {
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
    
    // Check key expiry if enabled
    if (expiryHours > 0) {
      const now = Math.floor(Date.now() / 1000);
      const keyTime = parseInt(timestamp, 10);
      const keyAgeInSeconds = now - keyTime;
      const maxAgeInSeconds = expiryHours * 60 * 60;
      
      if (keyAgeInSeconds > maxAgeInSeconds) {
        console.log('Stream key expired');
        return false;
      }
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

// Test key generation
console.log('=== Testing Stream Key Generation ===');
const streamKey = generateStreamKey(userId);
console.log(`Generated stream key: ${streamKey}`);

// Test key validation
console.log('\n=== Testing Stream Key Validation ===');
const isValid = validateStreamKey(streamKey, userId);
console.log(`Stream key is valid: ${isValid}`);

// Test validation with wrong user ID
console.log('\n=== Testing Validation with Wrong User ID ===');
const isValidWrongUser = validateStreamKey(streamKey, userId + 1);
console.log(`Stream key is valid for wrong user: ${isValidWrongUser}`);

// Test tampered key
console.log('\n=== Testing Tampered Stream Key ===');
const tamperedKey = streamKey.substring(0, streamKey.length - 5) + 'XXXXX';
const isTamperedValid = validateStreamKey(tamperedKey, userId);
console.log(`Tampered stream key is valid: ${isTamperedValid}`);

// Test expired key
console.log('\n=== Testing Expired Stream Key ===');
// Create a key with a timestamp from 2 days ago
const twoDaysAgo = Math.floor(Date.now() / 1000) - (48 * 60 * 60);
const expiredSignature = crypto
  .createHmac('sha256', SECRET_KEY)
  .update(`${userId}:${twoDaysAgo}`)
  .digest('base64url');
const expiredKey = `${userId}:${twoDaysAgo}:${expiredSignature}`;
const isExpiredValid = validateStreamKey(expiredKey, userId);
console.log(`Expired stream key is valid: ${isExpiredValid}`);

console.log('\n=== All Tests Complete ===');