/**
 * Replit Host Fixer for WebSockets
 * 
 * This temporary solution helps fix WebSocket connection issues on Replit
 * by manually redirecting WebSocket connection attempts to use the correct host
 * instead of the incorrect 'true' hostname that sometimes occurs.
 */

// Store the original WebSocket constructor
const OriginalWebSocket = window.WebSocket;

// Create a wrapper around the WebSocket constructor
class ReplitFixedWebSocket extends WebSocket {
  constructor(url: string | URL, protocols?: string | string[]) {
    // Convert URL object to string if needed
    const urlString = url instanceof URL ? url.toString() : url;
    
    // If we're in Replit and URL contains the problematic 'true' hostname
    if (
      window.location.hostname.includes('.repl.') || 
      window.location.hostname.includes('.replit.') || 
      window.location.hostname.includes('.kirk.replit.dev')
    ) {
      // Check if the URL has the problematic 'true' hostname
      if (urlString.includes('true:') || urlString.includes('wss://true:') || urlString.includes('ws://true:')) {
        console.log('Fixing invalid WebSocket URL:', urlString);
        
        // Get the current hostname
        const hostname = window.location.hostname;
        
        // Extract the port if any (usually for HMR it's 24678)
        const port = urlString.match(/:(\d+)/)?.[1] || '24678';
        
        // Create a fixed URL
        let fixedUrl: string;
        
        if (urlString.startsWith('wss://')) {
          fixedUrl = `wss://${hostname}:${port}${urlString.split(port)[1] || ''}`;
        } else if (urlString.startsWith('ws://')) {
          fixedUrl = `ws://${hostname}:${port}${urlString.split(port)[1] || ''}`;
        } else {
          // If no protocol is specified, use the current page protocol
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          fixedUrl = `${protocol}//${hostname}:${port}${urlString.split(port)[1] || ''}`;
        }
        
        console.log('Fixed WebSocket URL:', fixedUrl);
        
        // Call the original WebSocket constructor with the fixed URL
        super(fixedUrl, protocols);
        return;
      }
    }
    
    // Call the original WebSocket constructor for normal cases
    super(urlString, protocols);
  }
}

// Override the global WebSocket constructor
window.WebSocket = ReplitFixedWebSocket as any;

export default function setupReplitHostFixer() {
  console.log('Replit WebSocket host fixer installed');
  
  // Return a cleanup function
  return () => {
    window.WebSocket = OriginalWebSocket;
    console.log('Replit WebSocket host fixer removed');
  };
}