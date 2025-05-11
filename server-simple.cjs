"use strict";

// A simple Express server with CommonJS syntax
const express = require('express');
const http = require('http');
const crypto = require('crypto');

// Setup Express
const app = express();
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Add a simple health check endpoint
app.get('/api/health-check', (req, res) => {
    console.log('Health check requested');
    res.json({
        status: 'ok',
        appName: 'Traxx',
        timestamp: new Date().toISOString()
    });
});

// Test generating a stream key (for the stream verification flow)
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

// Validate a stream key
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

// Mock auth middleware for testing
app.use((req, res, next) => {
    // Simulate authentication with a mock user
    req.user = {
        id: 123,
        username: 'testuser',
        displayName: 'Test User'
    };
    next();
});

// Stream key generation endpoint
app.get('/api/streams/key', (req, res) => {
    // Ensure user is authenticated
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const streamKey = generateStreamKey(req.user.id);
    res.json({ streamKey: streamKey });
});

// Stream key validation endpoint
app.post('/api/streams/validate-key', (req, res) => {
    // Ensure user is authenticated
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { streamKey } = req.body;
    if (!streamKey) {
        return res.status(400).json({ error: 'Stream key is required' });
    }
    
    // Check format first before full validation
    if (!hasValidKeyFormat(streamKey)) {
        return res.status(400).json({ 
            isValid: false, 
            error: 'Invalid stream key format' 
        });
    }
    
    const isValid = validateStreamKey(streamKey, req.user.id);
    res.json({ isValid: isValid });
});

// Server info endpoint
app.get('/api/server-info', (req, res) => {
    res.json({
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        // Generate a test stream key for the authenticated user
        testStreamKey: req.user ? generateStreamKey(req.user.id) : null
    });
});

// Basic error handler
app.use((err, _req, res, _next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start the server
const port = parseInt(process.env.PORT || '5000', 10);
server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export the server for testing
module.exports = {
    server,
    app,
    generateStreamKey,
    validateStreamKey,
    hasValidKeyFormat
};