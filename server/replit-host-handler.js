/**
 * Replit Host Handler
 * 
 * This file contains utilities to parse host information from error messages
 * and dynamically update the configuration to allow the specific host.
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract hostname from Vite error message
 * 
 * @param {string} errorMessage - The error message from Vite
 * @returns {string|null} - The extracted hostname or null if not found
 */
function extractHostnameFromError(errorMessage) {
  // Common error pattern in Vite: 
  // "Host check failed. Allowed hosts: (none) Actual host: 05f4d4a1-c19d-4aea-a667-82a3e8300460-00-1qphi7t8vwh9f.kirk.replit.dev"
  // or "Request from unauthorized origin: 05f4d4a1-c19d-4aea-a667-82a3e8300460-00-1qphi7t8vwh9f.kirk.replit.dev"
  
  if (!errorMessage) return null;
  
  // Use regex to extract the hostname after "Actual host: " or "unauthorized origin: "
  const hostMatch = errorMessage.match(/(?:Actual host:|unauthorized origin:)\s+([^\s]+)/i);
  if (hostMatch && hostMatch[1]) {
    return hostMatch[1];
  }
  
  // Alternative pattern matching
  const hostPattern = /([a-z0-9-]+(?:-00-[a-z0-9]+)?\.kirk\.replit\.dev)/i;
  const match = errorMessage.match(hostPattern);
  return match ? match[1] : null;
}

/**
 * Update the vite.config.local.js file with the new host
 * 
 * @param {string} hostname - The hostname to add to allowed hosts
 * @returns {boolean} - Whether the update was successful
 */
function updateViteConfigWithHost(hostname) {
  if (!hostname) return false;
  
  const configPath = path.resolve(process.cwd(), 'vite.config.local.js');
  
  try {
    // Create config file if it doesn't exist
    if (!fs.existsSync(configPath)) {
      const initialConfig = `/**
 * Local Vite configuration override with specific host information
 * This file is loaded by vite.config.js
 */

export default {
  server: {
    allowedHosts: [
      'all',
      '${hostname}'
    ]
  }
};`;
      fs.writeFileSync(configPath, initialConfig, 'utf8');
      return true;
    }

    // Read existing config
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Check if hostname already in file
    if (configContent.includes(hostname)) {
      return false; // Already added
    }
    
    // Insert the new host into the allowedHosts array
    if (configContent.includes('allowedHosts:')) {
      configContent = configContent.replace(
        /(allowedHosts:\s*\[\s*)('all'|"all")/,
        `$1$2,\n      '${hostname}'`
      );
    } else {
      // If allowedHosts not found, add it to server config
      configContent = configContent.replace(
        /(server:\s*\{)/,
        `$1\n    allowedHosts: ['all', '${hostname}'],`
      );
    }
    
    fs.writeFileSync(configPath, configContent, 'utf8');
    return true;
  } catch (error) {
    console.error('Failed to update Vite config:', error);
    return false;
  }
}

/**
 * Check if an error is related to host check and handle it
 * 
 * @param {Error} error - The error to analyze
 * @returns {boolean} - Whether the error was handled
 */
function handlePotentialHostError(error) {
  if (!error || !error.message) return false;
  
  // Check if this is a host-related error
  const isHostError = error.message.includes('Host check failed') || 
                      error.message.includes('unauthorized origin') ||
                      error.message.includes('403 Forbidden');
  
  if (!isHostError) return false;
  
  // Extract the hostname from the error
  const hostname = extractHostnameFromError(error.message);
  if (!hostname) return false;
  
  // Update the config with the new host
  const updated = updateViteConfigWithHost(hostname);
  
  if (updated) {
    console.log(`Added host "${hostname}" to allowed hosts in vite.config.local.js`);
    console.log('Please restart the server for changes to take effect');
    
    // Also add to environment
    process.env.VITE_SPECIFIC_HOST = hostname;
  }
  
  return updated;
}

module.exports = {
  extractHostnameFromError,
  updateViteConfigWithHost,
  handlePotentialHostError
};