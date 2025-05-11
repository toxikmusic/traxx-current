/**
 * Custom Vite configuration for Replit compatibility
 * 
 * This file provides specialized configuration to ensure Vite works
 * properly in the Replit environment with dynamic host names.
 */

module.exports = {
  server: {
    // Override default server options for Replit
    hmr: {
      clientPort: process.env.VITE_HMR_CLIENT_PORT ? 
                  Number(process.env.VITE_HMR_CLIENT_PORT) : undefined,
      port: process.env.VITE_HMR_PORT ? 
            Number(process.env.VITE_HMR_PORT) : undefined,
      host: true,
      overlay: false
    },
    watch: {
      usePolling: true,
    },
    // Disable host checks - important for Replit's dynamic hostnames
    host: process.env.VITE_DEV_SERVER_HOST || '0.0.0.0',
    strictPort: process.env.VITE_SERVER_STRICT_PORT === 'true' ? true : false,
    cors: process.env.VITE_CORS === 'true' ? true : false,
    fs: {
      strict: false,
      allow: ['..']
    },
    // Allow all hosts and Replit domains
    allowedHosts: [
      'all',
      '.replit.com',
      '.repl.co', 
      '.replit.dev',
      '.repl.dev',
      '.replit.app',
      '.id.repl.co',
      '.repl.run',
      '*.repl.co',
      '*.replit.com',
      '*.replit.dev',
      '*.kirk.replit.dev',
      '*-00-*.kirk.replit.dev',
      '*-*-*-*-*-00-*.kirk.replit.dev',
      // Add specific host from environment if available
      ...(process.env.VITE_SPECIFIC_HOST ? [process.env.VITE_SPECIFIC_HOST] : []),
      // Hard-coded specific host from the error message
      '05f4d4a1-c19d-4aea-a667-82a3e8300460-00-1qphi7t8vwh9f.kirk.replit.dev'
    ]
  }
};