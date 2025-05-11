/**
 * Production environment detection module
 * 
 * This module provides utilities to detect if the application is running in production mode,
 * particularly in the Replit environment which has special host handling requirements.
 */

// Detect if we're in a Replit environment
export const isReplitEnvironment = (): boolean => {
  return !!(process.env.REPL_ID || process.env.REPL_SLUG || process.env.REPL_OWNER);
};

// Detect if we're in a deployed production environment
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production' || 
         process.env.REPLIT_DEPLOYMENT === 'true' ||
         !!process.env.REPLIT_DEPLOYMENT_ID;
};

// Get the current deployment ID if available
export const getDeploymentId = (): string | null => {
  return process.env.REPLIT_DEPLOYMENT_ID || null;
};

// Get the Replit host domain for the current environment
export const getReplitHostDomain = (): string | null => {
  if (!isReplitEnvironment()) {
    return null;
  }
  
  const slug = process.env.REPL_SLUG;
  const owner = process.env.REPL_OWNER;
  
  if (slug && owner) {
    // Standard Replit domain
    return `${slug}-${owner}.repl.co`;
  }
  
  // For deployments and other cases
  return process.env.REPLIT_DOMAIN || null;
};

// Get detailed environment information
export const getEnvironmentInfo = (): Record<string, any> => {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: isProduction(),
    isReplitEnvironment: isReplitEnvironment(),
    deploymentId: getDeploymentId(),
    replitHostDomain: getReplitHostDomain(),
    replitId: process.env.REPL_ID || null,
    replitSlug: process.env.REPL_SLUG || null,
    replitOwner: process.env.REPL_OWNER || null,
    replitDomain: process.env.REPLIT_DOMAIN || null,
  };
};

export default {
  isReplitEnvironment,
  isProduction,
  getDeploymentId,
  getReplitHostDomain,
  getEnvironmentInfo
};