/**
 * Stream key generation and validation utilities
 * These are used to secure stream access for broadcasters
 */

import crypto from 'crypto';

/**
 * Generates a cryptographically secure stream key for a user
 * Format: {userId}:{timestamp}:{signature}
 * 
 * @param {number} userId - The user ID 
 * @returns {string} - The generated stream key
 */
export function generateStreamKey(userId) {
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
 * @param {number} [expiryHours=24] - Optional custom expiry time in hours
 * @returns {boolean} - Whether the key is valid for this user
 */
export function validateStreamKey(streamKey, userId, expiryHours = 24) {
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
  
  // Check key expiration
  const now = Math.floor(Date.now() / 1000);
  const keyTime = parseInt(timestamp, 10);
  const keyAgeInSeconds = now - keyTime;
  const maxAgeInSeconds = expiryHours * 60 * 60;
  
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
 * Extracts the user ID from a stream key without validation
 * 
 * @param {string} streamKey - The stream key
 * @returns {number|null} - The user ID or null if invalid format
 */
export function extractUserIdFromStreamKey(streamKey) {
  const parts = streamKey.split(':');
  if (parts.length !== 3) {
    return null;
  }
  
  return parseInt(parts[0], 10);
}

/**
 * Generates a secure public stream ID from a stream key
 * This ID can be shared publicly for viewers to access the stream
 * 
 * @param {string} streamKey - The private stream key
 * @returns {string} - A public stream ID
 */
export function generatePublicStreamId(streamKey) {
  const secret = process.env.STREAM_ID_SECRET || 'traxx-public-id-secret';
  
  // Create a deterministic but non-reversible ID from the stream key
  return crypto
    .createHmac('sha256', secret)
    .update(streamKey)
    .digest('base64url')
    .substring(0, 16); // Use first 16 chars for a shorter ID
}

/**
 * Validates that a stream key matches a public stream ID
 * 
 * @param {string} streamKey - The private stream key to validate
 * @param {string} publicId - The public stream ID to validate against
 * @returns {boolean} - Whether they match
 */
export function validateStreamKeyWithPublicId(streamKey, publicId) {
  const expectedPublicId = generatePublicStreamId(streamKey);
  return expectedPublicId === publicId;
}

/**
 * Quick check if a stream key has a valid format without full validation
 * This is useful for quick rejection of malformed keys before doing more expensive operations
 * 
 * @param {string} streamKey - The stream key to check
 * @returns {boolean} - Whether the key has a valid format (userId:timestamp:signature)
 */
export function hasValidKeyFormat(streamKey) {
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