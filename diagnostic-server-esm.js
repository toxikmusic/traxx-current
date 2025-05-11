// ESM version of a diagnostic server
import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Get current directory in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Log environment details for diagnosis
function logEnvironmentDetails() {
  console.log('Node.js version:', process.version);
  console.log('Platform:', process.platform);
  console.log('Architecture:', process.arch);
  console.log('Process ID:', process.pid);
  console.log('Working directory:', process.cwd());
  console.log('Environment:', process.env.NODE_ENV || 'development');

  // Check for important files
  const rootDir = process.cwd();
  console.log('Files in root directory:', fs.readdirSync(rootDir).slice(0, 10));

  // Check for package.json properties
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    console.log('Package name:', packageJson.name);
    console.log('Package type:', packageJson.type);
    console.log('Main entry point:', packageJson.main);
    console.log('Scripts:', Object.keys(packageJson.scripts || {}));
  } catch (err) {
    console.error('Error reading package.json:', err.message);
  }
}

// Test crypto-based stream key generation
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

// Diagnostic endpoints
app.get('/api/server-info', (req, res) => {
  logEnvironmentDetails();
  
  res.json({
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    pid: process.pid,
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV || 'development',
    cwd: process.cwd(),
    packageType: JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')).type || 'unknown',
    port: process.env.PORT || '5000',
    // Test generating a stream key
    testStreamKey: generateStreamKey(123)
  });
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start the server
const port = parseInt(process.env.PORT || '5000', 10);
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Node.js version: ${process.version}`);
  
  // Log diagnostic info on startup
  logEnvironmentDetails();
});