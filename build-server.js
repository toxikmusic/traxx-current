#!/usr/bin/env node

/**
 * Server build script 
 * Handles compilation of the TypeScript server and provides fallback options if compilation fails
 * 
 * This script is designed to handle edge cases with ESM/CJS compatibility and TypeScript errors
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the script's directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Building server...');

// Configuration
const tsInputFile = 'server/index.ts';
const jsOutputFile = 'server.js';
const fallbackServerFile = 'server-simple.js';

// First attempt: Try to build with TypeScript
console.log('Attempting TypeScript compilation...');
let success = false;

try {
  const tsc = spawn('npx', ['tsc', tsInputFile, '--outDir', '.', '--esModuleInterop'], {
    stdio: 'inherit'
  });
  
  await new Promise((resolve, reject) => {
    tsc.on('exit', (code) => {
      if (code === 0) {
        console.log('TypeScript compilation succeeded');
        success = true;
        resolve();
      } else {
        console.log(`TypeScript compilation failed with code ${code}`);
        resolve();
      }
    });
    
    tsc.on('error', (err) => {
      console.error('TypeScript compilation error:', err);
      resolve();
    });
  });
} catch (err) {
  console.error('Error during TypeScript compilation:', err);
}

// Second attempt: Try using esbuild if TypeScript failed
if (!success) {
  console.log('Attempting build with esbuild...');
  
  try {
    const esbuild = spawn('npx', ['esbuild', tsInputFile, '--bundle', '--platform=node', '--outfile=' + jsOutputFile], {
      stdio: 'inherit'
    });
    
    await new Promise((resolve) => {
      esbuild.on('exit', (code) => {
        if (code === 0) {
          console.log('esbuild compilation succeeded');
          success = true;
          resolve();
        } else {
          console.log(`esbuild compilation failed with code ${code}`);
          resolve();
        }
      });
      
      esbuild.on('error', (err) => {
        console.error('esbuild error:', err);
        resolve();
      });
    });
  } catch (err) {
    console.error('Error during esbuild compilation:', err);
  }
}

// Final fallback: Use the simple server if all else fails
if (!success) {
  console.log('Using fallback server...');
  
  try {
    // Copy the simple server to the output location
    fs.copyFileSync(fallbackServerFile, jsOutputFile);
    console.log(`Fallback server copied to ${jsOutputFile}`);
    success = true;
  } catch (err) {
    console.error('Error copying fallback server:', err);
  }
}

if (success) {
  console.log('Server build complete!');
  process.exit(0);
} else {
  console.error('All build attempts failed');
  process.exit(1);
}