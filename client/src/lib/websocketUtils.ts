/**
 * WebSocket utilities for handling Replit environment properly
 * 
 * This file centralizes WebSocket connection logic to ensure proper host resolution
 * in various environments including local development and Replit.
 */

// Type for WebSocket connection options
export interface WebSocketOptions {
  endpoint: string;
  queryParams?: Record<string, string>;
  timeout?: number;
}

/**
 * Get the appropriate WebSocket URL based on the current environment
 * 
 * @param options WebSocket connection options
 * @returns WebSocket connection URL
 */
export function getWebSocketUrl(options: WebSocketOptions): string {
  const { endpoint, queryParams = {} } = options;
  
  // Get protocol (wss for https, ws for http)
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  
  // Build query string
  const queryString = Object.entries(queryParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  
  // In Replit environment, we need to use API_URL if available
  // The API_URL environment variable should be set by the server
  let host = window.location.host;
  let apiHost = '';
  
  // Detect Replit environment
  const isReplit = 
    window.location.hostname.includes('.replit.dev') || 
    window.location.hostname.includes('.repl.co') ||
    window.location.hostname.includes('.replit.app') ||
    window.location.hostname.includes('.kirk.replit.dev');
  
  // Log environment for debugging
  console.log("WebSocket Environment:", {
    isReplit,
    hostname: window.location.hostname,
    protocol,
    host
  });

  // Handle potential WebSocket connection issues with Vite HMR
  if (endpoint === '/__vite_hmr' || endpoint.includes('vite-hmr')) {
    // For Vite HMR connections, use our Replit WebSocket host fixer instead
    // which is implemented in replitHostFixer.ts
    console.log("Using Vite HMR connection - letting replitHostFixer handle this");
    return `${protocol}//${host}${endpoint}${queryString ? `?${queryString}` : ''}`;
  }
  
  // For Replit, we need special handling - always use port 5000 for WebSocket connections
  if (isReplit) {
    // For Replit preview, we know the server is on the same host but port 5000
    // This assumes the Replit server is running on port 5000
    const hostParts = window.location.hostname.split(':');
    host = `${hostParts[0]}:5000`;
    console.log("Using fixed Replit host:", host);
  }
  
  // Build the WebSocket URL
  const wsUrl = `${protocol}//${host}${endpoint}${queryString ? `?${queryString}` : ''}`;
  
  // Mask sensitive data like stream keys for logging
  const maskedUrl = wsUrl.replace(/streamKey=([^&]+)/, 'streamKey=****');
  console.log(`WebSocket URL: ${maskedUrl}`);
  
  return wsUrl;
}

/**
 * Create a WebSocket connection with enhanced error handling and timeout
 * 
 * @param options WebSocket connection options
 * @returns WebSocket instance and cleanup function
 */
export function createWebSocket(options: WebSocketOptions): { 
  socket: WebSocket | null; 
  cleanup: () => void; 
} {
  const { timeout = 10000 } = options;
  const url = getWebSocketUrl(options);
  
  let socket: WebSocket | null = null;
  let timeoutId: number | null = null;
  
  try {
    socket = new WebSocket(url);
    console.log("WebSocket instance created");
    
    // Set connection timeout
    timeoutId = window.setTimeout(() => {
      if (socket && socket.readyState !== WebSocket.OPEN) {
        console.error("WebSocket connection timeout");
        socket.close();
      }
    }, timeout);
    
    // Remove timeout when connection opens
    socket.addEventListener('open', () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
      console.log("WebSocket connection established");
    });
    
  } catch (error) {
    console.error("Error creating WebSocket:", error);
  }
  
  // Return socket and cleanup function
  return {
    socket,
    cleanup: () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }
    }
  };
}