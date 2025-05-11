// Simple test for ES modules
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('ESM modules working!');
console.log('Current directory:', __dirname);