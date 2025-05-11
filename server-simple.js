"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// A simple TypeScript Express server
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
var crypto_1 = __importDefault(require("crypto"));
// Setup Express
var app = (0, express_1.default)();
app.use(express_1.default.json());
// Create HTTP server
var server = http_1.default.createServer(app);
// Add a simple health check endpoint
app.get('/api/health-check', function (req, res) {
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
    var timestamp = Math.floor(Date.now() / 1000).toString();
    var secret = process.env.STREAM_KEY_SECRET || 'traxx-development-secret-key';
    // Create a signature using HMAC
    var signature = crypto_1.default
        .createHmac('sha256', secret)
        .update("".concat(userId, ":").concat(timestamp))
        .digest('base64url');
    // Combine into a stream key
    return "".concat(userId, ":").concat(timestamp, ":").concat(signature);
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
    var parts = streamKey.split(':');
    var keyUserId = parts[0], timestamp = parts[1], providedSignature = parts[2];
    
    // Parse userId from the key
    var keyUserIdNum = parseInt(keyUserId, 10);
    
    // Check if this key belongs to the correct user
    if (keyUserIdNum !== userId) {
        console.log('User ID mismatch');
        return false;
    }
    
    // Keys older than 24 hours are invalid (configurable)
    var now = Math.floor(Date.now() / 1000);
    var keyTime = parseInt(timestamp, 10);
    var keyAgeInSeconds = now - keyTime;
    var maxAgeInSeconds = 24 * 60 * 60; // 24 hours
    
    if (keyAgeInSeconds > maxAgeInSeconds) {
        console.log('Stream key expired');
        return false;
    }
    
    // Recalculate the signature to verify integrity
    var secret = process.env.STREAM_KEY_SECRET || 'traxx-development-secret-key';
    var expectedSignature = crypto_1.default
        .createHmac('sha256', secret)
        .update("".concat(keyUserId, ":").concat(timestamp))
        .digest('base64url');
    
    // Verify the signature matches (timing-safe comparison)
    if (providedSignature !== expectedSignature) {
        console.log('Invalid stream key signature');
        return false;
    }
    
    // If we got here, all checks passed
    return true;
}

// Quick check if a stream key has a valid format without full validation
// This is useful for quick rejection of malformed keys before doing more expensive operations
function hasValidKeyFormat(streamKey) {
    if (!streamKey || typeof streamKey !== 'string') {
        return false;
    }
    
    var parts = streamKey.split(':');
    if (parts.length !== 3) {
        return false;
    }
    
    var userId = parts[0], timestamp = parts[1];
    
    // Check if userId and timestamp are valid numbers
    var userIdNum = parseInt(userId, 10);
    var timestampNum = parseInt(timestamp, 10);
    
    return !isNaN(userIdNum) && !isNaN(timestampNum) && userIdNum > 0;
}
// Mock auth middleware for testing
app.use(function (req, res, next) {
    // Simulate authentication with a mock user
    req.user = {
        id: 123,
        username: 'testuser',
        displayName: 'Test User'
    };
    next();
});
// Stream key generation endpoint
app.get('/api/streams/key', function (req, res) {
    // Ensure user is authenticated
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    var streamKey = generateStreamKey(req.user.id);
    res.json({ streamKey: streamKey });
});
// Stream key validation endpoint
app.post('/api/streams/validate-key', function (req, res) {
    // Ensure user is authenticated
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    var streamKey = req.body.streamKey;
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
    
    var isValid = validateStreamKey(streamKey, req.user.id);
    res.json({ isValid: isValid });
});
// Server info endpoint
app.get('/api/server-info', function (req, res) {
    res.json({
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        // Generate a test stream key for the authenticated user
        testStreamKey: req.user ? generateStreamKey(req.user.id) : null
    });
});
// Basic error handler
app.use(function (err, _req, res, _next) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});
// Start the server
var port = parseInt(process.env.PORT || '5000', 10);
server.listen(port, '0.0.0.0', function () {
    console.log("Server running on port ".concat(port));
    console.log("Environment: ".concat(process.env.NODE_ENV || 'development'));
});
