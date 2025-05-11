// Pure JavaScript version to isolate issues
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module specific setup
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

// Simple middleware for logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Basic API endpoints for testing
app.get('/api/server-info', (req, res) => {
  res.json({
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    pid: process.pid,
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Static files serving
const staticPath = path.join(process.cwd(), 'dist');
app.use(express.static(staticPath));

// Catch-all route that returns index.html
app.use('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Start the server
const port = parseInt(process.env.PORT || '5000', 10);
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Node.js version: ${process.version}`);
});