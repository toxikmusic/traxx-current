#!/usr/bin/env node

// Compile and run simple server
import { spawn } from 'child_process';
import fs from 'fs';

console.log('Compiling and running simple TypeScript server...');

// First, ensure TypeScript is compiled to JavaScript
console.log('Compiling TypeScript...');
const tsc = spawn('npx', ['tsc', 'server-simple.ts', '--esModuleInterop'], {
  stdio: 'inherit'
});

tsc.on('exit', (code) => {
  if (code !== 0) {
    console.error('TypeScript compilation failed with code', code);
    process.exit(code || 1);
  }
  
  console.log('TypeScript compilation succeeded, starting server...');
  
  // Run the compiled server
  const proc = spawn('node', ['server-simple.js'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: '5002'
    }
  });
  
  proc.on('exit', (serverCode) => {
    console.log(`Server exited with code ${serverCode}`);
    process.exit(serverCode || 0);
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
});

console.log('Setup complete, waiting for TypeScript compilation to finish...');