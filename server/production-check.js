/**
 * Utility functions for detecting Replit environment and production settings
 * 
 * This file provides utilities for detecting whether the application is running
 * on Replit and in production mode, as well as extracting environment information.
 */

/**
 * Check if running in Replit environment
 * 
 * @returns {boolean} Whether we're running in Replit
 */
const isReplitEnvironment = () => {
  return !!(
    process.env.REPL_ID ||
    process.env.REPL_SLUG ||
    process.env.REPL_OWNER ||
    process.env.REPLIT_DEPLOYMENT_ID ||
    process.env.REPL_DEPLOYMENT
  );
};

/**
 * Check if we're running in production mode
 * 
 * @returns {boolean} Whether we're in production
 */
const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Get the Replit deployment ID if available
 * 
 * @returns {string|null} Deployment ID or null if not available
 */
const getDeploymentId = () => {
  return process.env.REPLIT_DEPLOYMENT_ID || null;
};

/**
 * Get the Replit host domain
 * 
 * @returns {string|null} Host domain or null if not available
 */
const getReplitHostDomain = () => {
  if (isReplitEnvironment()) {
    // Check for explicitly configured domain first
    if (process.env.REPLIT_HOST) {
      return process.env.REPLIT_HOST;
    }
    
    // Get from deployment ID if available
    if (process.env.REPLIT_DEPLOYMENT_ID) {
      return `${process.env.REPLIT_DEPLOYMENT_ID}.replit.app`;
    }
    
    // Try to construct from REPL_SLUG and REPL_OWNER
    if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
      return `${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.repl.co`;
    }
  }
  
  return null;
};

/**
 * Get complete environment information
 * 
 * @returns {Object} Environment information
 */
const getEnvironmentInfo = () => {
  return {
    isReplit: isReplitEnvironment(),
    isProduction: isProduction(),
    deploymentId: getDeploymentId(),
    replitHost: getReplitHostDomain(),
    replId: process.env.REPL_ID || null,
    replSlug: process.env.REPL_SLUG || null,
    replOwner: process.env.REPL_OWNER || null,
    nodeEnv: process.env.NODE_ENV || 'development'
  };
};

module.exports = {
  isReplitEnvironment,
  isProduction,
  getDeploymentId,
  getReplitHostDomain,
  getEnvironmentInfo
};