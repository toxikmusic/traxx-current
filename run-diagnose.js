#!/usr/bin/env node

// Run the ESM version of the diagnostic server
import { spawn } from 'child_process';

console.log('Starting ESM diagnostic server...');

// Run node with our diagnostic server
const proc = spawn('node', ['diagnostic-server-esm.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '5001'
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