#!/usr/bin/env node

// Run the CommonJS version of the diagnostic server
const { spawn } = require('child_process');

console.log('Starting CommonJS diagnostic server...');

// Run node with our diagnostic server
const proc = spawn('node', ['diagnostic-server.cjs'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '5000'
  }
});

proc.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code || 0);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  proc.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  proc.kill('SIGTERM');
});