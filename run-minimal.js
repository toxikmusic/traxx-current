// Run the minimal server for testing
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Starting minimal server...');

// Run tsx with our minimal server
const proc = spawn('npx', ['tsx', 'server/minimal-index.ts'], {
  stdio: 'inherit',
  env: process.env
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