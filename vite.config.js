import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import themePlugin from '@replit/vite-plugin-shadcn-theme-json';
import path, { dirname } from 'path';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load local config override if it exists
let localConfig = {};
try {
  if (fs.existsSync('./vite.config.local.js')) {
    const module = await import('./vite.config.local.js');
    localConfig = module.default || {};
    console.log('Loaded local Vite configuration');
  }
} catch (error) {
  console.error('Error loading local config:', error);
}

export default defineConfig({
  server: {
    host: '0.0.0.0',
    strictPort: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
    },
    hmr: {
      clientPort: process.env.VITE_HMR_CLIENT_PORT ? Number(process.env.VITE_HMR_CLIENT_PORT) : undefined,
      overlay: false,
    },
    watch: {
      usePolling: true,
    },
    fs: {
      strict: false,
      allow: ['..'],
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    },
    // Allow all hosts, includes Replit domains and all subdomains
    allowedHosts: [
      'all',
      '.replit.com',
      '.repl.co', 
      '.repl.dev',
      '.replit.dev',
      '.replit.app',
      '.id.repl.co',
      '.repl.run',
      '.*.repl.co',
      '.*.replit.com',
      '.*.replit.dev',
      '.kirk.replit.dev',
      'localhost',
      '0.0.0.0',
      '127.0.0.1',
      // Adding specific pattern for Replit dynamic hosts
      '*.kirk.replit.dev',
      '*-00-*.kirk.replit.dev',
      '*-*-*-*-*-00-*.kirk.replit.dev',
      // Adding specific host from environment variable if available
      ...(process.env.VITE_SPECIFIC_HOST ? [process.env.VITE_SPECIFIC_HOST] : []),
      // Additional hosts from local config if available
      ...(localConfig.server?.allowedHosts || []),
      '05f4d4a1-c19d-4aea-a667-82a3e8300460-00-1qphi7t8vwh9f.kirk.replit.dev',
    ],
  },
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});